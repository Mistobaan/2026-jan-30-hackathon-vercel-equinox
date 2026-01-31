import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { month, theme, path, goals, workoutStyle, focusAreas } = await req.json()

    const goalsText = goals?.join(", ") || "general fitness"
    const focusText = focusAreas?.join(", ") || "full body"
    
    const prompt = path === "gym" 
      ? `Create a cinematic, high-end, realistic photograph of a fit, healthy person at a premium Equinox-style gym. 
         The person shows visible progress towards ${goalsText} goals, with focus on ${focusText}. 
         ${theme} theme - ${getGymDescription(month)}.
         Flattering, premium lighting. The person looks confident, healthy, and motivated.
         Style: Editorial fitness photography, aspirational, premium aesthetic.`
      : `Create a cinematic, realistic photograph of a person at home on a couch.
         The person shows signs of sedentary lifestyle and unhealthy habits.
         ${theme} theme - ${getLazyDescription(month)}.
         Duller, unflattering lighting. The person looks tired and unmotivated.
         Style: Documentary photography, realistic but not insulting.`

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: prompt,
      config: {
        responseModalities: ["image", "text"],
      },
    })

    // Extract image from the response parts
    const parts = response.candidates?.[0]?.content?.parts
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          const { data, mimeType } = part.inlineData
          return Response.json({ 
            success: true, 
            imageUrl: `data:${mimeType};base64,${data}` 
          })
        }
      }
    }

    return Response.json({ 
      success: false, 
      error: "No image generated" 
    }, { status: 500 })
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
