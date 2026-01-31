export interface UserProfile {
  photos: string[]
  goals: string[]
  workoutStyle: string
  focusAreas: string[]
  confidenceGoals: string
}

export interface MonthData {
  month: string
  theme: string
  gymPath: {
    description: string
    imageUrl?: string
  }
  lazyPath: {
    description: string
    imageUrl?: string
  }
}

export const MONTHS_DATA: MonthData[] = [
  {
    month: "January",
    theme: "New Beginnings",
    gymPath: {
      description: "Early progress. User leaving Equinox, subtle fat loss, improved posture, hopeful expression aligned with stated goals."
    },
    lazyPath: {
      description: "Winter couch scene, snacking and TV, slouched posture, tired face."
    }
  },
  {
    month: "February",
    theme: "Momentum vs Comfort",
    gymPath: {
      description: "Noticeable tone improvements, tighter core, confident walk, calm focus."
    },
    lazyPath: {
      description: "Same outfit feels tighter, lethargic mood, comfort food visible."
    }
  },
  {
    month: "March",
    theme: "Spring Awakening",
    gymPath: {
      description: "Leaner silhouette, clearer skin, energized expression, spring light."
    },
    lazyPath: {
      description: "Still indoors, heavier look, messy environment, low motivation."
    }
  },
  {
    month: "April",
    theme: "Consistency",
    gymPath: {
      description: "Visible muscle definition or fat reduction per goals, relaxed confidence."
    },
    lazyPath: {
      description: "Incremental weight gain, passive scrolling, mild regret."
    }
  },
  {
    month: "May",
    theme: "Pre-Summer Confidence",
    gymPath: {
      description: "Athletic proportions emerging, open body language, vibrant colors."
    },
    lazyPath: {
      description: "Self-conscious posture, emotional eating, avoidance behaviors."
    }
  },
  {
    month: "June",
    theme: "Summer Energy",
    gymPath: {
      description: "Strong, fit physique clearly aligned with goals, glowing skin, social ease."
    },
    lazyPath: {
      description: "Sluggish, overheated, greasy food, dissatisfaction."
    }
  },
  {
    month: "July",
    theme: "Peak vs Plateau",
    gymPath: {
      description: "Peak conditioning for goals: lean, strong, confident stance."
    },
    lazyPath: {
      description: "Bloated appearance, zoning out, low energy."
    }
  },
  {
    month: "August",
    theme: "Sustain or Slip",
    gymPath: {
      description: "Sustainable fitness look, calm strength, balanced lifestyle cues."
    },
    lazyPath: {
      description: "Inactivity burnout, visible frustration, comfort eating."
    }
  },
  {
    month: "September",
    theme: "Back on Track",
    gymPath: {
      description: "Sharp, disciplined appearance, refined body composition."
    },
    lazyPath: {
      description: "Heavier and resigned, stuck in habits."
    }
  },
  {
    month: "October",
    theme: "Discipline Pays",
    gymPath: {
      description: "Defined physique, strong posture, composed confidence."
    },
    lazyPath: {
      description: "Comfort-food season, dull lighting, emotional eating."
    }
  },
  {
    month: "November",
    theme: "Gratitude vs Regret",
    gymPath: {
      description: "Healthy, grounded, fit body reflecting year-long progress."
    },
    lazyPath: {
      description: "Overindulgence, lethargy, regret visible in expression."
    }
  },
  {
    month: "December",
    theme: "Year-End Contrast",
    gymPath: {
      description: "Best version of the user per goals: fit, confident, fulfilled."
    },
    lazyPath: {
      description: "Tired, heavier, sad realization of missed opportunities."
    }
  }
]

export const GOALS = [
  "Fat loss",
  "Muscle gain",
  "Improved posture",
  "More energy",
  "Better endurance",
  "Strength building"
]

export const WORKOUT_STYLES = [
  "Weight training",
  "HIIT",
  "Yoga/Pilates",
  "Running/Cardio",
  "CrossFit",
  "Swimming"
]

export const FOCUS_AREAS = [
  "Core/Abs",
  "Arms",
  "Legs",
  "Back",
  "Shoulders",
  "Full body"
]
