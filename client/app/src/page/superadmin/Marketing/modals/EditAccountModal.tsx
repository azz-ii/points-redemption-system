import { useState, useEffect, useMemo } from "react";
import { X, Package, Loader2, Check, ChevronDown, ChevronRight, Search } from "lucide-react";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import type { Account, ModalBaseProps, ProductAssignment } from "./types";
import { LEGEND_OPTIONS } from "./types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EditAccountModalProps extends ModalBaseProps {
  account: Account | null;
  onSuccess: () => void;
}

interface PendingAction {
  productIds: number[];
  assign: boolean;
  conflictProducts: { item_name: string; currentOwner: string }[];
}

export function EditAccountModal({
  isOpen,
  onClose,
  account,
  onSuccess,
}: EditAccountModalProps) {
  const [products, setProducts] = useState<ProductAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [expandedLegends, setExpandedLegends] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen && account) {
      fetchProducts();
      setExpandedLegends(new Set(LEGEND_OPTIONS.map((l) => l.value)));
      setSearchQuery("");
    }
  }, [isOpen, account]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/catalogue/bulk-assign-marketing/`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.item_name.toLowerCase().includes(q) ||
        p.item_code.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const productsByLegend = useMemo(() => {
    const grouped: Record<string, ProductAssignment[]> = {};
    for (const legend of LEGEND_OPTIONS) {
      grouped[legend.value] = filteredProducts.filter((p) => p.legend === legend.value);
    }
    return grouped;
  }, [filteredProducts]);

  const executeAssignment = async (productIds: number[], assign: boolean) => {
    if (!account || productIds.length === 0) return;

    try {
      setSaving(true);

      const response = await fetchWithCsrf(`${API_URL}/catalogue/bulk-assign-marketing/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_ids: productIds,
          mktg_admin_id: assign ? account.id : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          assign
            ? `Assigned ${data.updated_count} product(s) to ${account.full_name}`
            : `Unassigned ${data.updated_count} product(s)`
        );
        await fetchProducts();
        onSuccess();
      } else {
        toast.error(data.error || "Failed to update assignment");
      }
    } catch (err) {
      console.error("Error updating assignment:", err);
      toast.error("Error connecting to server");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProduct = (product: ProductAssignment) => {
    if (!account) return;

    const isAssigned = product.mktg_admin_id === account.id;

    if (isAssigned) {
      // Unassign — no confirmation needed for single items
      executeAssignment([product.id], false);
      return;
    }

    // Assigning — check if owned by someone else
    if (product.mktg_admin_id && product.mktg_admin_id !== account.id) {
      setPendingAction({
        productIds: [product.id],
        assign: true,
        conflictProducts: [
          { item_name: product.item_name, currentOwner: product.mktg_admin_username || "Unknown" },
        ],
      });
      return;
    }

    executeAssignment([product.id], true);
  };

  const handleToggleAllInLegend = (legend: string, assign: boolean) => {
    if (!account) return;

    const legendProducts = productsByLegend[legend] || [];
    if (legendProducts.length === 0) return;

    if (assign) {
      const toAssign = legendProducts.filter((p) => p.mktg_admin_id !== account.id);
      if (toAssign.length === 0) return;

      const conflicts = toAssign.filter(
        (p) => p.mktg_admin_id !== null && p.mktg_admin_id !== account.id
      );

      if (conflicts.length > 0) {
        setPendingAction({
          productIds: toAssign.map((p) => p.id),
          assign: true,
          conflictProducts: conflicts.map((p) => ({
            item_name: p.item_name,
            currentOwner: p.mktg_admin_username || "Unknown",
          })),
        });
        return;
      }

      executeAssignment(
        toAssign.map((p) => p.id),
        true
      );
    } else {
      const toUnassign = legendProducts.filter((p) => p.mktg_admin_id === account.id);
      if (toUnassign.length === 0) return;
      executeAssignment(
        toUnassign.map((p) => p.id),
        false
      );
    }
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    executeAssignment(pendingAction.productIds, pendingAction.assign);
    setPendingAction(null);
  };

  const cancelAction = () => {
    setPendingAction(null);
  };

  const toggleLegendExpanded = (legend: string) => {
    setExpandedLegends((prev) => {
      const next = new Set(prev);
      if (next.has(legend)) next.delete(legend);
      else next.add(legend);
      return next;
    });
  };

  if (!isOpen || !account) return null;

  const handleClose = () => {
    onClose();
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

  return (
    <>
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-account-title"
        className="bg-card rounded-lg shadow-2xl max-w-2xl w-full border divide-y border-border divide-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="edit-account-title" className="text-xl font-semibold">
              Assign Items
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{account.full_name}</p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* User Info */}
          <div className="p-4 rounded-lg bg-card">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Username:</span>
                <span className="ml-2 font-medium">{account.username || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 font-medium">{account.email}</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Item Assignment Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Package className="h-4 w-4" />
              Item Assignments
            </h3>
            <p className="text-xs text-muted-foreground">
              Select individual products to assign to this marketing user.
              Use "Select All" to assign all products within a legend.
            </p>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border">
                    <div className="h-6 w-32 rounded bg-muted animate-pulse mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded bg-muted animate-pulse" />
                      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {LEGEND_OPTIONS.map((legend) => {
                  const legendProducts = productsByLegend[legend.value] || [];
                  const assignedCount = legendProducts.filter(
                    (p) => p.mktg_admin_id === account.id
                  ).length;
                  const isExpanded = expandedLegends.has(legend.value);
                  const allAssigned =
                    legendProducts.length > 0 &&
                    legendProducts.every((p) => p.mktg_admin_id === account.id);

                  return (
                    <div key={legend.value} className="rounded-lg border border-border overflow-hidden">
                      {/* Legend Header */}
                      <div className="flex items-center justify-between p-3 bg-card">
                        <button
                          type="button"
                          onClick={() => toggleLegendExpanded(legend.value)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLegendColor(legend.value)}`}>
                            {legend.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {assignedCount}/{legendProducts.length} assigned
                          </span>
                        </button>

                        {legendProducts.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleToggleAllInLegend(legend.value, !allAssigned)}
                            disabled={saving}
                            className="text-xs px-3 py-1 rounded-md font-medium transition-colors disabled:opacity-50 bg-muted hover:bg-accent text-foreground"
                          >
                            {allAssigned ? "Unassign All" : "Select All"}
                          </button>
                        )}
                      </div>

                      {/* Product List */}
                      {isExpanded && (
                        <div className="divide-y divide-border">
                          {legendProducts.length === 0 ? (
                            <div className="p-3 text-center text-xs text-muted-foreground italic">
                              {searchQuery ? "No matching products" : "No products in this legend"}
                            </div>
                          ) : (
                            legendProducts.map((product) => {
                              const isAssigned = product.mktg_admin_id === account.id;
                              const isOwnedByOther =
                                product.mktg_admin_id !== null &&
                                product.mktg_admin_id !== account.id;

                              return (
                                <div
                                  key={product.id}
                                  className="flex items-center justify-between px-4 py-2 hover:bg-accent/50 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium truncate">
                                        {product.item_name}
                                      </span>
                                      <span className="text-xs text-muted-foreground shrink-0">
                                        {product.item_code}
                                      </span>
                                    </div>
                                    {isOwnedByOther && (
                                      <p className="text-xs text-amber-500 mt-0.5">
                                        Assigned to: {product.mktg_admin_username}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProduct(product)}
                                    disabled={saving}
                                    className={`shrink-0 ml-3 px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
                                      isAssigned
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-muted hover:bg-accent text-foreground"
                                    }`}
                                  >
                                    {saving ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : isAssigned ? (
                                      <span className="flex items-center gap-1">
                                        <Check className="h-3 w-3" /> Assigned
                                      </span>
                                    ) : (
                                      "Assign"
                                    )}
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8">
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground border border-border"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <AlertDialog open={pendingAction !== null} onOpenChange={(open) => !open && cancelAction()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Reassignment</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                The following product(s) are currently assigned to other users. Assigning
                them to <span className="font-medium text-foreground">{account.full_name}</span>{" "}
                will remove them from their current owners:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {pendingAction?.conflictProducts.map((cp) => (
                  <li key={cp.item_name}>
                    <span className="font-medium text-foreground">{cp.item_name}</span>
                    {" "}— currently assigned to{" "}
                    <span className="font-medium text-foreground">{cp.currentOwner}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={cancelAction}
            className="border border-border bg-card hover:bg-accent text-foreground"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmAction}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Confirm Reassignment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
