"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, ArrowUpDown, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { RedemptionRequest } from "../modals/types"
import { StatusChip } from "./StatusChip"

interface ColumnContext {
  onViewRequest: (request: RedemptionRequest) => void
  onCancelRequest: (request: RedemptionRequest) => void
}

export const createColumns = (context: ColumnContext): ColumnDef<RedemptionRequest>[] => [
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
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Request ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">#{row.getValue("id")}</div>
    ),
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
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("requested_for_name") as string
      return (
        <div className="text-foreground">
          {name}
        </div>
      )
    },
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.getValue("items") as any[]
      const itemCount = items?.length || 0
      return (
        <div className="text-sm text-muted-foreground">
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </div>
      )
    },
    enableSorting: false,
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
          Total Points
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
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
          Date Requested
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateStr = row.getValue("date_requested") as string
      const date = new Date(dateStr)
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const request = row.original
      return (
        <StatusChip
          status={request.status as any}
          processingStatus={request.processing_status as any}
        />
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const request = row.original
      const normalizedStatus = request.status.toUpperCase()
      const canCancel = 
        normalizedStatus === "PENDING" &&
        request.sales_approval_status !== "APPROVED"
      
      return (
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => context.onViewRequest(request)}
            variant="default"
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canCancel && (
            <Button
              onClick={() => context.onCancelRequest(request)}
              variant="default"
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              title="Cancel"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
