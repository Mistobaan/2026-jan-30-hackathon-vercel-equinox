"use client"

import { useState } from "react"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { CalendarGenerator } from "@/components/calendar-generator"
import type { UserProfile } from "@/lib/store"

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  if (!profile) {
    return <OnboardingFlow onComplete={setProfile} />
  }

  return <CalendarGenerator profile={profile} onBack={() => setProfile(null)} />
}
