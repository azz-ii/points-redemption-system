import { useTheme } from "next-themes";
import { Eye, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { CatalogueVariant } from "../modals/types";
import { getLegendColor } from "../modals/types";

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
    <div className="overflow-auto max-h-[calc(100vh-295px)]">
      <table className="w-full">
        <thead
          className={`${
            resolvedTheme === "dark"
              ? "bg-gray-800 text-gray-300"
              : "bg-gray-50 text-gray-700"
          }`}
        >
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Item Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Category
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Reward
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Description
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Date Added
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Variants
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody
          className={`divide-y ${
            resolvedTheme === "dark"
              ? "divide-gray-700"
              : "divide-gray-200"
          }`}
        >
          {loading ? (
            <tr>
              <td colSpan={8} className="px-6 py-32 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-gray-500">
                    Loading catalogue items...
                  </p>
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={8} className="px-6 py-32 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Retry
                  </button>
                </div>
              </td>
            </tr>
          ) : groupedItems.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-32 text-center">
                <p className="text-gray-500">
                  {searchQuery
                    ? "No items match your search"
                    : "No catalogue items found"}
                </p>
              </td>
            </tr>
          ) : (
            groupedItems.map((group) => {
              const isExpanded = expandedRows.has(
                group.catalogueItem.id
              );
              const firstVariant = group.variants[0];

              return (
                <>
                  {/* Main Row */}
                  <tr
                    key={`main-${group.catalogueItem.id}`}
                    className={`hover:${
                      resolvedTheme === "dark"
                        ? "bg-gray-800"
                        : "bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onToggleRow(group.catalogueItem.id)
                          }
                          className="hover:opacity-70 transition-opacity"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <span className="text-sm font-medium">
                          {group.catalogueItem.item_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                          group.catalogueItem.legend
                        )}`}
                      >
                        {group.catalogueItem.legend}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {group.catalogueItem.reward || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {group.catalogueItem.description.length > 50
                        ? group.catalogueItem.description.substring(
                            0,
                            50
                          ) + "..."
                        : group.catalogueItem.description}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(
                        group.catalogueItem.date_added
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          group.catalogueItem.is_archived
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {group.catalogueItem.is_archived
                          ? "Archived"
                          : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {group.variants.length} variant
                      {group.variants.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onViewItem(firstVariant)}
                          className="px-4 py-2 rounded flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => onEditItem(firstVariant)}
                          className="px-4 py-2 rounded flex items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            onDeleteItem(firstVariant)
                          }
                          className="px-4 py-2 rounded flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Variant Rows */}
                  {isExpanded &&
                    group.variants.map((variant) => (
                      <tr
                        key={`variant-${variant.id}`}
                        className={`${
                          resolvedTheme === "dark"
                            ? "bg-gray-800/50"
                            : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-6 py-3" colSpan={8}>
                          <div className="pl-8 grid grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 text-xs">
                                Item Code:
                              </span>
                              <p className="font-mono font-medium">
                                {variant.item_code}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">
                                Variant:
                              </span>
                              <p className="font-medium">
                                {variant.option_description || "-"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">
                                Points:
                              </span>
                              <p className="font-medium">
                                {variant.points}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">
                                Price:
                              </span>
                              <p className="font-medium">
                                {variant.price}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  onViewVariant(variant)
                                }
                                className="px-4 py-2 rounded flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                                title="View Variant"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  onEditVariant(variant)
                                }
                                className={`px-4 py-2 rounded flex items-center ${
                                  resolvedTheme === "dark"
                                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                                } font-semibold transition-colors`}
                                title="Edit Variant"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  onDeleteVariant(variant)
                                }
                                className="px-4 py-2 rounded flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                                title="Delete Variant"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
