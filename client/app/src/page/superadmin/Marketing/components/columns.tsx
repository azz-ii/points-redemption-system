"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { MarketingUser } from "./types"

interface ColumnContext {
  onViewAccount: (account: MarketingUser) => void
  onEditAccount: (account: MarketingUser) => void
}

const getLegendColor = (legend: string) => {
  switch (legend) {
    case "Collateral":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
    case "Giveaway":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
    case "Asset":
      return "bg-yellow-500 text-black"
    case "Benefit":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
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
    enableResizing: false,
    size: 40,
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
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
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
          <span className="text-muted-foreground text-sm italic">No items assigned</span>
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
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => context.onViewAccount(account)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => context.onEditAccount(account)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Assignments
              </DropdownMenuItem>
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
