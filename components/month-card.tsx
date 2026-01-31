"use client"

import { useState } from "react"
import { Loader2, RefreshCw, Dumbbell, Sofa } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MonthData, UserProfile } from "@/lib/store"
import { cn } from "@/lib/utils"

interface MonthCardProps {
  data: MonthData
  profile: UserProfile
  index: number
}

export function MonthCard({ data, profile, index }: MonthCardProps) {
  const [gymImage, setGymImage] = useState<string | null>(null)
  const [lazyImage, setLazyImage] = useState<string | null>(null)
  const [isGeneratingGym, setIsGeneratingGym] = useState(false)
  const [isGeneratingLazy, setIsGeneratingLazy] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const generateImage = async (path: "gym" | "lazy") => {
    const setLoading = path === "gym" ? setIsGeneratingGym : setIsGeneratingLazy
    const setImage = path === "gym" ? setGymImage : setLazyImage

    setLoading(true)
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
        setImage(result.imageUrl)
      }
    } catch (error) {
      console.error("[v0] Error generating image:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden bg-card border border-border transition-all duration-300",
        expanded && "md:col-span-2 lg:col-span-3"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
            {index + 1}
          </span>
          <div className="text-left">
            <h3 className="font-semibold">{data.month}</h3>
            <p className="text-sm text-muted-foreground">{data.theme}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {gymImage && (
            <div className="w-2 h-2 rounded-full bg-accent" />
          )}
          {lazyImage && (
            <div className="w-2 h-2 rounded-full bg-destructive" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 pt-0 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Gym Path */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-accent">
                <Dumbbell className="w-4 h-4" />
                <span className="font-medium text-sm">Gym Path</span>
              </div>
              <div className="aspect-[4/5] rounded-lg bg-secondary overflow-hidden relative">
                {gymImage ? (
                  <img
                    src={gymImage || "/placeholder.svg"}
                    alt={`${data.month} Gym Path`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-3">
                      {data.gymPath.description}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => generateImage("gym")}
                      disabled={isGeneratingGym}
                    >
                      {isGeneratingGym ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate Image"
                      )}
                    </Button>
                  </div>
                )}
                {gymImage && (
                  <button
                    onClick={() => generateImage("gym")}
                    disabled={isGeneratingGym}
                    className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                  >
                    {isGeneratingGym ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Lazy Path */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <Sofa className="w-4 h-4" />
                <span className="font-medium text-sm">Lazy Path</span>
              </div>
              <div className="aspect-[4/5] rounded-lg bg-secondary overflow-hidden relative">
                {lazyImage ? (
                  <img
                    src={lazyImage || "/placeholder.svg"}
                    alt={`${data.month} Lazy Path`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-3">
                      {data.lazyPath.description}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateImage("lazy")}
                      disabled={isGeneratingLazy}
                    >
                      {isGeneratingLazy ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate Image"
                      )}
                    </Button>
                  </div>
                )}
                {lazyImage && (
                  <button
                    onClick={() => generateImage("lazy")}
                    disabled={isGeneratingLazy}
                    className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                  >
                    {isGeneratingLazy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
