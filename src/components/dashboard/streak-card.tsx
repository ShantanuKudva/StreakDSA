"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakCardProps {
  current: number;
  max: number;
}

export function StreakCard({ current, max }: StreakCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Current Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-orange-500">{current}</span>
          <span className="text-2xl text-muted-foreground">days</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Best streak:{" "}
          <span className="font-semibold text-foreground">{max} days</span>
        </p>
      </CardContent>
    </Card>
  );
}
