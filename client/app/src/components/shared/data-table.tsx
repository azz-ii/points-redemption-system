"use client"

import * as React from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  FilterFn,
  RowSelectionState,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Settings2,
  Plus,
  UserPlus,
  RotateCw,
  Download,
  Coins,
  BookOpen,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void

  // Toolbar actions
  onDeleteSelected?: (selectedRows: TData[]) => void
  onCreateNew?: () => void
  createButtonLabel?: string
  createButtonIcon?: "user" | "plus"
  onSetPoints?: () => void
  onSetInventory?: () => void
  onRefresh?: () => void
  refreshing?: boolean
  onExport?: (selectedRows: TData[]) => void

  // Row selection
  enableRowSelection?: boolean
  // Custom labels
  deleteSelectedLabel?: string

  // Search
  searchPlaceholder?: string
  globalFilterFn?: FilterFn<TData>
  showSearch?: boolean

  // Display
  showPagination?: boolean
  showColumnVisibility?: boolean
  pageSize?: number
  initialSorting?: SortingState
  initialColumnVisibility?: VisibilityState
  loadingMessage?: string
  emptyMessage?: string

  // Server-side pagination
  manualPagination?: boolean
  pageCount?: number
  totalResults?: number
  currentPage?: number
  onPageChange?: (pageIndex: number) => void
  onSearch?: (query: string) => void

  // Page size selection
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void

  // Inline editing (Accounts-specific)
  editingRowId?: number | null
  editedData?: Record<string, any>
  onFieldChange?: (field: string, value: any) => void
  fieldErrors?: Record<string, string>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  error = null,
  onRetry,
  onDeleteSelected,
  onCreateNew,
  createButtonLabel = "Add New",
  createButtonIcon = "plus",
  onSetPoints,
  onSetInventory,
  onRefresh,
  refreshing = false,
  onExport,
  enableRowSelection: enableRowSelectionProp,
  deleteSelectedLabel = "Delete",
  searchPlaceholder = "Search...",
  globalFilterFn,
  showSearch = true,
  showPagination = true,
  showColumnVisibility = true,
  pageSize = 15,
  initialSorting = [],
  initialColumnVisibility = {},
  loadingMessage = "Loading...",
  emptyMessage = "No results found",
  editingRowId = null,
  editedData = {},
  onFieldChange,
  fieldErrors = {},
  manualPagination = false,
  pageCount,
  totalResults,
  currentPage,
  onPageChange,
  onSearch,
  pageSizeOptions = [15, 50, 100],
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [searchValue, setSearchValue] = React.useState("")

  // Debounce server-side search
  React.useEffect(() => {
    if (!onSearch) return
    const timer = setTimeout(() => {
      onSearch(searchValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, onSearch])

  const enableRowSelection = enableRowSelectionProp ?? !!(onDeleteSelected)
  const CreateIcon = createButtonIcon === "user" ? UserPlus : Plus

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      ...(enableRowSelection ? { rowSelection } : {}),
      ...(manualPagination
        ? { pagination: { pageIndex: currentPage ?? 0, pageSize } }
        : { globalFilter }),
    },
    meta: {
      editingRowId,
      editedData,
      onFieldChange,
      fieldErrors,
    },
    enableRowSelection,
    ...(enableRowSelection ? { onRowSelectionChange: setRowSelection } : {}),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount: pageCount ?? -1,
          onPaginationChange: (updater: any) => {
            const old = { pageIndex: currentPage ?? 0, pageSize }
            const newState = typeof updater === 'function' ? updater(old) : updater
            onPageChange?.(newState.pageIndex)
          },
        }
      : { onGlobalFilterChange: setGlobalFilter }),
    getCoreRowModel: getCoreRowModel(),
    ...(!manualPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(!manualPagination && globalFilterFn ? { globalFilterFn } : {}),
    columnResizeMode: "onChange" as const,
    defaultColumn: {
      minSize: 50,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  const selectedRows = enableRowSelection
    ? table.getFilteredSelectedRowModel().rows.map(row => row.original)
    : []
  const hasSelection = selectedRows.length > 0

  const showToolbar = showSearch || onRefresh || showColumnVisibility || onExport || onCreateNew || onSetPoints || onSetInventory

  return (
    <div className="space-y-4">
      {showToolbar && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {showSearch && (
              <Input
                placeholder={searchPlaceholder}
                value={manualPagination ? searchValue : (globalFilter ?? "")}
                onChange={(event) => {
                  if (manualPagination) {
                    setSearchValue(event.target.value)
                  } else {
                    setGlobalFilter(event.target.value)
                  }
                }}
                className="max-w-sm"
              />
            )}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={refreshing}
                className="h-9 flex gap-2"
              >
                <RotateCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            {showColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex gap-2"
                  >
                    <Settings2 className="h-4 w-4" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[150px]">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter(
                      (column) =>
                        typeof column.accessorFn !== "undefined" && column.getCanHide()
                    )
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id.replace(/_/g, " ")}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport(selectedRows)}
                className="h-9 flex gap-2"
              >
                <Download className="h-4 w-4" />
                Export{hasSelection ? ` (${selectedRows.length})` : ""}
              </Button>
            )}
            {hasSelection && onDeleteSelected && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteSelected(selectedRows)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteSelectedLabel} {selectedRows.length}
              </Button>
            )}
          </div>
          {(onCreateNew || onSetPoints || onSetInventory) && (
            <div className="flex gap-2">
              {onSetInventory && (
                <button
                  onClick={onSetInventory}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 border border-blue-700 hover:bg-blue-900 text-blue-400 transition-colors font-semibold"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Set Inventory</span>
                </button>
              )}
              {onSetPoints && (
                <button
                  onClick={onSetPoints}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold"
                >
                  <Coins className="h-5 w-5" />
                  <span>Set Points</span>
                </button>
              )}
              {onCreateNew && (
                <button
                  onClick={onCreateNew}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
                >
                  <CreateIcon className="h-5 w-5" />
                  <span>{createButtonLabel}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden" style={{ height: "70vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <Table style={{ width: "100%", minWidth: table.getTotalSize() }}>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-semibold relative group"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          onDoubleClick={() => header.column.resetSize()}
                          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none opacity-0 group-hover:opacity-100 hover:bg-primary ${
                            header.column.getIsResizing()
                              ? "bg-primary opacity-100 w-[3px]"
                              : "bg-border"
                          }`}
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading && data.length === 0 ? (
                // Skeleton loading rows
                Array.from({ length: 10 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {table.getAllColumns().filter(col => col.getIsVisible()).map((column, colIndex) => {
                      const isFirstCol = colIndex === 0;
                      const isLastCol = colIndex === table.getVisibleFlatColumns().length - 1;
                      const isSecondLastCol = colIndex === table.getVisibleFlatColumns().length - 2;
                      
                      return (
                        <TableCell key={column.id} style={{ width: column.getSize() }}>
                          {isFirstCol && enableRowSelection ? (
                            // Checkbox column
                            <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                          ) : isLastCol ? (
                            // Actions column
                            <div className="flex justify-end gap-2">
                              <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
                              <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
                            </div>
                          ) : isSecondLastCol ? (
                            // Status badge column
                            <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
                          ) : (
                            // Regular text column
                            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-red-500 text-sm">{error}</p>
                      {onRetry && (
                        <Button
                          onClick={onRetry}
                          variant="outline"
                          size="sm"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const rowId = (row.original as any)?.id
                  const isRowEditing = editingRowId != null && editingRowId === rowId

                  return (
                    <TableRow
                      key={row.id}
                      data-state={enableRowSelection && row.getIsSelected() ? "selected" : undefined}
                      className={isRowEditing ? "bg-blue-50 dark:bg-blue-950" : ""}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {showPagination && (
          <div className="flex items-center justify-between p-4 border-t gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {hasSelection ? (
                  <span>
                    {selectedRows.length} of {manualPagination ? (totalResults ?? data.length) : table.getFilteredRowModel().rows.length} row(s) selected
                  </span>
                ) : (
                  <span>
                    Showing {table.getRowModel().rows.length} of {manualPagination ? (totalResults ?? data.length) : table.getFilteredRowModel().rows.length} results
                  </span>
                )}
              </div>
              {pageSizeOptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value)
                      table.setPageSize(newSize)
                      onPageSizeChange?.(newSize)
                    }}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                    {manualPagination && totalResults ? (
                      <option value={totalResults}>All ({totalResults})</option>
                    ) : !manualPagination ? (
                      <option value={data.length}>All</option>
                    ) : null}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="inline-flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="inline-flex items-center gap-2"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
