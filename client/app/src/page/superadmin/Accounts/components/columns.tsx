"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Ban, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { Account } from "../modals"

interface ColumnContext {
  onViewAccount: (account: Account) => void
  onEditAccount: (account: Account) => void
  onBanAccount: (account: Account) => void
  onDeleteAccount: (account: Account) => void
}

export const createColumns = (context: ColumnContext): ColumnDef<Account>[] => [
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
    header: "ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id") ?? "N/A"}</div>,
  },
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("username") || "N/A"}</div>,
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("full_name") || "N/A"}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("email") || "N/A"}</div>,
  },
  {
    accessorKey: "position",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const position = row.getValue("position") as string
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-black">
          {position || "N/A"}
        </span>
      )
    },
  },
  {
    accessorKey: "points",
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
    cell: ({ row }) => {
      const points = row.getValue("points") as number
      return <div>{points?.toLocaleString() ?? 0}</div>
    },
  },
  {
    accessorKey: "is_activated",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const isActivated = row.getValue("is_activated") as boolean
      const isBanned = row.original.is_banned
      
      return (
        <div className="flex gap-1">
          {isActivated ? (
            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500 text-white">
              Inactive
            </span>
          )}
          {isBanned && (
            <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white">
              Banned
            </span>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      // Custom filter for status - can filter by "active", "inactive", or "banned"
      const isActivated = row.getValue(id) as boolean
      const isBanned = row.original.is_banned
      
      if (value === "active") return isActivated && !isBanned
      if (value === "inactive") return !isActivated
      if (value === "banned") return isBanned
      return true
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const account = row.original

      return (
        <div className="flex justify-end gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onViewAccount(account)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onBanAccount(account)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
            title="Ban"
          >
            <Ban className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onEditAccount(account)}
            className="bg-gray-500 hover:bg-gray-600 text-white"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onDeleteAccount(account)}
            className="bg-red-500 hover:bg-red-600 text-white"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
