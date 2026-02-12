"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InventoryItem, StockStatus } from "../modals/types";
import { getStatusColor, getLegendColor } from "../modals/types";

interface ColumnContext {
  onViewItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
}

export const createColumns = (
  context: ColumnContext
): ColumnDef<InventoryItem>[] => [
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
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("item_name") || "N/A"}</div>
    ),
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
      );
    },
    cell: ({ row }) => (
      <div className="font-mono text-sm text-muted-foreground">
        {row.getValue("item_code") || "N/A"}
      </div>
    ),
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
      );
    },
    cell: ({ row }) => {
      const category = row.getValue("category") as string | null;
      return <div>{category || "-"}</div>;
    },
  },
  {
    accessorKey: "legend",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Legend
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const legend = row.getValue("legend") as string;
      return (
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getLegendColor(legend)}`}
        >
          {legend.replace(/_/g, " ")}
        </span>
      );
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Total Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return (
        <div className="text-center">
          <span
            className={`font-bold ${stock === 0 ? "text-red-500" : ""}`}
          >
            {stock}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "committed_stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Committed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const committed = row.getValue("committed_stock") as number;
      return (
        <div className="text-center">
          <span className="font-bold text-orange-500">{committed}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "available_stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Available
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const available = row.getValue("available_stock") as number;
      return (
        <div className="text-center">
          <span
            className={`font-bold ${available === 0 ? "text-red-500" : "text-green-500"}`}
          >
            {available}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "stock_status",
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
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("stock_status") as StockStatus;
      return (
        <div className="text-center">
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(status)}`}
          >
            {status}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex justify-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onViewItem(item)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => context.onEditItem(item)}
            title="Edit Stock"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
