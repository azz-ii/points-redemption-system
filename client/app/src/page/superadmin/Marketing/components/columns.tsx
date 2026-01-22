"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { MarketingUser } from "./types"

interface ColumnContext {
  onViewAccount: (account: MarketingUser) => void
  onEditAccount: (account: MarketingUser) => void
}

const getLegendColor = (legend: string) => {
  switch (legend) {
    case "COLLATERAL":
      return "bg-red-500 text-white"
    case "GIVEAWAY":
      return "bg-blue-500 text-white"
    case "ASSET":
      return "bg-yellow-500 text-black"
    case "BENEFIT":
      return "bg-green-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

export const createColumns = (context: ColumnContext): ColumnDef<MarketingUser>[] => [
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
    accessorKey: "assigned_legends",
    header: "Assigned Items",
    cell: ({ row }) => {
      const legends = row.original.assigned_legends || []
      
      if (legends.length === 0) {
        return (
          <span className="text-gray-400 text-sm italic">No items assigned</span>
        )
      }
      
      return (
        <div className="flex flex-wrap gap-1.5">
          {legends.map((assignment) => (
            <span
              key={assignment.legend}
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLegendColor(assignment.legend)}`}
              title={`${assignment.item_count} item${assignment.item_count !== 1 ? 's' : ''}`}
            >
              {assignment.legend} ({assignment.item_count})
            </span>
          ))}
        </div>
      )
    },
    enableSorting: false,
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
            onClick={() => context.onEditAccount(account)}
            className="bg-gray-500 hover:bg-gray-600 text-white"
            title="Edit Assignments"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
