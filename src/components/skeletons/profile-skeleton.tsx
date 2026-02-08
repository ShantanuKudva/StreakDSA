import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { CardSpotlight } from "@/components/ui/card-spotlight";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Tabs Skeleton */}
        <div className="bg-[#1a1b1e]/80 border border-white/5 p-1 rounded-lg w-fit">
          <div className="flex gap-1">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>

        {/* Hero Card Skeleton */}
        <CardSpotlight className="bg-[#1a1b1e]/80 border-white/5 p-8" color="rgba(168, 85, 247, 0.15)">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* User Info */}
            <div className="flex items-center gap-5">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-8 w-28 mt-1" />
              </div>
            </div>

            {/* Streak & Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full sm:w-auto">
              {/* Status Card */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 w-full sm:w-auto">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              {/* Streak Counter */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </div>
        </CardSpotlight>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Progress Card (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#1a1b1e]/80 border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-7 w-12 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>

              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Stats Grid (1 col wide) */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-[#1a1b1e]/80 border-white/5 p-4 flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
