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

interface CatalogueMobileCardsProps {
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

export function CatalogueMobileCards({
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
}: CatalogueMobileCardsProps) {
  const { resolvedTheme } = useTheme();

  if (loading) {
    return (
      <div className="text-center py-32">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-32">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (groupedItems.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 text-sm">
          {searchQuery
            ? "No items match your search"
            : "No catalogue items found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groupedItems.map((group) => {
        const isExpanded = expandedRows.has(group.catalogueItem.id);
        const firstVariant = group.variants[0];

        return (
          <div
            key={`mobile-${group.catalogueItem.id}`}
            className={`p-4 rounded-lg border ${
              resolvedTheme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } transition-colors`}
          >
            {/* Main Item Info */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 flex items-start gap-2">
                <button
                  onClick={() => onToggleRow(group.catalogueItem.id)}
                  className="mt-0.5 hover:opacity-70 transition-opacity"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <div>
                  <p className="font-semibold text-sm">
                    {group.catalogueItem.item_name}
                  </p>
                  <p
                    className={`text-xs ${
                      resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {group.variants.length} variant
                    {group.variants.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                  group.catalogueItem.legend
                )}`}
              >
                {group.catalogueItem.legend}
              </span>
            </div>
            {/* New Info Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <span className="text-gray-500">Reward:</span>
                <p className="font-medium">
                  {group.catalogueItem.reward || "-"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Date Added:</span>
                <p className="font-medium">
                  {new Date(
                    group.catalogueItem.date_added
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span
                  className={`px-1 py-0.5 rounded-full text-xs font-semibold ${
                    group.catalogueItem.is_archived
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {group.catalogueItem.is_archived
                    ? "Archived"
                    : "Active"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Description:</span>
                <p className="font-medium">
                  {group.catalogueItem.description.length > 30
                    ? group.catalogueItem.description.substring(
                        0,
                        30
                      ) + "..."
                    : group.catalogueItem.description}
                </p>
              </div>
            </div>
            {isExpanded && (
              <div className="mb-3 space-y-2 pl-6 max-h-[400px] overflow-y-auto">
                {group.variants.map((variant) => (
                  <div
                    key={`mobile-variant-${variant.id}`}
                    className={`p-3 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-700/50 border-gray-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Code:</span>
                        <p className="font-mono font-medium">
                          {variant.item_code}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          Variant:
                        </span>
                        <p className="font-medium">
                          {variant.option_description || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          Points:
                        </span>
                        <p className="font-medium">
                          {variant.points}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          Price:
                        </span>
                        <p className="font-medium">
                          {variant.price}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          onViewVariant(variant)
                        }
                        className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors font-semibold text-sm"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          onEditVariant(variant)
                        }
                        className={`flex-1 px-3 py-2 rounded flex items-center justify-center text-sm ${
                          resolvedTheme === "dark"
                            ? "bg-gray-600 hover:bg-gray-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                        } transition-colors font-semibold`}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          onDeleteVariant(variant)
                        }
                        className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors font-semibold text-sm"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onViewItem(firstVariant)}
                className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors font-semibold text-sm"
                title="View"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEditItem(firstVariant)}
                className={`flex-1 px-3 py-2 rounded flex items-center justify-center ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } transition-colors font-semibold text-sm`}
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDeleteItem(firstVariant)}
                className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors font-semibold text-sm"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
