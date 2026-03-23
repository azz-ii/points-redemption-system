import { Eye, Edit, Archive, ArchiveRestore, Package } from "lucide-react";
import { MobileCardsSkeleton } from "@/components/shared/mobile-cards-skeleton";
import type { Product } from "../modals/types";
import { getLegendColor } from "../modals/types";

interface CatalogueMobileCardsProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
  onUnarchive: (product: Product) => void;
  onRetry: () => void;
  searchQuery: string;
}

export function CatalogueMobileCards({
  products,
  loading,
  error,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
  onRetry,
  searchQuery,
}: CatalogueMobileCardsProps) {
  if (loading) {
    return <MobileCardsSkeleton count={6} showHeader={false} />;
  }

  if (error) {
    return (
      <div className="text-center py-32">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm"
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
        <p className="text-muted-foreground text-sm">
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
                  <Package className="w-6 h-6 text-muted-foreground" />
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
              <span className="text-muted-foreground">Category:</span>
              <p className="font-medium">
                {product.category || "-"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Points:</span>
              <p className="font-medium">{product.points}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Price:</span>
              <p className="font-medium">₱{product.price}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Stock:</span>
              <p className="font-medium">
                {product.available_stock} / {product.stock}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Status:</span>
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  product.is_archived
                    ? "bg-destructive/15 text-[color-mix(in_srgb,var(--color-destructive)_70%,black)] dark:text-destructive"
                    : "bg-success/15 text-[color-mix(in_srgb,var(--color-success)_70%,black)] dark:text-success"
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
              className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-semibold text-sm"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
            {product.is_archived ? (
              <button
                onClick={() => onUnarchive(product)}
                className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-green-600 hover:bg-green-700 text-white transition-colors font-semibold text-sm"
                title="Restore"
              >
                <ArchiveRestore className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-muted hover:bg-accent text-foreground transition-colors font-semibold text-sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onArchive(product)}
                  className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-slate-600 hover:bg-slate-700 text-white transition-colors font-semibold text-sm"
                  title="Archive"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
