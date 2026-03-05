import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Package, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";
import type { Account, ModalBaseProps, ProductAssignment } from "./types";
import { LEGEND_OPTIONS } from "./types";
import { FormSkeleton } from "@/components/shared/form-skeleton";

interface ViewAccountModalProps extends ModalBaseProps {
  account: Account | null;
}

export function ViewAccountModal({
  isOpen,
  onClose,
  account,
}: ViewAccountModalProps) {
  const [products, setProducts] = useState<ProductAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!account) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/catalogue/bulk-assign-marketing/`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        // Filter products assigned to this user
        const userProducts = (data.products || []).filter(
          (p: ProductAssignment) => p.mktg_admin_id === account.id
        );
        setProducts(userProducts);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (isOpen && account) {
      fetchAssignments();
    }
  }, [isOpen, account, fetchAssignments]);

  const productsByLegend = useMemo(() => {
    const grouped: Record<string, ProductAssignment[]> = {};
    for (const legend of LEGEND_OPTIONS) {
      const items = products.filter((p) => p.legend === legend.value);
      if (items.length > 0) {
        grouped[legend.value] = items;
      }
    }
    return grouped;
  }, [products]);

  if (!isOpen || !account) return null;

  const getLegendLabel = (legend: string) => {
    return LEGEND_OPTIONS.find((l) => l.value === legend)?.label || legend;
  };

  const getLegendColor = (legend: string) => {
    switch (legend) {
      case "Collateral":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Giveaway":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Asset":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Benefit":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const legendEntries = Object.entries(productsByLegend);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-account-title"
        className="bg-card rounded-lg shadow-2xl max-w-2xl w-full border divide-y border-border divide-gray-700"
      >
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-account-title" className="text-xl font-semibold">
              Marketing User Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{account.full_name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* User Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              User Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Username
                </label>
                <p className="font-medium">{account.username || "N/A"}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Email
                </label>
                <p className="font-medium">{account.email}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Position
                </label>
                <p className="font-medium">{account.position}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Status
                </label>
                <p className="font-medium">
                  {account.is_activated ? "Active" : "Inactive"}
                  {account.is_banned && " • Banned"}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Products Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Package className="h-4 w-4" />
              Assigned Items ({products.length})
            </h3>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : legendEntries.length > 0 ? (
              <div className="space-y-4">
                {legendEntries.map(([legend, items]) => (
                  <div key={legend} className="rounded-lg border border-border overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-card">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLegendColor(legend)}`}>
                          {getLegendLabel(legend)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {items.length} item{items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {items.map((product) => (
                        <div key={product.id} className="flex items-center justify-between px-4 py-2">
                          <span className="text-sm font-medium">{product.item_name}</span>
                          <span className="text-xs text-muted-foreground">{product.item_code}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-8 rounded-lg border-2 border-dashed border-border text-muted-foreground"
              >
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No items assigned</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground border border-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
