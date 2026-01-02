"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CardSpotlight } from "@/components/ui/card-spotlight";

export function HeatmapSkeleton() {
  return (
    <CardSpotlight className="p-6 space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-7 gap-1.5 opacity-20">
        {Array.from({ length: 28 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-sm" />
        ))}
      </div>
    </CardSpotlight>
  );
}
