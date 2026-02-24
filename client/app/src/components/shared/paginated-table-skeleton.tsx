interface ColumnDef {
  span: number
  widthPercent?: number
}

interface PaginatedTableSkeletonProps {
  columns: ColumnDef[]
  rowCount?: number
}

const COL_SPAN_CLASS: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
}

export function PaginatedTableSkeleton({
  columns,
  rowCount = 10,
}: PaginatedTableSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-12 gap-4 items-center py-3 border-b border-border"
        >
          {columns.map((col, colIndex) => (
            <div key={colIndex} className={COL_SPAN_CLASS[col.span]}>
              <div
                className="h-4 rounded bg-muted animate-pulse"
                style={{ width: `${col.widthPercent ?? 75}%` }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
