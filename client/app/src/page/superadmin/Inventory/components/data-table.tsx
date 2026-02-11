"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Settings2,
  RotateCw,
  Trash2,
  Download,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  searchQuery?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  showColumnVisibility?: boolean;
  onDeleteSelected?: (selectedRows: TData[]) => void;
  onCreateNew?: () => void;
  createButtonLabel?: string;
  onExport?: () => void;
  onSetInventory?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  error = null,
  onRetry,
  onRefresh,
  refreshing = false,
  searchQuery = "",
  showSearch = true,
  showPagination = true,
  showColumnVisibility = true,
  onDeleteSelected,
  onCreateNew,
  createButtonLabel = "Add New",
  onExport,
  onSetInventory,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const { resolvedTheme } = useTheme();

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
      const searchValue = String(filterValue).toLowerCase();
      const itemName = String(row.getValue("item_name") || "").toLowerCase();
      const itemCode = String(row.getValue("item_code") || "").toLowerCase();
      const category = String(row.getValue("category") || "").toLowerCase();

      return (
        itemName.includes(searchValue) ||
        itemCode.includes(searchValue) ||
        category.includes(searchValue)
      );
    },
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
  const hasSelection = selectedRows.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {showSearch && (
            <Input
              placeholder="Filter by item name, code, or category..."
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
                <Button variant="outline" size="sm" className="h-9 flex gap-2">
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
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id.replace(/_/g, " ")}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
            {onSetInventory && (
              <button
                onClick={onSetInventory}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  resolvedTheme === "dark"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                } transition-colors font-semibold`}
              >
                <span>Set Inventory</span>
              </button>
            )}
            <button
              onClick={onCreateNew}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                resolvedTheme === "dark"
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              } transition-colors font-semibold`}
            >
              <span>{createButtonLabel}</span>
            </button>
          </div>
        )}
      </div>

      <div
        className="border rounded-lg overflow-hidden flex flex-col"
        style={{ minHeight: "400px", maxHeight: "calc(100vh - 295px)" }}
      >
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
                    );
                  })}
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
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                      <p className="text-sm text-muted-foreground">
                        Loading inventory items...
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
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          size="sm"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
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
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {searchQuery
                      ? "No items match your search"
                      : "No inventory items found"}
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
                  Showing {table.getRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} results
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
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
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
  );
}
