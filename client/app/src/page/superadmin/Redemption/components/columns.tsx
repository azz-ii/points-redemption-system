"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, ArrowUpDown, PackageCheck, PackageX } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { RedemptionItem } from "../modals/types";

interface ColumnContext {
  onViewRedemption: (redemption: RedemptionItem) => void;
  onEditRedemption: (redemption: RedemptionItem) => void;
  onMarkAsProcessed: (redemption: RedemptionItem) => void;
  onCancelRequest: (redemption: RedemptionItem) => void;
}

export const createColumns = (
  context: ColumnContext
): ColumnDef<RedemptionItem>[] => [
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("id") ?? "N/A"}</div>
    ),
  },
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
          Total Points
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const points = row.getValue("total_points") as number;
      return <div>{points?.toLocaleString() ?? 0}</div>;
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
          Date Requested
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
    accessorKey: "reviewed_by_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Reviewed By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("reviewed_by_name") || "N/A"}</div>,
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
          Processing Status
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
              ? "bg-green-600 text-white"
              : statusUpper === "CANCELLED"
              ? "bg-red-600 text-white"
              : "bg-yellow-500 text-gray-900"
          }`}
        >
          {processingStatus?.replace(/_/g, ' ') || "Not Processed"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const redemption = row.original;
      const processingStatus = row.getValue("processing_status") as string;
      const processingStatusUpper = processingStatus?.toUpperCase() || "";
      const isNotProcessed = processingStatusUpper === "NOT_PROCESSED";
      const isCancelled = processingStatusUpper === "CANCELLED";

      return (
        <div className="flex justify-end gap-2">
          {isNotProcessed && !isCancelled && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => context.onMarkAsProcessed(redemption)}
                className="bg-green-600 hover:bg-green-700 text-white"
                title="Mark as Processed"
              >
                <PackageCheck className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => context.onCancelRequest(redemption)}
                className="bg-red-600 hover:bg-red-700 text-white"
                title="Cancel Request"
              >
                <PackageX className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onViewRedemption(redemption)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
