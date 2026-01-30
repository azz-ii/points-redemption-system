import { useTheme } from "next-themes";
import { Eye, Edit, Trash2 } from "lucide-react";
import type { Product } from "../modals/types";
import { getLegendColor } from "../modals/types";

interface CatalogueTableProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRetry: () => void;
  searchQuery: string;
}

export function CatalogueTable({
  products,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
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
              Item Code
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Item Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Legend
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Category
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Points
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Price
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Stock
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Status
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
              <td colSpan={9} className="px-6 py-32 text-center">
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
              <td colSpan={9} className="px-6 py-32 text-center">
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
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-32 text-center">
                <p className="text-gray-500">
                  {searchQuery
                    ? "No items match your search"
                    : "No catalogue items found"}
                </p>
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr
                key={product.id}
                className={`hover:${
                  resolvedTheme === "dark"
                    ? "bg-gray-800"
                    : "bg-gray-50"
                } transition-colors`}
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-mono font-medium">
                    {product.item_code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium">
                    {product.item_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                      product.legend
                    )}`}
                  >
                    {product.legend}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {product.category || "-"}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {product.points}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  ₱{product.price}
                </td>
                <td className="px-6 py-4 text-sm">
                  {product.available_stock} / {product.stock}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.is_archived
                        ? "bg-red-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {product.is_archived
                      ? "Archived"
                      : "Active"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onView(product)}
                      className="px-4 py-2 rounded flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onEdit(product)}
                      className="px-4 py-2 rounded flex items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onDelete(product)}
                      className="px-4 py-2 rounded flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
