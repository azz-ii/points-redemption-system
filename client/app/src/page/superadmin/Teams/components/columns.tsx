"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export interface Team {
  id: number;
  name: string;
  approver: number | null;
  approver_details?: {
    id: number;
    username: string;
    full_name: string;
    email: string;
    position: string;
  };
  region: string;
  member_count?: number;
  distributor_count?: number;
  created_at: string;
  updated_at: string;
}

interface ColumnContext {
  onView: (team: Team) => void
  onEdit: (team: Team) => void
  onDelete: (team: Team) => void
}

export const createColumns = (context: ColumnContext): ColumnDef<Team>[] => [
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
          Team Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-semibold">{row.getValue("name") || "N/A"}</div>,
  },
  {
    accessorKey: "approver_details",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Approver
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const approverDetails = row.getValue("approver_details") as Team["approver_details"]
      return approverDetails ? (
        <div>
          <div className="font-medium">{approverDetails.full_name}</div>
          <div className="text-xs text-muted-foreground">{approverDetails.email}</div>
        </div>
      ) : (
        <span className="text-muted-foreground">No Approver</span>
      )
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.approver_details?.full_name || ""
      const b = rowB.original.approver_details?.full_name || ""
      return a.localeCompare(b)
    },
  },
  {
    accessorKey: "region",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Region
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("region") || "N/A"}</div>,
  },
  {
    accessorKey: "member_count",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Members
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const count = row.getValue("member_count") as number
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
          {count || 0} {count === 1 ? "member" : "members"}
        </span>
      )
    },
  },
  {
    accessorKey: "distributor_count",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Distributors
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const count = row.getValue("distributor_count") as number
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
          {count ?? 0}
        </span>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string
      return <div>{new Date(date).toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const team = row.original

      return (
        <div className="flex justify-end gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onView(team)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onEdit(team)}
            className="bg-gray-500 hover:bg-gray-600 text-white"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onDelete(team)}
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
