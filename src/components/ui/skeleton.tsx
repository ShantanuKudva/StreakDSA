"use client";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/[0.03]",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 skeleton-shimmer" />
    </div>
  );
}

export { Skeleton };
