"use client";
import { getStatusClasses } from "@/components/ui/status-badge";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, CheckCircle, ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { FlattenedRequestItem } from "../../ProcessRequests/modals/types";

interface ColumnContext {
  onViewRequest: (item: FlattenedRequestItem) => void;
  onMarkItemProcessed: (item: FlattenedRequestItem) => void;
}

export const createColumns = (
  context: ColumnContext
): ColumnDef<FlattenedRequestItem>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
        disabled={!!row.original.item_processed_by}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
  },
  {
    accessorKey: "product_code",
    header: "Item Code",
    cell: ({ row }) => {
      const code = row.getValue("product_code") as string;
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">
          {code}
        </span>
      );
    },
  },
  {
    accessorKey: "product_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Item Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("product_name") as string;
      const category = row.original.category;
      return (
        <div>
          <div className="font-medium">{name}</div>
          {category && (
            <div className="text-xs text-muted-foreground">{category}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "requested_for_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("requested_for_name")}</div>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Qty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("quantity")}</div>,
  },
  {
    accessorKey: "total_points",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Points
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue("total_points")}</div>
    ),
  },
  {
    accessorKey: "date_requested",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date_requested") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "request_status",
    header: "Request Status",
    cell: ({ row }) => {
      const status = row.getValue("request_status") as string;
      const statusDisplay = row.original.request_status_display;

return (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            getStatusClasses(status)
          }`}
        >
          {statusDisplay}
        </span>
      );
    },
  },
  {
    accessorKey: "request_processing_status",
    header: "Processing Status",
    cell: ({ row }) => {
      const processingStatus = row.original.request_processing_status;
      const processingDisplay = row.original.request_processing_status_display;
      const isProcessed = !!row.original.item_processed_by;

return isProcessed ? (
        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300">Item Processed
        </span>
      ) : (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            getStatusClasses(processingStatus)
          }`}
        >
          {processingDisplay}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      const isProcessed = !!item.item_processed_by;
      const canProcess =
        item.request_status === "APPROVED" &&
        item.request_processing_status !== "CANCELLED" &&
        !isProcessed;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => context.onViewRequest(item)}>
                <Eye className="mr-2 h-4 w-4" />
                View Request
              </DropdownMenuItem>
              {canProcess && (
                <DropdownMenuItem onClick={() => context.onMarkItemProcessed(item)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Processed
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 50,
  },
];
