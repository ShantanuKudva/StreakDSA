"use client";

import { useMemo } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapDay {
  date: string;
  completed: boolean;
  isMilestone: boolean;
}

interface HeatmapProps {
  days: HeatmapDay[];
}

export function Heatmap({ days = [] }: HeatmapProps) {
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

    if (day.data?.completed && day.data.isMilestone) return "bg-orange-500";
    if (day.data?.completed) return "bg-green-500";

    // Empty state
    return "bg-[#1e1e1e] border border-[#2e2e2e]";
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
                            className={`h-2.5 w-2.5 rounded-[1px] ${getCellColor(
                              day
                            )} ${
                              day.date
                                ? "hover:ring-1 hover:ring-white/50 transition-all cursor-crosshair"
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
