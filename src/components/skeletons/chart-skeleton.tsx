"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CardSpotlight } from "@/components/ui/card-spotlight";

export function ChartSkeleton() {
  return (
    <CardSpotlight className="p-6 space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-[250px] w-full rounded-lg" />
    </CardSpotlight>
  );
}
