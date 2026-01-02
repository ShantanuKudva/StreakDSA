import { Skeleton } from "@/components/ui/skeleton";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { HeatmapSkeleton } from "@/components/skeletons/heatmap-skeleton";
import { ChartSkeleton } from "@/components/skeletons/chart-skeleton";
import { ProfileCardSkeleton } from "@/components/skeletons/profile-card-skeleton";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT COLUMN (2/3) */}
          <div className="md:col-span-2 space-y-6">
            <ProfileCardSkeleton />
            <HeatmapSkeleton />

            {/* Streak Hero Skeleton */}
            <CardSpotlight className="p-8 space-y-6">
              <div className="flex items-center gap-6">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-32" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            </CardSpotlight>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSpotlight className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardSpotlight>
              <CardSpotlight className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardSpotlight>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="space-y-6">
            <CardSpotlight className="p-6 space-y-4">
              <Skeleton className="h-4 w-24" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16" />
                ))}
              </div>
            </CardSpotlight>
            <CardSpotlight className="p-6 space-y-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardSpotlight>
            <CardSpotlight className="p-6 space-y-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardSpotlight>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
