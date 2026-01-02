"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { LogEntrySkeleton } from "@/components/skeletons/log-entry-skeleton";

export function LogsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>

        {/* Log List */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <LogEntrySkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
