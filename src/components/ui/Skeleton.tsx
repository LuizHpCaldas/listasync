"use client";

interface Props {
  className?: string;
}

export default function Skeleton({ className = "" }: Props) {
  return (
    <div className={`animate-pulse rounded-xl bg-zinc-800 ${className}`} />
  );
}
