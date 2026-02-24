interface MobileCardsSkeletonProps {
  count?: number
  showHeader?: boolean
  headerTitle?: string
}

export function MobileCardsSkeleton({
  count = 6,
  showHeader = true,
  headerTitle = "Results",
}: MobileCardsSkeletonProps) {
  return (
    <div className="md:hidden" aria-live="polite">
      {showHeader && (
        <>
          <h2 className="text-xl font-bold mb-2">{headerTitle}</h2>
          <div className="h-4 w-48 rounded bg-muted animate-pulse mb-4" />
        </>
      )}

      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border bg-card border-border"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 space-y-2">
                {/* ID or small text */}
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                {/* Main title */}
                <div className="h-5 w-3/5 rounded bg-muted animate-pulse" />
              </div>
              {/* Status badge */}
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
            </div>
            
            <div className="space-y-2 mb-3">
              {/* Details row */}
              <div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
              {/* Date or secondary info */}
              <div className="h-3 w-2/5 rounded bg-muted animate-pulse" />
            </div>
            
            {/* Action button */}
            <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-4">
        <div className="h-9 w-20 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="h-9 w-20 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  )
}
