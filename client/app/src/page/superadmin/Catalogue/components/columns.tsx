"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Trash2, ArrowUpDown, Package, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { Product } from "../modals/types"
import { getLegendColor } from "../modals/types"

interface ColumnContext {
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onArchive: (product: Product) => void
  onUnarchive: (product: Product) => void
}

export const createColumns = (context: ColumnContext): ColumnDef<Product>[] => [
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
    accessorKey: "item_code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Item Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("item_code") || "N/A"}</div>,
  },
  {
    id: "image",
    header: "Image",
    cell: ({ row }) => {
      const product = row.original
      return product.image ? (
        <img
          src={product.image}
          alt={product.item_name}
          className="w-10 h-10 rounded object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Package className="w-5 h-5 text-muted-foreground" />
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "item_name",
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
    cell: ({ row }) => <div className="font-medium">{row.getValue("item_name") || "N/A"}</div>,
  },
  {
    accessorKey: "legend",
    header: "Legend",
    cell: ({ row }) => {
      const legend = row.getValue("legend") as string
      return (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(legend)}`}
        >
          {legend.replace(/_/g, " ")}
        </span>
      )
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("category") || "-"}</div>,
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
      const points = row.getValue("points") as string
      return <div className="font-medium">{points}</div>
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = row.getValue("price") as string
      return <div className="font-medium">₱{price}</div>
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div>
          {product.available_stock} / {product.stock}
        </div>
      )
    },
  },
  {
    accessorKey: "is_archived",
    header: "Status",
    cell: ({ row }) => {
      const isArchived = row.getValue("is_archived") as boolean
      return (
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
            isArchived
              ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
          }`}
        >
          {isArchived ? "Archived" : "Active"}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => context.onView(product)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => context.onEdit(product)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => context.onArchive(product)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Archive
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
