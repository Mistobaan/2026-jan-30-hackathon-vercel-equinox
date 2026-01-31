"use client"

import { useState, useRef } from "react"
import { Loader2, Printer, Sparkles, ChevronLeft, ChevronRight, Play, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PrintableCalendar } from "./printable-calendar"
import { MONTHS_DATA, type UserProfile } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface CalendarGeneratorProps {
  profile: UserProfile
  onBack: () => void
}

interface MonthImages {
  gym: string | null
  lazy: string | null
  gymGenerating: boolean
  lazyGenerating: boolean
  gymProgress: number
  lazyProgress: number
}

const CURRENT_YEAR = 2026

export function CalendarGenerator({ profile, onBack }: CalendarGeneratorProps) {
  const [monthImages, setMonthImages] = useState<MonthImages[]>(
    MONTHS_DATA.map(() => ({ 
      gym: null, 
      lazy: null, 
      gymGenerating: false, 
      lazyGenerating: false,
      gymProgress: 0,
      lazyProgress: 0
    }))
  )
  const [currentPreviewMonth, setCurrentPreviewMonth] = useState(0)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const calendarRefs = useRef<(HTMLDivElement | null)[]>([])

  const generateImageForMonth = async (
    monthIndex: number, 
    path: "gym" | "lazy"
  ): Promise<string | null> => {
    const data = MONTHS_DATA[monthIndex]
    const progressKey = path === "gym" ? "gymProgress" : "lazyProgress"
    const generatingKey = path === "gym" ? "gymGenerating" : "lazyGenerating"
    
    // Set generating state
    setMonthImages(prev => {
      const updated = [...prev]
      updated[monthIndex] = { ...updated[monthIndex], [generatingKey]: true, [progressKey]: 10 }
      return updated
    })

    // Simulate progress while waiting
    const progressInterval = setInterval(() => {
      setMonthImages(prev => {
        const updated = [...prev]
        const current = updated[monthIndex][progressKey]
        if (current < 90) {
          updated[monthIndex] = { ...updated[monthIndex], [progressKey]: current + Math.random() * 15 }
        }
        return updated
      })
    }, 500)
    
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
          userPhoto: profile.photos?.[0] || null,
        }),
      })
      const result = await response.json()
      
      clearInterval(progressInterval)
      
      // Complete progress and set image
      setMonthImages(prev => {
        const updated = [...prev]
        updated[monthIndex] = { 
          ...updated[monthIndex], 
          [path]: result.success ? result.imageUrl : null,
          [generatingKey]: false,
          [progressKey]: 100
        }
        return updated
      })
      
      return result.success ? result.imageUrl : null
    } catch (error) {
      clearInterval(progressInterval)
      console.error(`Error generating ${path} image for ${data.month}:`, error)
      
      setMonthImages(prev => {
        const updated = [...prev]
        updated[monthIndex] = { 
          ...updated[monthIndex], 
          [generatingKey]: false,
          [progressKey]: 0
        }
        return updated
      })
      return null
    }
  }

  const generateAllImages = async () => {
    setIsGeneratingAll(true)
    
    // Generate all images in parallel - each month generates both gym and lazy simultaneously
    const allPromises = MONTHS_DATA.flatMap((_, idx) => [
      generateImageForMonth(idx, "gym"),
      generateImageForMonth(idx, "lazy")
    ])
    
    await Promise.all(allPromises)
    setIsGeneratingAll(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const allImagesGenerated = monthImages.every(m => m.gym && m.lazy)
  const anyImagesGenerated = monthImages.some(m => m.gym || m.lazy)
  const isAnyGenerating = monthImages.some(m => m.gymGenerating || m.lazyGenerating)

  const completedCount = monthImages.filter(m => m.gym && m.lazy).length
  const totalProgress = Math.round((completedCount / 12) * 100)

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
        {/* Centered Generate Button - Only shown before generation starts */}
        {!anyImagesGenerated && !isGeneratingAll && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] print:hidden">
            <div className="text-center max-w-lg">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Generate Your 2026 Calendar</h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Create AI-powered motivational images for all 12 months. 
                Each month will show your Gym Path vs Lazy Path side by side 
                in a printable 16:9 format.
              </p>
              <Button
                onClick={generateAllImages}
                size="lg"
                className="gap-3 px-8 py-6 text-lg"
              >
                <Play className="w-5 h-5" />
                Generate All Months
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                All images will be generated in parallel
              </p>
            </div>
          </div>
        )}

        {/* Progress Grid - Show during and after generation */}
        {(isGeneratingAll || anyImagesGenerated) && (
          <div className="print:hidden">
            {/* Overall Progress Header */}
            {isAnyGenerating && (
              <div className="mb-8 p-6 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold">Generating Calendar</h2>
                  <span className="text-sm text-muted-foreground">
                    {completedCount} of 12 months complete
                  </span>
                </div>
                <Progress value={totalProgress} className="h-2" />
              </div>
            )}

            {/* Per-Month Progress Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {MONTHS_DATA.map((data, idx) => {
                const month = monthImages[idx]
                const isComplete = month.gym && month.lazy
                const isActive = month.gymGenerating || month.lazyGenerating
                
                return (
                  <div 
                    key={data.month}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer",
                      isComplete ? "border-primary/50 bg-primary/5" : "border-border bg-card",
                      currentPreviewMonth === idx && "ring-2 ring-primary"
                    )}
                    onClick={() => setCurrentPreviewMonth(idx)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{data.month}</span>
                      {isComplete ? (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-secondary" />
                      )}
                    </div>
                    
                    {/* Gym Path Progress */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Gym Path</span>
                        {month.gym ? (
                          <span className="text-primary">Done</span>
                        ) : month.gymGenerating ? (
                          <span>{Math.round(month.gymProgress)}%</span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </div>
                      <Progress 
                        value={month.gym ? 100 : month.gymProgress} 
                        className="h-1.5"
                      />
                    </div>
                    
                    {/* Lazy Path Progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Lazy Path</span>
                        {month.lazy ? (
                          <span className="text-primary">Done</span>
                        ) : month.lazyGenerating ? (
                          <span>{Math.round(month.lazyProgress)}%</span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </div>
                      <Progress 
                        value={month.lazy ? 100 : month.lazyProgress} 
                        className="h-1.5"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Preview Navigation */}
            {anyImagesGenerated && (
              <>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPreviewMonth(prev => Math.max(0, prev - 1))}
                    disabled={currentPreviewMonth === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="font-medium min-w-[150px] text-center">
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

                {/* Calendar Preview */}
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
              </>
            )}
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
