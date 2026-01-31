"use client"

import { useState } from "react"
import { Sparkles, Settings, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MonthCard } from "./month-card"
import { MONTHS_DATA, type UserProfile } from "@/lib/store"

interface CalendarViewProps {
  profile: UserProfile
  onBack: () => void
}

export function CalendarView({ profile, onBack }: CalendarViewProps) {
  const [showProfile, setShowProfile] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">FutureYou</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProfile(!showProfile)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-balance">
            Your Year of Transformation
          </h1>
          <p className="text-muted-foreground text-lg">
            See your two potential futures, month by month.
          </p>
        </section>

        {/* Profile Summary */}
        {showProfile && (
          <section className="mb-8 p-4 rounded-xl bg-card border border-border">
            <h2 className="font-semibold mb-3">Your Profile</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Goals:</span>
                <p className="font-medium">{profile.goals.join(", ")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Workout Style:</span>
                <p className="font-medium">{profile.workoutStyle}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Focus Areas:</span>
                <p className="font-medium">{profile.focusAreas.join(", ")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Photos:</span>
                <p className="font-medium">{profile.photos.length} uploaded</p>
              </div>
            </div>
            {profile.confidenceGoals && (
              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-muted-foreground text-sm">Confidence Goals:</span>
                <p className="text-sm font-medium mt-1">{profile.confidenceGoals}</p>
              </div>
            )}
          </section>
        )}

        {/* Legend */}
        <section className="mb-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Gym Path (Equinox)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Lazy Path (Home)</span>
          </div>
        </section>

        {/* Month Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MONTHS_DATA.map((month, index) => (
            <MonthCard
              key={month.month}
              data={month}
              profile={profile}
              index={index}
            />
          ))}
        </section>

        {/* Motivation Footer */}
        <section className="mt-12 text-center py-8 border-t border-border">
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every month is a choice. Click on any month to generate your personalized 
            Gym Path and Lazy Path visualizations based on your goals.
          </p>
        </section>
      </main>
    </div>
  )
}
