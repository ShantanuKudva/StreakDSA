"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { StatsCardSkeleton } from "@/components/skeletons/stats-card-skeleton";
import { TodayLogSkeleton } from "@/components/skeletons/today-log-skeleton";
import { ProblemListSkeleton } from "@/components/skeletons/problem-list-skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Today's Log */}
        <TodayLogSkeleton />

        {/* Recent Problems */}
        <ProblemListSkeleton />
      </div>
    </div>
  );
}
