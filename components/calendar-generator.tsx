"use client"

import { useState, useRef } from "react"
import { Loader2, Printer, Sparkles, ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PrintableCalendar } from "./printable-calendar"
import { MONTHS_DATA, type UserProfile } from "@/lib/store"
import { cn } from "@/lib/utils"

interface CalendarGeneratorProps {
  profile: UserProfile
  onBack: () => void
}

interface MonthImages {
  gym: string | null
  lazy: string | null
  isGenerating: boolean
}

const CURRENT_YEAR = 2026

export function CalendarGenerator({ profile, onBack }: CalendarGeneratorProps) {
  const [monthImages, setMonthImages] = useState<MonthImages[]>(
    MONTHS_DATA.map(() => ({ gym: null, lazy: null, isGenerating: false }))
  )
  const [currentPreviewMonth, setCurrentPreviewMonth] = useState(0)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const calendarRefs = useRef<(HTMLDivElement | null)[]>([])

  const generateImageForMonth = async (monthIndex: number, path: "gym" | "lazy"): Promise<string | null> => {
    const data = MONTHS_DATA[monthIndex]
    
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: data.month,
          theme: data.theme,
          path,
          goals: profile.goals,
          workoutStyle: profile.workoutStyle,
          focusAreas: profile.focusAreas,
          confidenceGoals: profile.confidenceGoals,
        }),
      })
      const result = await response.json()
      if (result.success) {
        return result.imageUrl
      }
      return null
    } catch (error) {
      console.error(`[v0] Error generating ${path} image for ${data.month}:`, error)
      return null
    }
  }

  const generateAllImages = async () => {
    setIsGeneratingAll(true)
    setGenerationProgress(0)
    
    const totalImages = MONTHS_DATA.length * 2
    let completed = 0

    for (let i = 0; i < MONTHS_DATA.length; i++) {
      // Update state to show current month is generating
      setMonthImages(prev => {
        const updated = [...prev]
        updated[i] = { ...updated[i], isGenerating: true }
        return updated
      })

      // Generate gym image
      const gymImage = await generateImageForMonth(i, "gym")
      completed++
      setGenerationProgress(Math.round((completed / totalImages) * 100))
      
      // Generate lazy image
      const lazyImage = await generateImageForMonth(i, "lazy")
      completed++
      setGenerationProgress(Math.round((completed / totalImages) * 100))

      // Update state with completed images
      setMonthImages(prev => {
        const updated = [...prev]
        updated[i] = { 
          gym: gymImage, 
          lazy: lazyImage, 
          isGenerating: false 
        }
        return updated
      })

      // Move preview to current month
      setCurrentPreviewMonth(i)
    }

    setIsGeneratingAll(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const allImagesGenerated = monthImages.every(m => m.gym && m.lazy)
  const anyImagesGenerated = monthImages.some(m => m.gym || m.lazy)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">FutureYou Calendar</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!allImagesGenerated && (
              <Button
                onClick={generateAllImages}
                disabled={isGeneratingAll}
                className="gap-2"
              >
                {isGeneratingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating... {generationProgress}%
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Generate All Months
                  </>
                )}
              </Button>
            )}
            {anyImagesGenerated && (
              <Button variant="outline" onClick={handlePrint} className="gap-2 bg-transparent">
                <Printer className="w-4 h-4" />
                Print Calendar
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 print:p-0 print:max-w-none">
        {/* Progress Bar */}
        {isGeneratingAll && (
          <div className="mb-6 print:hidden">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Generating {MONTHS_DATA[currentPreviewMonth]?.month}...
              </span>
              <span className="font-mono">{generationProgress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        {!anyImagesGenerated && !isGeneratingAll && (
          <div className="mb-8 p-6 rounded-xl bg-card border border-border text-center print:hidden">
            <h2 className="text-xl font-semibold mb-2">Generate Your 2026 Calendar</h2>
            <p className="text-muted-foreground mb-4">
              Click the button above to generate AI images for all 12 months. 
              Each month will show your Gym Path vs Lazy Path in a printable 16:9 format.
            </p>
            <p className="text-sm text-muted-foreground">
              This process may take a few minutes as each image is generated.
            </p>
          </div>
        )}

        {/* Preview Navigation */}
        {anyImagesGenerated && (
          <div className="flex items-center justify-center gap-4 mb-6 print:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPreviewMonth(prev => Math.max(0, prev - 1))}
              disabled={currentPreviewMonth === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {MONTHS_DATA[currentPreviewMonth]?.month} {CURRENT_YEAR}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPreviewMonth(prev => Math.min(11, prev + 1))}
              disabled={currentPreviewMonth === 11}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Single Calendar Preview */}
        {anyImagesGenerated && (
          <div className="mb-8 print:hidden">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-border">
              <PrintableCalendar
                month={currentPreviewMonth}
                year={CURRENT_YEAR}
                gymImage={monthImages[currentPreviewMonth]?.gym}
                lazyImage={monthImages[currentPreviewMonth]?.lazy}
                monthName={MONTHS_DATA[currentPreviewMonth].month}
                theme={MONTHS_DATA[currentPreviewMonth].theme}
              />
            </div>
            {monthImages[currentPreviewMonth]?.isGenerating && (
              <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating images...</span>
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Grid */}
        {anyImagesGenerated && (
          <div className="print:hidden">
            <h3 className="font-semibold mb-4">All Months</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {MONTHS_DATA.map((data, idx) => (
                <button
                  key={data.month}
                  onClick={() => setCurrentPreviewMonth(idx)}
                  className={cn(
                    "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                    currentPreviewMonth === idx 
                      ? "border-primary ring-2 ring-primary/30" 
                      : "border-border hover:border-primary/50",
                    monthImages[idx]?.isGenerating && "opacity-50"
                  )}
                >
                  {monthImages[idx]?.gym || monthImages[idx]?.lazy ? (
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 bg-secondary">
                        {monthImages[idx]?.gym && (
                          <img 
                            src={monthImages[idx].gym || "/placeholder.svg"} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="w-1/2 bg-secondary">
                        {monthImages[idx]?.lazy && (
                          <img 
                            src={monthImages[idx].lazy || "/placeholder.svg"} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                      {monthImages[idx]?.isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : (
                        <span className="text-xs text-muted-foreground">{idx + 1}</span>
                      )}
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                    <span className="text-[10px] text-white font-medium">{data.month.slice(0, 3)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Print Layout - All 12 months, one per page */}
        <div className="hidden print:block">
          {MONTHS_DATA.map((data, idx) => (
            <div 
              key={data.month}
              ref={el => { calendarRefs.current[idx] = el }}
              className="break-after-page"
            >
              <PrintableCalendar
                month={idx}
                year={CURRENT_YEAR}
                gymImage={monthImages[idx]?.gym}
                lazyImage={monthImages[idx]?.lazy}
                monthName={data.month}
                theme={data.theme}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
