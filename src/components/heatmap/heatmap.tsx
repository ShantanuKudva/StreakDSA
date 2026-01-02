"use client";

import { useMemo } from "react";
import { eachDayOfInterval, endOfMonth, format, getDay } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapDay {
  date: string;
  completed: boolean;
  isFrozen?: boolean;
  isMilestone?: boolean;
}

interface HeatmapProps {
  days: HeatmapDay[];
  onDayClick?: (date: string) => void;
  selectedDate?: string | null;
}

export function Heatmap({ days = [], onDayClick, selectedDate }: HeatmapProps) {
  // Generate full year (Jan 1 to Dec 31 of current year)
  const months = useMemo(() => {
    const result = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    // Iterate from Month 0 (Jan) to 11 (Dec)
    for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
      const start = new Date(currentYear, monthIdx, 1);
      const end = endOfMonth(start);

      const daysInMonth = eachDayOfInterval({ start, end });

      const weeks: { date: Date | null; data?: HeatmapDay }[][] = [];
      let currentWeek: { date: Date | null; data?: HeatmapDay }[] = [];

      const startDay = getDay(start); // 0 (Sun) to 6 (Sat)

      // Padding for first week
      for (let j = 0; j < startDay; j++) {
        currentWeek.push({ date: null });
      }

      daysInMonth.forEach((date) => {
        const dataStr = format(date, "yyyy-MM-dd");
        const found = days.find((d) => d.date === dataStr);
        currentWeek.push({ date, data: found });

        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });

      // Padding for last week
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push({ date: null });
        }
        weeks.push(currentWeek);
      }

      result.push({
        name: format(start, "MMM"),
        weeks,
      });
    }
    return result;
  }, [days]);

  const getCellColor = (day: { date: Date | null; data?: HeatmapDay }) => {
    if (!day.date) return "invisible";

    const dayData = day.data;
    const dateStr = format(day.date, "yyyy-MM-dd");
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const isCompleted = dayData?.completed;
    const isFrozen = dayData?.isFrozen;
    const isMilestone = dayData?.isMilestone;
    const isToday = dateStr === todayStr;

    if (isFrozen) return "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]";
    if (isMilestone)
      return "bg-amber-600/80 shadow-[0_0_8px_rgba(217,119,6,0.3)]";
    if (isCompleted)
      return "bg-emerald-600/80 shadow-[0_0_8px_rgba(5,150,105,0.3)]";
    if (isToday) return "bg-zinc-800/80 border border-white/10";

    // Default empty state
    return "bg-[#0d1117]"; // GitHub dark mode empty cell color
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        {months.map((month, mIdx) => (
          <div key={mIdx} className="flex flex-col gap-2">
            {/* Month Label */}
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
              {month.name}
            </div>
            {/* Grid for Month */}
            <div className="flex flex-col gap-[3px]">
              {month.weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex gap-[3px]">
                  {week.map((day, dIdx) => (
                    <TooltipProvider key={dIdx}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div
                            onClick={() =>
                              day.date &&
                              onDayClick?.(format(day.date, "yyyy-MM-dd"))
                            }
                            className={`h-2.5 w-2.5 rounded-[1px] ${getCellColor(
                              day
                            )} ${
                              day.date
                                ? "hover:ring-1 hover:ring-white/50 transition-all cursor-pointer"
                                : ""
                            } ${
                              selectedDate &&
                              day.date &&
                              format(day.date, "yyyy-MM-dd") === selectedDate
                                ? "ring-2 ring-purple-500 ring-offset-1 ring-offset-background"
                                : ""
                            }`}
                          />
                        </TooltipTrigger>
                        {day.date && (
                          <TooltipContent className="bg-popover text-popover-foreground text-xs p-1 px-2 border border-border">
                            <p>
                              {format(day.date, "MMM d, yyyy")}
                              {day.data?.completed
                                ? day.data.isMilestone
                                  ? " (Milestone!)"
                                  : day.data.isFrozen
                                  ? " (Frozen)"
                                  : " (Completed)"
                                : ""}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
