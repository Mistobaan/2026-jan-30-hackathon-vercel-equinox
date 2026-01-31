"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PhotoUpload } from "./photo-upload"
import { GoalSelector } from "./goal-selector"
import { GOALS, WORKOUT_STYLES, FOCUS_AREAS, type UserProfile } from "@/lib/store"
import { cn } from "@/lib/utils"

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<UserProfile>({
    photos: [],
    goals: [],
    workoutStyle: "",
    focusAreas: [],
    confidenceGoals: ""
  })

  const steps = [
    {
      title: "Your Reference Photos",
      subtitle: "Upload 1-3 clear photos (face + full body)",
      component: (
        <PhotoUpload
          photos={profile.photos}
          onPhotosChange={(photos) => setProfile({ ...profile, photos })}
        />
      ),
      isValid: profile.photos.length > 0
    },
    {
      title: "Your Fitness Goals",
      subtitle: "Select all that apply",
      component: (
        <GoalSelector
          options={GOALS}
          selected={profile.goals}
          onSelect={(goals) => setProfile({ ...profile, goals })}
        />
      ),
      isValid: profile.goals.length > 0
    },
    {
      title: "Preferred Workout Style",
      subtitle: "Choose your favorite way to train",
      component: (
        <GoalSelector
          options={WORKOUT_STYLES}
          selected={profile.workoutStyle ? [profile.workoutStyle] : []}
          onSelect={(styles) => setProfile({ ...profile, workoutStyle: styles[0] || "" })}
          multiple={false}
          columns={2}
        />
      ),
      isValid: profile.workoutStyle !== ""
    },
    {
      title: "Focus Areas",
      subtitle: "Which body areas do you want to improve?",
      component: (
        <GoalSelector
          options={FOCUS_AREAS}
          selected={profile.focusAreas}
          onSelect={(areas) => setProfile({ ...profile, focusAreas: areas })}
          columns={3}
        />
      ),
      isValid: profile.focusAreas.length > 0
    },
    {
      title: "Confidence Goals",
      subtitle: "What does success look like for you?",
      component: (
        <Textarea
          placeholder="e.g., Feel confident at the beach, have more energy for my kids, look great in my wedding photos..."
          value={profile.confidenceGoals}
          onChange={(e) => setProfile({ ...profile, confidenceGoals: e.target.value })}
          className="min-h-[150px] bg-secondary border-0 resize-none"
        />
      ),
      isValid: true
    }
  ]

  const currentStep = steps[step]
  const isLastStep = step === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete(profile)
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">FutureYou</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {step + 1} of {steps.length}
        </span>
      </header>

      {/* Progress */}
      <div className="px-4">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{currentStep.title}</h1>
          <p className="text-muted-foreground">{currentStep.subtitle}</p>
        </div>

        <div className="flex-1">
          {currentStep.component}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="flex-1 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!currentStep.isValid}
          className={cn("flex-1", step === 0 && "w-full")}
        >
          {isLastStep ? (
            <>
              Generate Calendar
              <Sparkles className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </footer>
    </div>
  )
}
