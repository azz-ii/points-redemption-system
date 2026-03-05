"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, ArrowUpDown, CheckCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { RedemptionItem } from "../modals/types";

interface ColumnContext {
  onViewRedemption: (redemption: RedemptionItem) => void;
  onMarkAsProcessed: (redemption: RedemptionItem) => void;
  canMarkProcessed: (redemption: RedemptionItem) => boolean;
}

export const createColumns = (
  context: ColumnContext
): ColumnDef<RedemptionItem>[] => [
  {
    accessorKey: "requested_by_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Requested By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("requested_by_name") || "N/A"}</div>,
  },
  {
    accessorKey: "requested_for_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Requested For
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("requested_for_name") || "N/A"}</div>,
  },
  {
    accessorKey: "total_points",
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
      );
    },
    cell: ({ row }) => {
      const points = row.getValue("total_points") as number;
      return <div>{points?.toLocaleString() ?? 0} pts</div>;
    },
  },
  {
    accessorKey: "status",
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
      const status = row.getValue("status") as string;
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === "APPROVED"
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              : status === "REJECTED"
              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
          }`}
        >
          {row.original.status_display || status}
        </span>
      );
    },
  },
  {
    accessorKey: "processing_status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Processing
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const processingStatus = row.getValue("processing_status") as string;
      const statusUpper = processingStatus?.toUpperCase() || "";

      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            statusUpper === "PROCESSED"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : statusUpper === "CANCELLED"
              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
          }`}
        >
          {row.original.processing_status_display || processingStatus?.replace(/_/g, ' ') || "Not Processed"}
        </span>
      );
    },
  },
  {
    accessorKey: "date_requested",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date_requested") as string;
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const redemption = row.original;
      const showProcessButton = context.canMarkProcessed?.(redemption) ?? false;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => context.onViewRedemption(redemption)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {showProcessButton && (
                <DropdownMenuItem onClick={() => context.onMarkAsProcessed(redemption)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Processed
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 50,
  },
];
