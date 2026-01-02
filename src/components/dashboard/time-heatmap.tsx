"use client";

import { useMemo } from "react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimeDistribution {
  hour: number;
  dayOfWeek: number;
  count: number;
}

interface Problem {
  id: string;
  name: string;
  topic: string;
  difficulty: string;
  hour: number;
}

interface TimeHeatmapProps {
  data: TimeDistribution[];
  highlightDayOnly?: boolean;
  problems?: Problem[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function TimeHeatmap({ data = [], highlightDayOnly = false, problems = [] }: TimeHeatmapProps) {
  const maxCount = useMemo(() => {
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  const grid = useMemo(() => {
    const matrix = Array.from({ length: 24 }, () => Array(7).fill(0));
    data.forEach((d) => {
      if (d.hour >= 0 && d.hour < 24 && d.dayOfWeek >= 0 && d.dayOfWeek < 7) {
        matrix[d.hour][d.dayOfWeek] = d.count;
      }
    });
    return matrix;
  }, [data]);

  const getOpacity = (count: number) => {
    if (count === 0) return 0.05;
    return 0.2 + (count / maxCount) * 0.8;
  };

  return (
    <CardSpotlight
      className="p-6 transition-all hover:border-purple-500/50"
      color="rgba(168, 85, 247, 0.15)"
    >
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-purple-400" />
        <h3 className="font-semibold text-lg text-white">
          {highlightDayOnly ? "Day Activity Distribution" : "Activity Time Distribution"}
        </h3>
      </div>

      {/* Show full 24x7 grid only when NOT in day-only mode */}
      {!highlightDayOnly && (
        <div className="flex flex-col gap-1">
          {/* Header: Days of Week */}
          <div className="flex gap-1 ml-8 mb-1">
            {DAYS.map((day, idx) => {
              const isVisible = !highlightDayOnly || data.some(d => d.dayOfWeek === idx);
              if (!isVisible) return null;
              return (
                <div key={day} className="flex-1 text-[10px] text-muted-foreground text-center font-medium uppercase tracking-tighter">
                  {day}
                </div>
              );
            })}
          </div>

          {/* Rows: Hours */}
          <div className="space-y-1">
            {HOURS.map((hour) => (
              <div key={hour} className="flex gap-1 items-center">
                {/* Hour Label */}
                <div className="w-8 text-[10px] text-muted-foreground text-right pr-2 font-mono">
                  {hour.toString().padStart(2, "0")}h
                </div>
                
                {/* Day Cells */}
                {grid[hour].map((count, dayIdx) => {
                  const isVisible = !highlightDayOnly || data.some(d => d.dayOfWeek === dayIdx);
                  if (!isVisible) return null;
                  return (
                    <TooltipProvider key={dayIdx}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div
                            className="flex-1 h-4 rounded-[2px] transition-all cursor-crosshair border border-white/5"
                            style={{
                              backgroundColor: count > 0 ? `rgba(168, 85, 247, ${getOpacity(count)})` : "rgba(255, 255, 255, 0.03)",
                              boxShadow: count > 0 ? `0 0 10px rgba(168, 85, 247, ${getOpacity(count) * 0.3})` : "none",
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover text-popover-foreground text-xs p-2 border border-border">
                          <p className="font-medium">{DAYS[dayIdx]} at {hour}:00</p>
                          <p className="text-muted-foreground">{count} activities logged</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0.1, 0.4, 0.7, 1].map((op) => (
            <div
              key={op}
              className="h-2 w-2 rounded-[1px]"
              style={{ backgroundColor: `rgba(168, 85, 247, ${op})` }}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Simple 4x6 Grid for Day View */}
      {highlightDayOnly && (
        <div className="mt-4">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 24 }, (_, hour) => {
              const count = data.find(d => d.hour === hour)?.count || 0;
              const hourProblems = problems.filter(p => p.hour === hour);
              return (
                <TooltipProvider key={hour}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div
                        className="aspect-square rounded-md flex items-center justify-center text-xs font-mono cursor-crosshair border border-white/10 transition-all hover:scale-105"
                        style={{
                          backgroundColor: count > 0 ? `rgba(168, 85, 247, ${getOpacity(count)})` : "rgba(255, 255, 255, 0.03)",
                          boxShadow: count > 0 ? `0 0 15px rgba(168, 85, 247, ${getOpacity(count) * 0.4})` : "none",
                        }}
                      >
                        <span className={count > 0 ? "text-white" : "text-muted-foreground"}>
                          {hour.toString().padStart(2, "0")}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground text-xs p-3 border border-border max-w-[200px]">
                      <p className="font-semibold mb-1">{hour}:00 - {hour}:59</p>
                      {hourProblems.length > 0 ? (
                        <div className="space-y-1">
                          {hourProblems.map(p => (
                            <div key={p.id} className="text-muted-foreground">
                              <span className={`inline-block mr-1 text-[9px] px-1 py-0.5 rounded ${
                                p.difficulty === 'EASY' ? 'bg-emerald-500/20 text-emerald-400' :
                                p.difficulty === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>{p.difficulty}</span>
                              {p.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No activity</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      )}
    </CardSpotlight>
  );
}
