import { Skeleton } from "@/components/ui/skeleton";
import { CardSpotlight } from "@/components/ui/card-spotlight";

export function LogsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="py-2">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
        </header>

        <main className="grid md:grid-cols-[auto_1fr] gap-8">
          {/* Left: Calendar Skeleton */}
          <div className="space-y-4 w-[280px]">
            <CardSpotlight className="p-3">
              <div className="aspect-square w-full">
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="aspect-square w-full rounded-sm opacity-50"
                    />
                  ))}
                </div>
              </div>
            </CardSpotlight>
            <div className="flex justify-center">
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          {/* Right: Details Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
