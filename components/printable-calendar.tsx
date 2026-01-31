"use client"

import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  getDay
} from "date-fns"
import { cn } from "@/lib/utils"

interface PrintableCalendarProps {
  month: number // 0-11
  year: number
  gymImage: string | null
  lazyImage: string | null
  monthName: string
  theme: string
}

export function PrintableCalendar({
  month,
  year,
  gymImage,
  lazyImage,
  monthName,
  theme
}: PrintableCalendarProps) {
  const firstDayOfMonth = startOfMonth(new Date(year, month))
  const lastDayOfMonth = endOfMonth(new Date(year, month))
  
  // Get the start and end of the calendar grid (including days from prev/next months)
  const calendarStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 }) // Monday start
  const calendarEnd = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 })
  
  // Get all days in the calendar view
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  return (
    <div 
      className="relative w-full bg-[#0a1628] overflow-hidden"
      style={{ aspectRatio: "16/9" }}
    >
      {/* Background Images - Split Layout */}
      <div className="absolute inset-0 flex">
        {/* Gym Path - Left Side */}
        <div className="w-1/2 relative overflow-hidden">
          {gymImage ? (
            <img 
              src={gymImage || "/placeholder.svg"} 
              alt="Gym Path" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 flex items-center justify-center">
              <span className="text-white/50 text-sm">Gym Path</span>
            </div>
          )}
          {/* Subtle gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a1628]/80" />
        </div>
        
        {/* Lazy Path - Right Side */}
        <div className="w-1/2 relative overflow-hidden">
          {lazyImage ? (
            <img 
              src={lazyImage || "/placeholder.svg"} 
              alt="Lazy Path" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-bl from-orange-900/50 to-red-900/50 flex items-center justify-center">
              <span className="text-white/50 text-sm">Lazy Path</span>
            </div>
          )}
          {/* Subtle gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0a1628]/80" />
        </div>
      </div>

      {/* Center Calendar Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[42%] bg-[#0a1628]/95 backdrop-blur-sm rounded-lg shadow-2xl border border-white/10 overflow-hidden">
          {/* Brand Header */}
          <div className="text-center py-2 border-b border-white/10">
            <span className="text-white/90 text-xs tracking-[0.3em] font-light">EQUINOX</span>
          </div>
          
          {/* Month Header */}
          <div className="bg-white/90 py-2 text-center">
            <h2 className="text-[#0a1628] font-semibold tracking-wide text-sm">
              {monthName.toUpperCase()} {year}
            </h2>
          </div>
          
          {/* Calendar Grid */}
          <div className="p-3">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div 
                  key={day} 
                  className="text-center text-[10px] text-white/50 font-medium"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, firstDayOfMonth)
                const dayOfWeek = getDay(day)
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                
                return (
                  <div 
                    key={idx}
                    className={cn(
                      "aspect-square flex items-center justify-center text-xs rounded",
                      isCurrentMonth 
                        ? isWeekend 
                          ? "text-amber-400/80" 
                          : "text-white/90"
                        : "text-white/20",
                    )}
                  >
                    {format(day, "d")}
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Footer with Labels */}
          <div className="px-3 pb-3 flex justify-between text-[9px] text-white/40">
            <span>Gym</span>
            <span>Rest</span>
            <span>Rest</span>
          </div>
        </div>
      </div>

      {/* Theme Badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <span className="text-white/60 text-[10px] tracking-wide bg-black/30 px-3 py-1 rounded-full">
          {theme}
        </span>
      </div>
    </div>
  )
}
