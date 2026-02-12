"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, ArrowUpDown, Clock, Archive, ArchiveRestore } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { Customer } from "../modals/types"

interface ColumnContext {
  onView: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onArchive: (customer: Customer) => void
  onUnarchive: (customer: Customer) => void
  onViewPointsHistory?: (customer: Customer) => void
}

export const createColumns = (context: ColumnContext): ColumnDef<Customer>[] => [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name") || "N/A"}</div>,
  },
  {
    accessorKey: "contact_email",
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
    cell: ({ row }) => <div>{row.getValue("contact_email") || "N/A"}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phone") || "N/A"}</div>,
  },
  {
    accessorKey: "location",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Location
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("location") || "N/A"}</div>,
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
      return (
        <div className="font-medium">
          {points?.toLocaleString() ?? 0}
        </div>
      )
    },
  },
  {
    accessorKey: "is_archived",
    header: "Status",
    cell: ({ row }) => {
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
          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white">
            Active
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const customer = row.original
      const isArchived = customer.is_archived

      if (isArchived) {
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => context.onView(customer)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => context.onUnarchive(customer)}
              className="bg-green-500 hover:bg-green-600 text-white"
              title="Restore"
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
            onClick={() => context.onView(customer)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onEdit(customer)}
            className="bg-gray-500 hover:bg-gray-600 text-white"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onArchive(customer)}
            className="bg-slate-600 hover:bg-slate-700 text-white"
            title="Archive"
          >
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onViewPointsHistory?.(customer)}
            className="bg-purple-500 hover:bg-purple-600 text-white"
            title="Points History"
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
