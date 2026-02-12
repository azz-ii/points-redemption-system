function SkeletonCard() {
  return (
    <div
      className="rounded-lg overflow-hidden border bg-card border-border"
    >
      {/* Image skeleton */}
      <div className="bg-gray-300 dark:bg-gray-700 h-40 md:h-48 animate-pulse" />
      {/* Content skeleton */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {/* Title skeleton */}
            <div
              className="h-4 md:h-5 rounded mb-2 animate-pulse bg-muted"
              style={{ width: "70%" }}
            />
            {/* Points skeleton */}
            <div
              className="h-3 md:h-4 rounded mb-2 animate-pulse bg-muted"
              style={{ width: "40%" }}
            />
            {/* Category skeleton */}
            <div
              className="h-3 rounded animate-pulse bg-muted"
              style={{ width: "50%" }}
            />
          </div>
          {/* Button skeleton */}
          <div
            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 animate-pulse bg-muted"
          />
        </div>
      </div>
    </div>
  );
}

export function ItemsLoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
