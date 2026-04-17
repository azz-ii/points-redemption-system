"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, ArrowUpDown, XCircle, MoreHorizontal, CheckCircle, XCircle as XCircleIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import type { RedemptionRequest } from "../modals/types"

interface ColumnContext {
  onViewRequest: (request: RedemptionRequest) => void
  onCancelRequest: (request: RedemptionRequest) => void
  onApprove?: (request: RedemptionRequest) => void
  onReject?: (request: RedemptionRequest) => void
  username?: string | null
  userPosition?: string | null
}

export const createColumns = (context: ColumnContext): ColumnDef<RedemptionRequest>[] => [
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Approval Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const request = row.original
      const normalizedStatus = request.status?.toUpperCase() || ""
      
      let statusLabel = ""
      let statusType: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN" = "PENDING"
      
      switch (normalizedStatus) {
        case "APPROVED":
          statusLabel = "Approved"
          statusType = "APPROVED"
          break
        case "REJECTED":
          statusLabel = "Rejected"
          statusType = "REJECTED"
          break
        case "WITHDRAWN":
          statusLabel = "Withdrawn"
          statusType = "WITHDRAWN"
          break
        default:
          statusLabel = "Pending"
          statusType = "PENDING"
      }
      
      return (
        <div className="text-sm font-medium">
          <StatusBadge status={statusType} label={statusLabel} size="sm" />
        </div>
      )
    },
  },
  {
    accessorKey: "processing_status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Processing Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const request = row.original
      const approvalStatus = request.status?.toUpperCase() || ""
      const processingStatus = request.processing_status?.toUpperCase() || ""
      
      // Only show processing status if request is approved
      if (approvalStatus !== "APPROVED") {
        return (
          <div className="text-sm text-muted-foreground opacity-50">
            —
          </div>
        )
      }
      
      let statusLabel = ""
      let statusType: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN" = "PENDING"
      
      switch (processingStatus) {
        case "PROCESSED":
          statusLabel = "Processed"
          statusType = "APPROVED"
          break
        case "PARTIALLY_PROCESSED":
          statusLabel = "Partial"
          statusType = "APPROVED"
          break
        case "CANCELLED":
          statusLabel = "Cancelled"
          statusType = "WITHDRAWN"
          break
        default:
          statusLabel = "Pending"
          statusType = "PENDING"
      }
      
      return (
        <div className="text-sm font-medium">
          <StatusBadge status={statusType} label={statusLabel} size="sm" />
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const request = row.original
      const normalizedStatus = request.status.toUpperCase()
      const isOwnRequest = request.requested_by_username === context.username;

      const canCancel = 
        normalizedStatus === "PENDING" &&
        request.sales_approval_status !== "APPROVED" &&
        isOwnRequest;

      const canApproveReject = 
        normalizedStatus === "PENDING" &&
        context.userPosition?.toLowerCase() === "approver" &&
        !isOwnRequest;
      
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => context.onViewRequest(request)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {canCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => context.onCancelRequest(request)} className="text-destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                </>
              )}
              {canApproveReject && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => context.onApprove?.(request)} className="text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => context.onReject?.(request)} className="text-destructive">
                    <XCircleIcon className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 50,
  },
]
