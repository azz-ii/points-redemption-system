"use client"

import * as React from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, Trash2, Settings2, Ban, UserPlus, RotateCw, Download, Coins } from "lucide-react"

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
  onDeleteSelected?: (selectedRows: TData[]) => void
  onBanSelected?: (selectedRows: TData[]) => void
  onCreateNew?: () => void
  createButtonLabel?: string
  onSetPoints?: () => void
  onRefresh?: () => void
  refreshing?: boolean
  onExport?: () => void
  editingRowId?: number | null
  editedData?: Record<string, any>
  onEditRow?: (rowId: number) => void
  onSaveRow?: (rowId: number) => void
  onCancelEdit?: () => void
  onFieldChange?: (field: string, value: any) => void
  fieldErrors?: Record<string, string>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  onDeleteSelected,
  onBanSelected,
  onCreateNew,
  createButtonLabel = "Add New",
  onSetPoints,
  onRefresh,
  refreshing = false,
  onExport,
  editingRowId = null,
  editedData = {},
  onEditRow: _onEditRow,
  onSaveRow: _onSaveRow,
  onCancelEdit: _onCancelEdit,
  onFieldChange,
  fieldErrors = {},
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "id", desc: false }])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    meta: {
      editingRowId,
      editedData,
      onFieldChange,
      fieldErrors,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const username = String(row.getValue("username") || "").toLowerCase()
      const email = String(row.getValue("email") || "").toLowerCase()
      const fullName = String(row.getValue("full_name") || "").toLowerCase()
      
      return username.includes(searchValue) || 
             email.includes(searchValue) || 
             fullName.includes(searchValue)
    },
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
  const hasSelection = selectedRows.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by username, email, or full name..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
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
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id.replace("_", " ")}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="h-9 flex gap-2"
            >
              <Download className="h-4 w-4" />
              Export
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
              Delete {selectedRows.length}
            </Button>
          )}
        </div>
        {onCreateNew && (
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
            <button
              onClick={onCreateNew}
              className="px-4 py-2 rounded-lg flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
            >
              <UserPlus className="h-5 w-5" />
            <span>{createButtonLabel}</span>
          </button>
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ height: "70vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading && data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading accounts...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const rowId = (row.original as any).id
                  const isRowEditing = editingRowId === rowId
                  
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
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
                    No accounts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
      </div>
    </div>
  )
}
