import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ColumnConfig {
  width?: number | string
  align?: "left" | "center" | "right"
  type?: "checkbox" | "text" | "badge" | "actions"
}

interface TableSkeletonProps {
  columnCount?: number
  rowCount?: number
  showCheckbox?: boolean
  columnConfig?: ColumnConfig[]
  showToolbar?: boolean
  toolbarContent?: React.ReactNode
}

function SkeletonCell({ config }: { config: ColumnConfig }) {
  const { width = 100, align = "left", type = "text" } = config
  
  const alignClass = 
    align === "right" ? "justify-end" : 
    align === "center" ? "justify-center" : 
    "justify-start"

  if (type === "checkbox") {
    return (
      <div className={`flex ${alignClass}`}>
        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
      </div>
    )
  }

  if (type === "badge") {
    return (
      <div className={`flex ${alignClass}`}>
        <div 
          className="h-6 rounded-full bg-muted animate-pulse"
          style={{ width: typeof width === 'number' ? `${width}px` : width }}
        />
      </div>
    )
  }

  if (type === "actions") {
    return (
      <div className={`flex ${alignClass} gap-2`}>
        <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
        <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className={`flex ${alignClass}`}>
      <div
        className="h-4 rounded bg-muted animate-pulse"
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
      />
    </div>
  )
}

export function TableSkeleton({
  columnCount = 8,
  rowCount = 10,
  showCheckbox = true,
  columnConfig,
  showToolbar = true,
  toolbarContent,
}: TableSkeletonProps) {
  // Default column configuration if not provided
  const defaultColumnConfig: ColumnConfig[] = [
    ...(showCheckbox ? [{ width: 40, type: "checkbox" as const }] : []),
    { width: 60, type: "text" as const },   // ID
    { width: 150, type: "text" as const },  // Name/Main field
    { width: 80, type: "text" as const },   // Secondary field
    { width: 100, type: "text" as const },  // Tertiary field
    { width: 120, type: "text" as const },  // Date or similar
    { width: 80, type: "badge" as const },  // Status badge
    { width: 100, align: "right" as const, type: "actions" as const }, // Actions
  ]

  const configs = columnConfig || defaultColumnConfig.slice(0, columnCount)

  return (
    <div className="space-y-4">
      {showToolbar && (
        <div className="flex items-center justify-between gap-2">
          {toolbarContent || (
            <>
              <div className="flex items-center gap-2">
                {/* Search bar skeleton */}
                <div className="h-9 w-64 rounded-md bg-muted animate-pulse" />
                {/* Refresh button skeleton */}
                <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
                {/* Columns button skeleton */}
                <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
              </div>
              <div className="flex gap-2">
                {/* Action button skeleton */}
                <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
              </div>
            </>
          )}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden" style={{ height: "70vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                {configs.map((_, index) => (
                  <TableHead key={index}>
                    <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {configs.map((config, colIndex) => (
                    <TableCell key={colIndex}>
                      <SkeletonCell config={config} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
