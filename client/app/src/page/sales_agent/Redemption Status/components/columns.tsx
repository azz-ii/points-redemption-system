"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, ArrowUpDown, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { RedemptionRequestItem, RedemptionRequest } from "../modals/types"
import { StatusChip } from "./StatusChip"

type ExtendedItem = RedemptionRequestItem & {
  requestId: number
  status: string
  status_display: string
  processing_status: string
  date_requested: string
  request: RedemptionRequest
}

interface ColumnContext {
  onViewItem: (item: ExtendedItem) => void
  onCancelRequest: (item: ExtendedItem) => void
  isDark: boolean
}

export const createColumns = (context: ColumnContext): ColumnDef<ExtendedItem>[] => [
  {
    accessorKey: "requestId",
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
      <div className="font-medium">#{row.getValue("requestId")}</div>
    ),
  },
  {
    accessorKey: "product_code",
    header: "Item Code",
    cell: ({ row }) => {
      const code = row.getValue("product_code") as string
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            context.isDark
              ? "bg-gray-700 text-gray-200"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {code}
        </span>
      )
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
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("product_name") as string
      return (
        <div className={context.isDark ? "text-gray-300" : "text-gray-700"}>
          {name}
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string | null
      return (
        <div className={`text-sm ${context.isDark ? "text-gray-400" : "text-gray-600"}`}>
          {category || "-"}
        </div>
      )
    },
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
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
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
      )
    },
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue("total_points")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const item = row.original
      return (
        <StatusChip
          status={item.status as any}
          processingStatus={item.processing_status as any}
          isDark={context.isDark}
        />
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right"></div>,
    cell: ({ row }) => {
      const item = row.original
      const normalizedStatus = item.status.toUpperCase()
      const canCancel = 
        normalizedStatus === "PENDING" &&
        item.request.sales_approval_status !== "APPROVED"
      
      return (
        <div className="flex justify-end gap-2">
          {canCancel && (
            <button
              onClick={() => context.onCancelRequest(item)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                context.isDark
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
              aria-label="Cancel request"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>
          )}
          <button
            onClick={() => context.onViewItem(item)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              context.isDark
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            aria-label="View"
          >
            <Eye className="h-4 w-4" />
            View
          </button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
