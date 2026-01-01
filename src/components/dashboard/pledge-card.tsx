"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface PledgeCardProps {
  daysCompleted: number;
  totalDays: number;
  daysRemaining: number;
}

export function PledgeCard({
  daysCompleted,
  totalDays,
  daysRemaining,
}: PledgeCardProps) {
  const progressPercent = (daysCompleted / totalDays) * 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Pledge Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-emerald-500">
            {daysCompleted}
          </span>
          <span className="text-xl text-muted-foreground">/ {totalDays}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {daysRemaining > 0 ? (
            <>
              <span className="font-semibold text-foreground">
                {daysRemaining}
              </span>{" "}
              days remaining
            </>
          ) : (
            <span className="font-semibold text-emerald-500">
              🎉 Pledge complete!
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
