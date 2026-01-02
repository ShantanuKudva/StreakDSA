"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CardSpotlight } from "@/components/ui/card-spotlight";

export function StatsCardSkeleton() {
  return (
    <CardSpotlight className="p-6 space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-2 w-full" />
    </CardSpotlight>
  );
}
