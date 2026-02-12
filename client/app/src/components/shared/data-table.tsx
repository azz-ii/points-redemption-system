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
  Ban,
  Plus,
  UserPlus,
  RotateCw,
  Download,
  Coins,
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
  onBanSelected?: (selectedRows: TData[]) => void
  onCreateNew?: () => void
  createButtonLabel?: string
  createButtonIcon?: "user" | "plus"
  onSetPoints?: () => void
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
  loadingMessage?: string
  emptyMessage?: string

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
  onBanSelected,
  onCreateNew,
  createButtonLabel = "Add New",
  createButtonIcon = "plus",
  onSetPoints,
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
  loadingMessage = "Loading...",
  emptyMessage = "No results found",
  editingRowId = null,
  editedData = {},
  onFieldChange,
  fieldErrors = {},
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  const enableRowSelection = enableRowSelectionProp ?? !!(onDeleteSelected || onBanSelected)
  const CreateIcon = createButtonIcon === "user" ? UserPlus : Plus

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      ...(enableRowSelection ? { rowSelection } : {}),
      globalFilter,
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
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(globalFilterFn ? { globalFilterFn } : {}),
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

  const showToolbar = showSearch || onRefresh || showColumnVisibility || onExport || onCreateNew || onSetPoints

  return (
    <div className="space-y-4">
      {showToolbar && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {showSearch && (
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
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
            {hasSelection && onBanSelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBanSelected(selectedRows)}
                className="border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950"
              >
                <Ban className="mr-2 h-4 w-4" />
                Ban {selectedRows.length}
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
          {(onCreateNew || onSetPoints) && (
            <div className="flex gap-2">
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
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading && data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">
                        {loadingMessage}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
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
                        <TableCell key={cell.id}>
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
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
              {hasSelection ? (
                <span>
                  {selectedRows.length} of {table.getFilteredRowModel().rows.length} row(s) selected
                </span>
              ) : (
                <span>
                  Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} results
                </span>
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
