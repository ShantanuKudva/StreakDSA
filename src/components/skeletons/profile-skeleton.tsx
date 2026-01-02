"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { ProfileCardSkeleton } from "@/components/skeletons/profile-card-skeleton";
import { HeatmapSkeleton } from "@/components/skeletons/heatmap-skeleton";
import { ChartSkeleton } from "@/components/skeletons/chart-skeleton";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Profile Card */}
        <ProfileCardSkeleton />

        {/* Activity Heatmap */}
        <HeatmapSkeleton />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSpotlight key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-12" />
            </CardSpotlight>
          ))}
        </div>

        {/* Charts */}
        <ChartSkeleton />
      </div>
    </div>
  );
}
