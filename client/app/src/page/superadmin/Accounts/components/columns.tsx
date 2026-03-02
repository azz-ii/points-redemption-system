"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Archive, ArchiveRestore, ArrowUpDown, Check, X, Clock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { Account } from "../modals"
import {
  EditableTextCell,
  EditableNumberCell,
  EditableSelectCell,
} from "./editable-cells"

interface ColumnContext {
  onViewAccount: (account: Account) => void
  onEditAccount: (account: Account) => void
  onArchiveAccount: (account: Account) => void
  onUnarchiveAccount: (account: Account) => void
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
    enableResizing: false,
    size: 40,
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

      if (!row.original.uses_points) {
        return <span className="text-muted-foreground">—</span>
      }

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
      const isArchived = row.original.is_archived
      
      if (isArchived) {
        return (
          <div className="flex gap-1">
            <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-600 text-white">
              Archived
            </span>
          </div>
        )
      }
      
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
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const isActivated = row.getValue(id) as boolean
      const isArchived = row.original.is_archived
      
      if (value === "active") return isActivated && !isArchived
      if (value === "inactive") return !isActivated && !isArchived
      if (value === "archived") return isArchived
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
      const isArchived = account.is_archived

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

      if (isArchived) {
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
              onClick={() => context.onUnarchiveAccount(account)}
              className="bg-green-500 hover:bg-green-600 text-white"
              title="Restore"
              disabled={isAnyRowEditing}
            >
              <ArchiveRestore className="h-4 w-4" />
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
            onClick={() => context.onArchiveAccount(account)}
            className="bg-slate-600 hover:bg-slate-700 text-white"
            title="Archive"
            disabled={isAnyRowEditing}
          >
            <Archive className="h-4 w-4" />
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
    enableResizing: false,
    size: 100,
  },
]
