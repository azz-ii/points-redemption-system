"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RequestItem } from "../../ProcessRequests/modals/types";

interface ColumnContext {
  onView: (request: RequestItem) => void;
}

export const createColumns = (
  context: ColumnContext
): ColumnDef<RequestItem>[] => [
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
      <div className="font-medium">#{row.getValue("id") ?? "N/A"}</div>
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
    cell: ({ row }) => (
      <div>{row.getValue("requested_for_name") || "N/A"}</div>
    ),
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
      const statusClasses = {
        PENDING: "bg-yellow-400 text-black",
        APPROVED: "bg-green-500 text-white",
        REJECTED: "bg-red-500 text-white",
      };
      const className = statusClasses[status as keyof typeof statusClasses] || "bg-gray-500 text-white";
      
      return (
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${className}`}>
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
      const statusClasses = {
        NOT_PROCESSED: "bg-orange-400 text-black",
        PROCESSED: "bg-blue-500 text-white",
        CANCELLED: "bg-red-500 text-white",
      };
      const className = statusClasses[processingStatus as keyof typeof statusClasses] || "bg-gray-500 text-white";
      
      return (
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${className}`}>
          {row.original.processing_status_display || processingStatus}
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
    accessorKey: "date_processed",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Date Processed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date_processed") as string | null;
      return <div>{date ? new Date(date).toLocaleDateString() : "-"}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const request = row.original;

      return (
        <div className="flex justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={() => context.onView(request)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            title="View Details"
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
