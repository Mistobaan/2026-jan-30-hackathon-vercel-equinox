"use client"

import { cn } from "@/lib/utils"

interface GoalSelectorProps {
  options: string[]
  selected: string[]
  onSelect: (selected: string[]) => void
  multiple?: boolean
  columns?: number
}

export function GoalSelector({ 
  options, 
  selected, 
  onSelect, 
  multiple = true,
  columns = 2 
}: GoalSelectorProps) {
  const handleSelect = (option: string) => {
    if (multiple) {
      if (selected.includes(option)) {
        onSelect(selected.filter(s => s !== option))
      } else {
        onSelect([...selected, option])
      }
    } else {
      onSelect([option])
    }
  }

  return (
    <div className={cn("grid gap-3", `grid-cols-${columns}`)}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleSelect(option)}
          className={cn(
            "px-4 py-3 rounded-lg text-sm font-medium transition-all border",
            selected.includes(option)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary text-secondary-foreground border-transparent hover:border-primary/50"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
