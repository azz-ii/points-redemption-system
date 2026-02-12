"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Ban, Pencil, Trash2, ArrowUpDown, Check, X, User, Clock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { Account } from "../modals"
import {
  EditableTextCell,
  EditableEmailCell,
  EditableNumberCell,
  EditableSelectCell,
} from "./editable-cells"

interface ColumnContext {
  onViewAccount: (account: Account) => void
  onEditAccount: (account: Account) => void
  onBanAccount: (account: Account) => void
  onDeleteAccount: (account: Account) => void
  onViewPointsHistory?: (account: Account) => void
  onToggleInlineEdit?: (account: Account) => void
  onSaveInlineEdit?: (accountId: number) => void
  onCancelInlineEdit?: () => void
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
        disabled={!!(table.options.meta as any)?.editingRowId}
      />
    ),
    cell: ({ row, table }) => {
      const isEditing = (table.options.meta as any)?.editingRowId === row.original.id
      
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
          disabled={!!(table.options.meta as any)?.editingRowId || isEditing}
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id") ?? "N/A"}</div>,
  },
  {
    accessorKey: "profile_picture",
    header: "",
    cell: ({ row }) => {
      const profilePicture = row.getValue("profile_picture") as string | null | undefined
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>
      )
    },
    enableSorting: false,
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
    cell: ({ row, table }) => {
      const meta = table.options.meta as any
      const isEditing = meta?.editingRowId === row.original.id
      const value = isEditing ? (meta?.editedData?.username ?? row.getValue("username")) : row.getValue("username")
      
      return (
        <EditableTextCell
          value={value as string}
          isEditing={isEditing}
          onChange={(val) => meta?.onFieldChange?.("username", val)}
          error={meta?.fieldErrors?.username}
        />
      )
    },
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
    cell: ({ row, table }) => {
      const meta = table.options.meta as any
      const isEditing = meta?.editingRowId === row.original.id
      const value = isEditing ? (meta?.editedData?.full_name ?? row.getValue("full_name")) : row.getValue("full_name")
      
      return (
        <EditableTextCell
          value={value as string}
          isEditing={isEditing}
          onChange={(val) => meta?.onFieldChange?.("full_name", val)}
          error={meta?.fieldErrors?.full_name}
        />
      )
    },
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
    cell: ({ row, table }) => {
      const meta = table.options.meta as any
      const isEditing = meta?.editingRowId === row.original.id
      const value = isEditing ? (meta?.editedData?.email ?? row.getValue("email")) : row.getValue("email")
      
      return (
        <EditableEmailCell
          value={value as string}
          isEditing={isEditing}
          onChange={(val) => meta?.onFieldChange?.("email", val)}
          error={meta?.fieldErrors?.email}
        />
      )
    },
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
    cell: ({ row, table }) => {
      const meta = table.options.meta as any
      const isEditing = meta?.editingRowId === row.original.id
      const value = isEditing ? (meta?.editedData?.position ?? row.getValue("position")) : row.getValue("position")
      
      return (
        <EditableSelectCell
          value={value as string}
          isEditing={isEditing}
          onChange={(val) => meta?.onFieldChange?.("position", val)}
          error={meta?.fieldErrors?.position}
        />
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
    cell: ({ row, table }) => {
      const meta = table.options.meta as any
      const isEditing = meta?.editingRowId === row.original.id
      const value = isEditing ? (meta?.editedData?.points ?? row.getValue("points")) : row.getValue("points")
      
      return (
        <EditableNumberCell
          value={value as number}
          isEditing={isEditing}
          onChange={(val) => meta?.onFieldChange?.("points", val)}
          error={meta?.fieldErrors?.points}
        />
      )
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
    cell: ({ row, table }) => {
      const account = row.original
      const meta = table.options.meta as any
      const isEditing = meta?.editingRowId === account.id
      const isAnyRowEditing = !!meta?.editingRowId

      if (isEditing) {
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => context.onSaveInlineEdit?.(account.id)}
              className="bg-green-500 hover:bg-green-600 text-white"
              title="Save"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => context.onCancelInlineEdit?.()}
              className="bg-gray-500 hover:bg-gray-600 text-white"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      }

      return (
        <div className="flex justify-end gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onViewAccount(account)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            title="View"
            disabled={isAnyRowEditing}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onBanAccount(account)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
            title="Ban"
            disabled={isAnyRowEditing}
          >
            <Ban className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onToggleInlineEdit?.(account)}
            className="bg-gray-500 hover:bg-gray-600 text-white"
            title="Edit"
            disabled={isAnyRowEditing}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onDeleteAccount(account)}
            className="bg-red-500 hover:bg-red-600 text-white"
            title="Delete"
            disabled={isAnyRowEditing}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onViewPointsHistory?.(account)}
            className="bg-purple-500 hover:bg-purple-600 text-white"
            title="Points History"
            disabled={isAnyRowEditing}
          >
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
