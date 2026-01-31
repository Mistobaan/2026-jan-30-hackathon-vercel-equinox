import { GoogleGenAI } from "@google/genai"
import { put } from "@vercel/blob"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

type ContentPart = { text: string } | { inlineData: { mimeType: string; data: string } }

async function generateWithRetry(
  contentParts: ContentPart[],
  retryCount = 0
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: [
        {
          role: "user",
          parts: contentParts
        }
      ],
      config: {
        responseModalities: ["image", "text"],
      },
    })

    // Access the response correctly
    const candidate = response.candidates?.[0]
    const parts = candidate?.content?.parts
    
    if (parts && Array.isArray(parts)) {
      for (const part of parts) {
        // Check for inlineData which contains the generated image
        const inlineData = (part as { inlineData?: { data: string; mimeType: string } }).inlineData
        if (inlineData?.data && inlineData?.mimeType) {
          return {
            data: inlineData.data,
            mimeType: inlineData.mimeType
          }
        }
      }
    }
    
    // No image in response, retry
    if (retryCount < MAX_RETRIES) {
      console.log(`[v0] No image in response, retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`)
      await sleep(RETRY_DELAY_MS)
      return generateWithRetry(contentParts, retryCount + 1)
    }
    
    return null
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isTimeout = errorMessage.includes("timeout") || 
                      errorMessage.includes("ETIMEDOUT") || 
                      errorMessage.includes("ECONNRESET") ||
                      errorMessage.includes("503") ||
                      errorMessage.includes("429")
    
    if (isTimeout && retryCount < MAX_RETRIES) {
      console.log(`[v0] Request timeout/rate limit, retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`)
      await sleep(RETRY_DELAY_MS * (retryCount + 1)) // Exponential backoff
      return generateWithRetry(contentParts, retryCount + 1)
    }
    
    throw error
  }
}

export async function POST(req: Request) {
  try {
    const { month, theme, path, goals, workoutStyle, focusAreas, userPhoto, calendarId } = await req.json()

    const goalsText = goals?.join(", ") || "general fitness"
    const focusText = focusAreas?.join(", ") || "full body"
    
    const prompt = path === "gym" 
      ? `Based on the reference photo of this person, create a cinematic, high-end photograph showing them at a premium Equinox-style gym after achieving their fitness goals. 
         Keep the person's face and identity recognizable but show them with visible progress towards ${goalsText} goals, with focus on ${focusText}. 
         ${theme} theme - ${getGymDescription(month)}.
         Flattering, premium lighting. The person looks confident, healthy, and motivated.
         Style: Editorial fitness photography, aspirational, premium aesthetic. Wearing Equinox branded workout clothes.`
      : `Based on the reference photo of this person, create a cinematic photograph showing them at home on a couch after months of inactivity.
         Keep the person's face and identity recognizable but show them with signs of sedentary lifestyle.
         ${theme} theme - ${getLazyDescription(month)}.
         Duller, unflattering lighting. The person looks tired and unmotivated.
         Style: Documentary photography, realistic but not insulting. Casual home clothes.`

    // Build content parts - include user photo if provided
    const contentParts: ContentPart[] = []
    
    // Add user photo if provided (base64 data URL)
    if (userPhoto && userPhoto.startsWith("data:")) {
      const matches = userPhoto.match(/^data:(.+);base64,(.+)$/)
      if (matches) {
        contentParts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        })
      }
    }
    
    // Add the text prompt
    contentParts.push({ text: prompt })

    // Generate image with retry logic
    const imageResult = await generateWithRetry(contentParts)
    
    if (!imageResult) {
      return Response.json({ 
        success: false, 
        error: "No image generated after retries" 
      }, { status: 500 })
    }

    // Convert base64 to buffer for blob storage
    const imageBuffer = Buffer.from(imageResult.data, "base64")
    const extension = imageResult.mimeType.split("/")[1] || "png"
    
    // Generate unique filename
    const timestamp = Date.now()
    const uniqueId = calendarId || `calendar-${timestamp}`
    const filename = `futureyou/${uniqueId}/${month.toLowerCase()}-${path}.${extension}`
    
    // Upload to Vercel Blob
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: imageResult.mimeType,
    })

    return Response.json({ 
      success: true, 
      imageUrl: blob.url,
      blobPath: filename
    })
  } catch (error) {
    console.error("[v0] Image generation error:", error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate image" 
    }, { status: 500 })
  }
}

function getGymDescription(month: string): string {
  const descriptions: Record<string, string> = {
    "January": "Early progress visible, hopeful expression, starting the fitness journey",
    "February": "Noticeable tone improvements, tighter core, confident demeanor",
    "March": "Leaner silhouette, clearer skin, energized spring vibes",
    "April": "Visible muscle definition, relaxed confidence, consistent progress",
    "May": "Athletic proportions emerging, open body language, pre-summer readiness",
    "June": "Strong fit physique, glowing skin, summer energy and social confidence",
    "July": "Peak conditioning, lean and strong, maximum confidence",
    "August": "Sustainable fitness, calm strength, balanced lifestyle",
    "September": "Sharp disciplined appearance, refined body composition",
    "October": "Defined physique, strong posture, composed confidence",
    "November": "Healthy grounded appearance, reflecting year-long progress",
    "December": "Best version achieved, fit confident fulfilled look"
  }
  return descriptions[month] || "Fit and healthy appearance"
}

function getLazyDescription(month: string): string {
  const descriptions: Record<string, string> = {
    "January": "Winter couch scene with snacks and TV, slouched posture",
    "February": "Clothes feeling tighter, lethargic mood, comfort food visible",
    "March": "Still indoors, heavier appearance, messy environment",
    "April": "Incremental weight gain visible, passive scrolling on phone",
    "May": "Self-conscious posture, emotional eating signs",
    "June": "Sluggish summer look, overheated, unhealthy food choices",
    "July": "Bloated appearance, zoning out, very low energy",
    "August": "Inactivity burnout visible, comfort eating",
    "September": "Heavier and resigned appearance, stuck in habits",
    "October": "Comfort food season indulgence, dull lighting",
    "November": "Overindulgence visible, lethargy, mild regret in expression",
    "December": "Tired and heavier, realization of missed opportunities"
  }
  return descriptions[month] || "Sedentary lifestyle appearance"
}
