import { useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  SearchBar,
  CategoryFilters,
  ItemsGrid,
} from "../../Redeem Item/components";
import type { RedeemItem } from "../../Redeem Item/types";

interface AddItemPickerModalProps {
  isOpen: boolean;
  items: RedeemItem[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (item: RedeemItem, quantity: number) => void;
}

export function AddItemPickerModal({
  isOpen,
  items,
  loading,
  error,
  onClose,
  onConfirm,
}: AddItemPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<RedeemItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.category)))],
    [items],
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.item_code?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, activeCategory]);

  if (!isOpen) return null;

  const openQuantityPanel = (item: RedeemItem) => {
    setSelectedItem(item);
    setQuantity(item.min_order_qty || 1);
  };

  const handleConfirm = () => {
    if (!selectedItem) return;
    onConfirm(selectedItem, quantity);
    onClose();
    setSelectedItem(null);
    setQuantity(1);
    setSearchQuery("");
    setActiveCategory("All");
  };

  const handleClose = () => {
    onClose();
    setSelectedItem(null);
    setQuantity(1);
    setSearchQuery("");
    setActiveCategory("All");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-4xl w-full border border-border max-h-[85vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-item-picker-title"
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
          <div>
            <h3 id="add-item-picker-title" className="text-lg font-semibold">
              Add Item
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Pick a product from the catalogue, then confirm the quantity.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close add item dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or code..."
          />

          <CategoryFilters
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="max-h-[42vh] overflow-y-auto pr-1">
            <ItemsGrid
              items={filteredItems}
              loading={loading}
              error={null}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              viewMode="grid"
              onAddToCart={openQuantityPanel}
              compact={true}
            />
          </div>
        </div>

        <div className="p-5 border-t border-border bg-muted/20 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-foreground">
              Selected Product
            </label>
            <div className="rounded-lg border border-border bg-card px-3 py-2 min-h-11 flex items-center">
              {selectedItem ? (
                <div>
                  <p className="font-medium">{selectedItem.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedItem.item_code || selectedItem.id} •{" "}
                    {selectedItem.category}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a product from the grid
                </p>
              )}
            </div>
          </div>

          <div className="w-full md:w-40">
            <label className="block text-sm font-medium mb-2 text-foreground">
              Quantity
            </label>
            <input
              type="number"
              min={selectedItem ? selectedItem.min_order_qty || 1 : 1}
              max={
                selectedItem
                  ? Math.min(
                      selectedItem.available_stock,
                      selectedItem.max_order_qty ?? Number.POSITIVE_INFINITY,
                    )
                  : undefined
              }
              value={quantity}
              onChange={(event) => {
                const parsed = Number(event.target.value);
                if (Number.isNaN(parsed)) return;
                const minOrderQty = selectedItem?.min_order_qty || 1;
                const maxByStock = selectedItem
                  ? selectedItem.available_stock
                  : Number.POSITIVE_INFINITY;
                const maxByOrder =
                  selectedItem?.max_order_qty ?? Number.POSITIVE_INFINITY;
                const maxQuantity = Math.min(maxByStock, maxByOrder);
                setQuantity(
                  Math.max(minOrderQty, Math.min(parsed, maxQuantity)),
                );
              }}
              disabled={!selectedItem}
              className="w-full px-3 py-2 rounded-lg border bg-card border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selectedItem}
            className="px-5 py-2.5 rounded-lg font-semibold transition-colors bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
