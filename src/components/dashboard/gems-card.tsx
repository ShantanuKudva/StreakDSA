"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem } from "lucide-react";

interface GemsCardProps {
  gems: number;
}

export function GemsCard({ gems }: GemsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Gem className="h-5 w-5" />
          Gems Earned
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-purple-500">{gems}</span>
          <span className="text-2xl text-muted-foreground">💎</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Keep going to earn more!
        </p>
      </CardContent>
    </Card>
  );
}
