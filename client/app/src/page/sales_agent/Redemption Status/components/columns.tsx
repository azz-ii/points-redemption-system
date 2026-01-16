"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, ArrowUpDown, X } from "lucide-react"
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
  onWithdrawItem?: (item: ExtendedItem) => void
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
    accessorKey: "variant_code",
    header: "Item Code",
    cell: ({ row }) => {
      const code = row.getValue("variant_code") as string
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
    accessorKey: "catalogue_item_name",
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
      const name = row.getValue("catalogue_item_name") as string
      return (
        <div className={context.isDark ? "text-gray-300" : "text-gray-700"}>
          {name}
        </div>
      )
    },
  },
  {
    accessorKey: "variant_option",
    header: "Variant",
    cell: ({ row }) => {
      const variant = row.getValue("variant_option") as string | null
      return (
        <div className={`text-sm ${context.isDark ? "text-gray-400" : "text-gray-600"}`}>
          {variant || "-"}
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
    header: "Request Status",
    cell: ({ row }) => {
      const item = row.original
      const status = item.status
      const getStatusColor = () => {
        switch (status) {
          case "PENDING":
            return "bg-yellow-400 text-black"
          case "APPROVED":
            return "bg-green-500 text-white"
          case "REJECTED":
            return "bg-red-500 text-white"
          case "WITHDRAWN":
            return "bg-gray-500 text-white"
          default:
            return "bg-gray-400 text-white"
        }
      }
      return (
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor()}`}>
          {item.status_display}
        </span>
      )
    },
  },
  {
    accessorKey: "processing_status",
    header: "Processing Status",
    cell: ({ row }) => {
      const item = row.original
      const processingStatus = item.processing_status
      const getProcessingStatusColor = () => {
        switch (processingStatus?.toUpperCase()) {
          case "PROCESSED":
            return "bg-green-600 text-white"
          case "CANCELLED":
            return "bg-red-600 text-white"
          case "NOT_PROCESSED":
          default:
            return "bg-yellow-500 text-gray-900"
        }
      }
      return (
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getProcessingStatusColor()}`}>
          {item.request?.processing_status_display || "Not Processed"}
        </span>
      )
    },
  },
  {
    accessorKey: "date_processed",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Processed Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const item = row.original
      const dateProcessed = item.request?.date_processed
      return (
        <div className={context.isDark ? "text-gray-300" : "text-gray-700"}>
          {dateProcessed ? new Date(dateProcessed).toLocaleDateString() : (
            <span className={context.isDark ? "text-gray-500 italic" : "text-gray-400 italic"}>
              N/A
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right"></div>,
    cell: ({ row }) => {
      const item = row.original
      const isPending = item.status === "PENDING"
      return (
        <div className="flex justify-end gap-2">
          {isPending && context.onWithdrawItem && (
            <button
              onClick={() => context.onWithdrawItem!(item)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                context.isDark
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
              aria-label="Withdraw"
            >
              <X className="h-4 w-4" />
              Withdraw
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
