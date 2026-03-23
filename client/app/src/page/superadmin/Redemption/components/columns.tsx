"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, ArrowUpDown, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { RedemptionItem } from "../modals/types";

interface ColumnContext {
  onViewRedemption: (redemption: RedemptionItem) => void;
  onMarkAsProcessed: (redemption: RedemptionItem) => void;
  canMarkProcessed: (redemption: RedemptionItem) => boolean;
  onCancelRequest: (redemption: RedemptionItem) => void;
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
              ? "bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300"
              : status === "REJECTED"
              ? "bg-rose-100 border border-rose-200 text-rose-800 dark:bg-rose-900/40 dark:border-rose-800/50 dark:text-rose-300"
              : "bg-yellow-100 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:border-yellow-800/50 dark:text-yellow-300"
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
              ? "bg-info/15 text-[color-mix(in_srgb,var(--color-info)_70%,black)] dark:bg-info/20 dark:text-info"
              : statusUpper === "PARTIALLY_PROCESSED"
              ? "bg-warning/20 text-[color-mix(in_srgb,var(--color-warning)_70%,black)] dark:bg-warning/20 dark:text-warning"
              : statusUpper === "CANCELLED"
              ? "bg-destructive/15 text-[color-mix(in_srgb,var(--color-destructive)_70%,black)] dark:bg-destructive/20 dark:text-destructive-foreground"
              : "bg-muted text-[color-mix(in_srgb,var(--color-muted-foreground)_70%,black)] dark:bg-muted dark:text-muted-foreground"
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
      const canCancel =
        redemption.status === "APPROVED" &&
        redemption.processing_status !== "CANCELLED" &&
        redemption.processing_status !== "PROCESSED";

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
              {canCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => context.onCancelRequest(redemption)} className="text-destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Request
                  </DropdownMenuItem>
                </>
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
