import { Eye, Edit, Trash2, Package } from "lucide-react";
import type { Product } from "../modals/types";
import { getLegendColor } from "../modals/types";

interface CatalogueMobileCardsProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRetry: () => void;
  searchQuery: string;
}

export function CatalogueMobileCards({
  products,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  onRetry,
  searchQuery,
}: CatalogueMobileCardsProps) {
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

  if (products.length === 0) {
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
      {products.map((product) => (
        <div
          key={product.id}
          className="p-4 rounded-lg border bg-card border-border transition-colors"
        >
          {/* Product Info Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3 flex-1">
              {/* Product Thumbnail */}
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.item_name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-muted">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {product.item_name}
                </p>
                <p
                  className="text-xs font-mono text-muted-foreground"
                >
                  {product.item_code}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                product.legend
              )}`}
            >
              {product.legend}
            </span>
          </div>
          
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div>
              <span className="text-gray-500">Category:</span>
              <p className="font-medium">
                {product.category || "-"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Points:</span>
              <p className="font-medium">{product.points}</p>
            </div>
            <div>
              <span className="text-gray-500">Price:</span>
              <p className="font-medium">₱{product.price}</p>
            </div>
            <div>
              <span className="text-gray-500">Stock:</span>
              <p className="font-medium">
                {product.available_stock} / {product.stock}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Status:</span>
              <span
                className={`ml-2 px-1 py-0.5 rounded-full text-xs font-semibold ${
                  product.is_archived
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {product.is_archived ? "Archived" : "Active"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onView(product)}
              className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors font-semibold text-sm"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(product)}
              className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-muted hover:bg-accent text-foreground transition-colors font-semibold text-sm"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(product)}
              className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors font-semibold text-sm"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
