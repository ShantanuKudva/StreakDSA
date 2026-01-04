"use client";

import { useMemo } from "react";
import { eachDayOfInterval, endOfMonth, format, getDay } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DemoHeatmapProps {
  onDayClick?: (date: string) => void;
  selectedDate?: string | null;
}

interface DemoHeatmapDay {
  date: string;
  completed: boolean;
  isFrozen: boolean;
  isMilestone: boolean;
  problemCount: number;
  problems: {
    id: string;
    name: string;
    topic: string;
    difficulty: string;
    hour: number;
  }[];
}

interface WeekDay {
  date: Date | null;
  data?: DemoHeatmapDay;
}

// Improved Seeded Random
function seededRandom(seed: number) {
  let h = Math.imul(seed ^ 0xdeadbeef, 2654435761);
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function DemoHeatmap({ onDayClick, selectedDate }: DemoHeatmapProps) {
  // Generate data INTERNALLY to ensure no prop passing issues
  const days = useMemo(() => {
    const data: DemoHeatmapDay[] = [];
    const demoYear = new Date().getFullYear();
    const problemNames = [
      "Two Sum",
      "Valid Parentheses",
      "Merge Intervals",
      "LRU Cache",
      "Binary Search",
      "Linked List Cycle",
      "Trapping Rain Water",
      "Meeting Rooms II",
      "Word Search",
      "Number of Islands",
    ];

    // Generate for full year
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(demoYear, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(demoYear, month, day);
        const dateStr = format(date, "yyyy-MM-dd");

        // Day of year for seed
        const startOfYear = new Date(demoYear, 0, 1);
        const dayOfYear = Math.floor(
          (date.getTime() - startOfYear.getTime()) / 86400000
        );

        const seed = dayOfYear * 1234 + month * 567 + day;
        const r1 = seededRandom(seed);
        const r2 = seededRandom(seed + 1);
        const r3 = seededRandom(seed + 2);

        // Pattern: 70% completed
        const isCompleted = r1 > 0.3;

        // Frozen: 5% if completed
        const isFrozen = isCompleted && r2 < 0.05;

        // Milestone: 2% if completed
        const isMilestone = isCompleted && !isFrozen && r3 < 0.02;

        const numProblems = isCompleted ? (r2 > 0.8 ? 4 : r2 > 0.5 ? 2 : 1) : 0;

        // Problem Details
        const problems = isCompleted
          ? Array.from({ length: numProblems }).map((_, i) => ({
              id: `${dateStr}-${i}`,
              name: problemNames[
                Math.floor(seededRandom(seed + i) * problemNames.length)
              ],
              topic: "DSA",
              difficulty: ["EASY", "MEDIUM", "HARD"][
                Math.floor(seededRandom(seed + i * 10) * 3)
              ],
              hour: 8 + i,
            }))
          : [];

        data.push({
          date: dateStr,
          completed: isCompleted,
          isFrozen,
          isMilestone,
          problemCount: numProblems,
          problems,
        });
      }
    }
    console.log(`[DemoHeatmap] Generated ${data.length} days internally.`);
    return data;
  }, []);

  // Calendar Grid Generation (Same as original Heatmap but self-contained)
  const months = useMemo(() => {
    const result = [];
    const currentYear = new Date().getFullYear();

    for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
      const start = new Date(currentYear, monthIdx, 1);
      const end = endOfMonth(start);
      const daysInMonth = eachDayOfInterval({ start, end });
      const weeks: WeekDay[][] = [];
      let currentWeek: WeekDay[] = [];
      const startDay = getDay(start); // 0-6

      for (let j = 0; j < startDay; j++) currentWeek.push({ date: null });

      daysInMonth.forEach((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const dayData = days.find((d) => d.date === dateStr);
        currentWeek.push({ date, data: dayData });
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });

      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push({ date: null });
        weeks.push(currentWeek);
      }
      result.push({ name: format(start, "MMM"), weeks });
    }
    return result;
  }, [days]);

  const getCellColor = (dayData: DemoHeatmapDay | undefined) => {
    if (!dayData) return "bg-[#0d1117]";
    if (dayData.isFrozen)
      return "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]";
    if (dayData.isMilestone)
      return "bg-amber-600/80 shadow-[0_0_8px_rgba(217,119,6,0.3)]";
    if (dayData.problemCount > 3)
      return "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]";
    if (dayData.problemCount > 2)
      return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    if (dayData.problemCount > 0)
      return "bg-emerald-700/70 shadow-[0_0_6px_rgba(5,150,105,0.3)]";
    return "bg-[#0d1117]";
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        {months.map((month, m) => (
          <div key={m} className="flex flex-col gap-2">
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
              {month.name}
            </div>
            <div className="flex flex-col gap-[3px]">
              {month.weeks.map((week, w) => (
                <div key={w} className="flex gap-[3px]">
                  {week.map((day: WeekDay, d: number) => (
                    <TooltipProvider key={d}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div
                            onClick={() =>
                              day.date &&
                              onDayClick?.(format(day.date, "yyyy-MM-dd"))
                            }
                            className={`h-2.5 w-2.5 rounded-[1px] ${
                              day.date ? getCellColor(day.data) : "invisible"
                            } ${
                              day.date
                                ? "hover:ring-1 hover:ring-white/50 cursor-pointer"
                                : ""
                            } ${
                              selectedDate &&
                              day.date &&
                              format(day.date, "yyyy-MM-dd") === selectedDate
                                ? "ring-2 ring-purple-500"
                                : ""
                            }`}
                          />
                        </TooltipTrigger>
                        {day.date && (
                          <TooltipContent className="bg-popover text-popover-foreground text-xs p-1 px-2 border border-border">
                            <p>
                              {format(day.date, "MMM d, yyyy")}{" "}
                              {day.data?.completed
                                ? `(${day.data.problemCount} problems)`
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
