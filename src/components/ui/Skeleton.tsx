'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--bg-tertiary)] rounded ${className}`}
    />
  );
}

export function ScoreCardSkeleton() {
  return (
    <div className="w-64 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Score Display */}
      <div className="p-6 flex flex-col items-center">
        <Skeleton className="w-20 h-20 rounded-2xl mb-3" />
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-2 w-full rounded-full mb-2" />
        <div className="flex justify-between w-full">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 pb-4 space-y-2">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
}

export function FilterPanelSkeleton() {
  return (
    <div className="w-72 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
      </div>

      {/* Categories */}
      <div className="p-2 space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-2 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-3 w-8" />
            </div>
            {i === 1 && (
              <div className="space-y-2 pl-7">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

export function MapLoadingSkeleton() {
  return (
    <div className="absolute inset-0 bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[var(--border-default)]" />
          {/* Spinning arc */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent-primary)] animate-spin" />
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
          </div>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Loading map...</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">Initializing NYC data</p>
      </div>
    </div>
  );
}

