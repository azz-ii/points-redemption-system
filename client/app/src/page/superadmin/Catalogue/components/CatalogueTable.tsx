import { useTheme } from "next-themes";
import { Eye, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { CatalogueVariant } from "../modals/types";
import { getLegendColor } from "../modals/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface GroupedItem {
  catalogueItem: {
    id: number;
    item_name: string;
    description: string;
    purpose: string;
    specifications: string;
    legend: string;
    reward: string | null;
    is_archived: boolean;
    date_added: string;
    mktg_admin: number | null;
    mktg_admin_name: string | null;
    approver: number | null;
    approver_name: string | null;
  };
  variants: CatalogueVariant[];
}

interface CatalogueTableProps {
  groupedItems: GroupedItem[];
  loading: boolean;
  error: string | null;
  expandedRows: Set<number>;
  onToggleRow: (catalogueItemId: number) => void;
  onViewItem: (item: CatalogueVariant) => void;
  onEditItem: (item: CatalogueVariant) => void;
  onDeleteItem: (item: CatalogueVariant) => void;
  onViewVariant: (variant: CatalogueVariant) => void;
  onEditVariant: (variant: CatalogueVariant) => void;
  onDeleteVariant: (variant: CatalogueVariant) => void;
  onRetry: () => void;
  searchQuery: string;
}

export function CatalogueTable({
  groupedItems,
  loading,
  error,
  expandedRows,
  onToggleRow,
  onViewItem,
  onEditItem,
  onDeleteItem,
  onViewVariant,
  onEditVariant,
  onDeleteVariant,
  onRetry,
  searchQuery,
}: CatalogueTableProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-col flex-1 overflow-auto max-h-[calc(100vh-295px)]">
      <Table className="w-full border-collapse">
        <TableHeader
          className={`${resolvedTheme === "dark" ? "bg-gray-900" : "bg-gray-50"} sticky top-0 z-10`}
        >
          <TableRow className={`${resolvedTheme === "dark" ? "border-b border-gray-700" : "border-b border-gray-200"}`}>
            <TableHead className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-700"} px-6 py-4 text-left text-sm font-semibold`}>Item Name</TableHead>
            <TableHead className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-700"} px-6 py-4 text-left text-sm font-semibold`}>Category</TableHead>
            <TableHead className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-700"} px-6 py-4 text-left text-sm font-semibold`}>Reward</TableHead>
            <TableHead className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-700"} px-6 py-4 text-left text-sm font-semibold`}>Description</TableHead>
            <TableHead className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-700"} px-6 py-4 text-left text-sm font-semibold`}>Date Added</TableHead>
            <TableHead className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-700"} px-6 py-4 text-left text-sm font-semibold`}>Status</TableHead>
            <TableHead className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-700"} px-6 py-4 text-left text-sm font-semibold`}>Variants</TableHead>
            <TableHead className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-700"} px-6 py-4 text-right text-sm font-semibold`}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={`${resolvedTheme === "dark" ? "bg-gray-950" : "bg-white"}`}>
          {loading ? (
            <TableRow className={`${resolvedTheme === "dark" ? "border-b border-gray-800" : "border-b border-gray-200"}`}>
              <TableCell colSpan={8} className="px-6 py-32 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className={`${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Loading catalogue items...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow className={`${resolvedTheme === "dark" ? "border-b border-gray-800" : "border-b border-gray-200"}`}>
              <TableCell colSpan={8} className="px-6 py-32 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-red-500">{error}</p>
                  <Button onClick={onRetry} className="mt-4">Retry</Button>
                </div>
              </TableCell>
            </TableRow>
          ) : groupedItems.length === 0 ? (
            <TableRow className={`${resolvedTheme === "dark" ? "border-b border-gray-800" : "border-b border-gray-200"}`}>
              <TableCell colSpan={8} className="px-6 py-32 text-center">
                <p className={`${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {searchQuery ? "No items match your search" : "No catalogue items found"}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            groupedItems.map((group) => {
              const isExpanded = expandedRows.has(group.catalogueItem.id);
              const firstVariant = group.variants[0];

              return (
                <>
                  <TableRow
                    key={`main-${group.catalogueItem.id}`}
                    className={`${resolvedTheme === "dark" ? "border-b border-gray-800 hover:bg-gray-900/50" : "border-b border-gray-200 hover:bg-gray-50"} transition-colors`}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onToggleRow(group.catalogueItem.id)}
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <span className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-900"} text-sm font-medium`}>
                          {group.catalogueItem.item_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(group.catalogueItem.legend)}`}>
                        {group.catalogueItem.legend}
                      </span>
                    </TableCell>
                    <TableCell className={`${resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"} px-6 py-4 text-sm`}>
                      {group.catalogueItem.reward || "-"}
                    </TableCell>
                    <TableCell className={`${resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"} px-6 py-4 text-sm`}>
                      {group.catalogueItem.description.length > 50
                        ? group.catalogueItem.description.substring(0, 50) + "..."
                        : group.catalogueItem.description}
                    </TableCell>
                    <TableCell className={`${resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"} px-6 py-4 text-sm`}>
                      {new Date(group.catalogueItem.date_added).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${group.catalogueItem.is_archived ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
                        {group.catalogueItem.is_archived ? "Archived" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className={`${resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"} px-6 py-4 text-sm`}>
                      {group.variants.length} variant{group.variants.length !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => onViewItem(firstVariant)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-9 w-9 bg-gray-600 hover:bg-gray-700 text-white"
                          onClick={() => onEditItem(firstVariant)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-9 w-9 bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => onDeleteItem(firstVariant)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {isExpanded &&
                    group.variants.map((variant) => (
                      <TableRow
                        key={`variant-${variant.id}`}
                        className={`${resolvedTheme === "dark" ? "border-b border-gray-800 bg-gray-900" : "border-b border-gray-200 bg-gray-50"}`}
                      >
                        <TableCell className="px-6 py-3" colSpan={8}>
                          <div className="pl-8 grid grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className={`${resolvedTheme === "dark" ? "text-gray-500" : "text-gray-600"} text-xs`}>Item Code:</span>
                              <p className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-900"} font-mono font-medium`}>{variant.item_code}</p>
                            </div>
                            <div>
                              <span className={`${resolvedTheme === "dark" ? "text-gray-500" : "text-gray-600"} text-xs`}>Variant:</span>
                              <p className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-900"} font-medium`}>{variant.option_description || "-"}</p>
                            </div>
                            <div>
                              <span className={`${resolvedTheme === "dark" ? "text-gray-500" : "text-gray-600"} text-xs`}>Points:</span>
                              <p className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-900"} font-medium`}>{variant.points}</p>
                            </div>
                            <div>
                              <span className={`${resolvedTheme === "dark" ? "text-gray-500" : "text-gray-600"} text-xs`}>Price:</span>
                              <p className={`${resolvedTheme === "dark" ? "text-white" : "text-gray-900"} font-medium`}>{variant.price}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => onViewVariant(variant)}
                                title="View Variant"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                className={`${resolvedTheme === "dark" ? "h-9 w-9 bg-gray-600 hover:bg-gray-700 text-white" : "h-9 w-9 bg-gray-200 hover:bg-gray-300 text-gray-900"}`}
                                onClick={() => onEditVariant(variant)}
                                title="Edit Variant"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                className="h-9 w-9 bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => onDeleteVariant(variant)}
                                title="Delete Variant"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
