"use client";

import { useMemo, memo, useCallback } from "react";
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
  problemCount?: number;
}

interface HeatmapProps {
  days: HeatmapDay[];
  onDayClick?: (date: string) => void;
  selectedDate?: string | null;
}

interface DayCellProps {
  dateStr: string;
  displayDate: string;
  cellColor: string;
  tooltipText: string;
  isSelected: boolean;
  onDayClick?: (date: string) => void;
}

// Pre-compute colors outside component - no shadows for performance
const CELL_COLORS = {
  frozen: "bg-cyan-400",
  milestone: "bg-amber-600/80",
  completed4: "bg-emerald-400",
  completed3: "bg-emerald-500",
  completed2: "bg-emerald-600/90",
  completed1: "bg-emerald-700/70",
  today: "bg-zinc-800/80 border border-white/10",
  empty: "bg-[#0d1117]",
  invisible: "invisible",
} as const;

function getCellColorKey(
  isCompleted: boolean,
  isFrozen: boolean,
  isMilestone: boolean,
  isToday: boolean,
  problemCount: number
): keyof typeof CELL_COLORS {
  if (isFrozen) return "frozen";
  if (isMilestone) return "milestone";
  if (isCompleted) {
    if (problemCount >= 4) return "completed4";
    if (problemCount >= 3) return "completed3";
    if (problemCount >= 2) return "completed2";
    return "completed1";
  }
  if (isToday) return "today";
  return "empty";
}

// Heavily memoized day cell with minimal props
const DayCell = memo(function DayCell({
  dateStr,
  displayDate,
  cellColor,
  tooltipText,
  isSelected,
  onDayClick
}: DayCellProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <div
          onClick={() => onDayClick?.(dateStr)}
          className={`h-2.5 w-2.5 rounded-[1px] cursor-pointer ${cellColor} ${isSelected ? "ring-2 ring-purple-500" : ""
            }`}
        />
      </TooltipTrigger>
      <TooltipContent className="bg-popover text-popover-foreground text-xs p-1 px-2 border border-border">
        <p>{displayDate}{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
});

// Empty cell - no tooltip needed
const EmptyCell = memo(function EmptyCell() {
  return <div className="h-2.5 w-2.5 invisible" />;
});

export const Heatmap = memo(function Heatmap({ days = [], onDayClick, selectedDate }: HeatmapProps) {
  // Pre-compute today's date string once
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  // Create a lookup map for O(1) day finding instead of O(n) array.find
  const daysMap = useMemo(() => {
    const map = new Map<string, HeatmapDay>();
    days.forEach(d => map.set(d.date, d));
    return map;
  }, [days]);

  // Pre-compute all cell data for the year
  const months = useMemo(() => {
    const result: Array<{
      name: string;
      cells: Array<{
        key: string;
        dateStr: string | null;
        displayDate: string;
        cellColor: string;
        tooltipText: string;
      }>;
    }> = [];

    const currentYear = new Date().getFullYear();

    for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
      const start = new Date(currentYear, monthIdx, 1);
      const end = endOfMonth(start);
      const daysInMonth = eachDayOfInterval({ start, end });
      const startDay = getDay(start);

      const cells: Array<{
        key: string;
        dateStr: string | null;
        displayDate: string;
        cellColor: string;
        tooltipText: string;
      }> = [];

      // Padding cells
      for (let j = 0; j < startDay; j++) {
        cells.push({
          key: `pad-${monthIdx}-${j}`,
          dateStr: null,
          displayDate: "",
          cellColor: CELL_COLORS.invisible,
          tooltipText: "",
        });
      }

      // Day cells
      daysInMonth.forEach((date, idx) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const dayData = daysMap.get(dateStr);
        const isCompleted = dayData?.completed ?? false;
        const isFrozen = dayData?.isFrozen ?? false;
        const isMilestone = dayData?.isMilestone ?? false;
        const isToday = dateStr === todayStr;
        const problemCount = dayData?.problemCount ?? 0;

        const colorKey = getCellColorKey(isCompleted, isFrozen, isMilestone, isToday, problemCount);

        let tooltipText = "";
        if (isCompleted) {
          if (isMilestone) tooltipText = " (Milestone!)";
          else if (isFrozen) tooltipText = " (Frozen)";
          else if (problemCount) tooltipText = ` (${problemCount} problem${problemCount > 1 ? "s" : ""})`;
          else tooltipText = " (Completed)";
        }

        cells.push({
          key: `day-${dateStr}`,
          dateStr,
          displayDate: format(date, "MMM d, yyyy"),
          cellColor: CELL_COLORS[colorKey],
          tooltipText,
        });
      });

      // End padding to fill last week
      const remainder = cells.length % 7;
      if (remainder > 0) {
        for (let j = 0; j < 7 - remainder; j++) {
          cells.push({
            key: `end-${monthIdx}-${j}`,
            dateStr: null,
            displayDate: "",
            cellColor: CELL_COLORS.invisible,
            tooltipText: "",
          });
        }
      }

      result.push({
        name: format(start, "MMM"),
        cells,
      });
    }
    return result;
  }, [daysMap, todayStr]);

  return (
    <TooltipProvider>
      <div className="w-full">
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {months.map((month) => {
            // Split cells into weeks of 7
            const weeks: typeof month.cells[] = [];
            for (let i = 0; i < month.cells.length; i += 7) {
              weeks.push(month.cells.slice(i, i + 7));
            }

            return (
              <div key={month.name} className="flex flex-col gap-2">
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  {month.name}
                </div>
                <div className="flex flex-col gap-[3px]">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex gap-[3px]">
                      {week.map((cell) =>
                        cell.dateStr === null ? (
                          <EmptyCell key={cell.key} />
                        ) : (
                          <DayCell
                            key={cell.key}
                            dateStr={cell.dateStr}
                            displayDate={cell.displayDate}
                            cellColor={cell.cellColor}
                            tooltipText={cell.tooltipText}
                            isSelected={selectedDate === cell.dateStr}
                            onDayClick={onDayClick}
                          />
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
});
