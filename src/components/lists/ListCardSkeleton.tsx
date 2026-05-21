"use client";

import Skeleton from "../ui/Skeleton";

export default function ListCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />

        <Skeleton className="h-5 w-16" />
      </div>

      <Skeleton className="mt-6 h-8 w-40" />

      <Skeleton className="mt-8 h-4 w-24" />

      <Skeleton className="mt-3 h-10 w-32" />
    </div>
  );
}
