"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DeveloperCardSkeleton() {
  return (
    <div className="relative flex items-center gap-5 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      {/* Left accent bar */}
      <Skeleton className="absolute left-0 top-0 h-full w-1 rounded-l-xl" />

      {/* Avatar */}
      <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-2.5">
        {/* Company name + status badge row */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Meta row: contact · phone · email */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-3 w-36 rounded" />
        </div>
      </div>

      {/* Arrow placeholder */}
      <Skeleton className="h-4 w-4 shrink-0 rounded" />
    </div>
  );
}

export function DeveloperListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <DeveloperCardSkeleton key={i} />
      ))}
    </div>
  );
}
