"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Archive, ArchiveRestore, ArrowUpDown, Clock, Mail, LockOpen, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { Account } from "../modals"

interface ColumnContext {
  onViewAccount: (account: Account) => void
  onEditAccount: (account: Account) => void
  onArchiveAccount: (account: Account) => void
  onUnarchiveAccount: (account: Account) => void
  onViewPointsHistory?: (account: Account) => void
  onSendPasswordResetEmail?: (account: Account) => void
  onUnlockAccount?: (account: Account) => void
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
    cell: ({ row }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
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
    cell: ({ row }) => {
      return <div className="py-2">{row.getValue("full_name") || "N/A"}</div>
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
    cell: ({ row }) => {
      const value = row.getValue("position") as string
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
          {value || "N/A"}
        </span>
      )
    },
  },
  {
    id: "team_name",
    accessorFn: (row) => {
      if (row.position === "Sales Agent") return row.team_name ?? null;
      if (row.position === "Approver")
        return row.approver_teams?.map((t) => t.name).join(", ") ?? null;
      return null;
    },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 hover:bg-transparent"
      >
        Team
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const { position, team_name, approver_teams } = row.original;
      if (position === "Sales Agent") {
        return (
          <span>{team_name ?? <span className="text-muted-foreground">—</span>}</span>
        );
      }
      if (position === "Approver") {
        if (!approver_teams || approver_teams.length === 0) {
          return <span className="text-muted-foreground">—</span>;
        }
        const names = approver_teams.map((t) => t.name);
        return (
          <span title={names.join(", ")}>
            {names.length <= 2 ? names.join(", ") : `${names.length} teams`}
          </span>
        );
      }
      return <span className="text-muted-foreground">—</span>;
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
      if (!row.original.uses_points) {
        return <span className="text-muted-foreground">—</span>
      }
      const value = row.getValue("points") as number
      return <div className="py-2">{value?.toLocaleString() ?? 0}</div>
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
            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
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
    cell: ({ row }) => {
      const account = row.original
      const isArchived = account.is_archived

      if (isArchived) {
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
                <DropdownMenuItem onClick={() => context.onUnarchiveAccount(account)}>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Restore
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }

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
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => context.onArchiveAccount(account)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => context.onViewPointsHistory?.(account)}>
                <Clock className="mr-2 h-4 w-4" />
                Points History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => context.onSendPasswordResetEmail?.(account)}>
                <Mail className="mr-2 h-4 w-4" />
                Send Password Reset
              </DropdownMenuItem>
              {account.is_locked && (
                <DropdownMenuItem onClick={() => context.onUnlockAccount?.(account)}>
                  <LockOpen className="mr-2 h-4 w-4" />
                  Unlock Account
                </DropdownMenuItem>
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
