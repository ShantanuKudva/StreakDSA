"use client";

import { useMemo } from "react";
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
    return 0.3 + (count / maxCount) * 0.7;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-purple-400" />
        <h3 className="font-semibold text-lg text-white">
          {highlightDayOnly ? "Hourly Activity Log" : "Global Activity Distribution"}
        </h3>
      </div>

      {!highlightDayOnly ? (
        <div className="flex flex-col gap-1 p-6 bg-zinc-900/30 rounded-2xl border border-white/5 shadow-inner">
          {/* Header: Days of Week */}
          <div className="flex gap-1 ml-8 mb-1">
            {DAYS.map((day) => (
              <div key={day} className="flex-1 text-[10px] text-muted-foreground text-center font-medium uppercase tracking-tighter">
                {day}
              </div>
            ))}
          </div>

          {/* Rows: Hours */}
          <div className="space-y-1">
            {HOURS.map((hour) => (
              <div key={hour} className="flex gap-1 items-center">
                <div className="w-8 text-[10px] text-muted-foreground text-right pr-2 font-mono">
                  {hour.toString().padStart(2, "0")}h
                </div>
                {grid[hour].map((count, dayIdx) => (
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
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Detailed Day View Matrix */
        <div className="p-6 bg-zinc-900/30 rounded-2xl border border-white/5 shadow-inner">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {HOURS.map((hour) => {
              const count = data.find(d => d.hour === hour)?.count || 0;
              const hourProblems = problems.filter(p => p.hour === hour);
              return (
                <TooltipProvider key={hour}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div
                        className="aspect-square rounded-xl flex flex-col items-center justify-center border border-white/10 transition-all hover:scale-105 group relative overflow-hidden"
                        style={{
                          backgroundColor: count > 0 ? `rgba(168, 85, 247, ${getOpacity(count)})` : "rgba(255, 255, 255, 0.03)",
                          boxShadow: count > 0 ? `0 0 20px rgba(168, 85, 247, ${getOpacity(count) * 0.4})` : "none",
                        }}
                      >
                        <div className={`text-[10px] font-mono ${count > 0 ? "text-white font-bold" : "text-zinc-500"}`}>
                          {hour}:00
                        </div>
                        {count > 0 && (
                          <div className="text-[10px] text-purple-200 mt-0.5">
                            {count} solve{count > 1 ? 's' : ''}
                          </div>
                        )}
                        {count > 0 && <div className="absolute top-0 right-0 p-1 bg-white/20 rounded-bl-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_white]" />
                        </div>}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground text-xs p-3 border border-border min-w-[150px]">
                      <p className="font-bold border-b border-border pb-1 mb-2">Hour {hour}:00</p>
                      {hourProblems.length > 0 ? (
                        <div className="space-y-2">
                          {hourProblems.map(p => (
                            <div key={p.id} className="text-muted-foreground">
                              <span className={`inline-block mr-1 text-[8px] font-bold px-1.5 py-0.5 rounded leading-none ${p.difficulty === 'EASY' ? 'bg-emerald-500/20 text-emerald-400' :
                                p.difficulty === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>{p.difficulty}</span>
                              {p.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-500 italic text-center">No problems solved</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        <span>Less active</span>
        <div className="flex gap-1">
          {[0.1, 0.4, 0.7, 1].map((op) => (
            <div
              key={op}
              className="h-2 w-2 rounded-[1px]"
              style={{ backgroundColor: `rgba(168, 85, 247, ${op})` }}
            />
          ))}
        </div>
        <span>More active</span>
      </div>
    </div>
  );
}
