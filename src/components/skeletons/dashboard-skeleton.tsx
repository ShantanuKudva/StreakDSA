import { Skeleton } from "@/components/ui/skeleton";
import { HeatmapSkeleton } from "@/components/skeletons/heatmap-skeleton";
import { CardSpotlight } from "@/components/ui/card-spotlight";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Hero Streak Section */}
        <section className="text-center py-8 space-y-2">
          <div className="text-sm text-muted-foreground uppercase tracking-wider h-4 flex justify-center">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex justify-center py-2">
            <Skeleton className="h-32 w-48" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex justify-center mt-4 pt-2">
            <Skeleton className="h-4 w-24" />
          </div>
        </section>

        {/* Progress Bar */}
        <section>
          <CardSpotlight className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </CardSpotlight>
        </section>

        {/* Check-in Status */}
        <section>
          <Skeleton className="h-10 w-full rounded-lg" />
        </section>

        {/* Heatmap */}
        <section>
          <HeatmapSkeleton />
        </section>

        {/* Problem Logger & List */}
        <section className="space-y-4">
          <CardSpotlight className="p-4 h-12 flex items-center justify-center">
            <Skeleton className="h-4 w-32" />
          </CardSpotlight>

          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
