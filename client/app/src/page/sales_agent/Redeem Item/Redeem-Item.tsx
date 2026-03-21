import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/context/AuthContext";
import CartModal, { type CartItem } from "@/components/cart-modal";
import { type RedeemItemData, saveCart } from "@/lib/api";
import { useRedeemItems } from "@/hooks/queries/useCatalogue";
import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import { useCart } from "@/hooks/queries/useCart";
import { toast } from "sonner";
import {
  RedeemItemHeader,
  SearchBar,
  CategoryFilters,
  ItemsGrid,
  Pagination,
} from "./components";
import { ViewItemModal } from "./modals/ViewItemModal";
import type { SalesPages } from "./types";

export default function RedeemItem() {
  const _navigate = useNavigate();
  const _handleLogout = useLogout();
  const _currentPage = "redeem-items" as SalesPages;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage_num, setCurrentPage_num] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<RedeemItemData | null>(null);
  const itemsPerPage = 12;

  // Query hooks for data fetching
  const { data: items = [], isLoading: loading, error: itemsError } = useRedeemItems();
  const { data: userProfile, isLoading: userLoading } = useCurrentUser();
  const { data: savedCartItems } = useCart();

  const error = itemsError ? (itemsError instanceof Error ? itemsError.message : "Failed to load catalogue items") : null;
  const userPoints = userProfile?.points || userProfile?.profile?.points || 0;

  // Track whether the initial cart load has completed so we don't immediately
  // write back what we just fetched.
  const cartLoadedRef = useRef(false);

  // Restore saved cart when items and saved cart data are both available
  useEffect(() => {
    if (cartLoadedRef.current) return;
    if (!items.length || savedCartItems === undefined) return;

    if (savedCartItems && savedCartItems.length > 0) {
      const activeIdSet = new Set(items.map(i => i.id));
      const restored: CartItem[] = savedCartItems
        .filter(si => activeIdSet.has(String(si.product_id)))
        .map(si => {
          const live = items.find(i => i.id === String(si.product_id))!;
          const minQty = live.min_order_qty ?? 1;
          return {
            id: live.id,
            name: live.name,
            points: live.points,
            image: live.image,
            quantity: si.quantity ?? minQty,
            needs_driver: si.needs_driver,
            pricing_formula: live.pricing_formula,
            points_multiplier: live.points_multiplier,
            extra_data: si.extra_data || {},
            available_stock: live.available_stock,
            min_order_qty: minQty,
            max_order_qty: live.max_order_qty,
          };
        });
      setCartItems(restored);
    }
    cartLoadedRef.current = true;
  }, [items, savedCartItems]);

  // Debounced cart persistence — save any cart change to the server after 500 ms.
  // Skip until the initial cart load has finished to avoid overwriting the saved cart.
  useEffect(() => {
    if (!cartLoadedRef.current) return;

    const timer = setTimeout(() => {
      saveCart(cartItems).catch(err =>
        console.warn("[Redeem-Item] Failed to persist cart:", err)
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [cartItems]);

  // Extract unique categories from items
  const categories = ["All", ...Array.from(new Set(items.map(item => item.category)))];

  const filtered = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(q);
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Sort out-of-stock items to the bottom
    if (a.available_stock === 0 && b.available_stock > 0) return 1;
    if (a.available_stock > 0 && b.available_stock === 0) return -1;
    // Within same stock tier, sort by request frequency (most requested first)
    return (b.request_count ?? 0) - (a.request_count ?? 0);
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage_num - 1) * itemsPerPage,
    currentPage_num * itemsPerPage
  );

  const handleAddToCart = (item: RedeemItemData) => {
    // Check if item has available stock (skip check for made-to-order items)
    if (item.has_stock && item.available_stock <= 0) {
      toast.error("Out of stock", {
        description: `${item.name} is currently unavailable`,
      });
      return;
    }

    const minQty = item.min_order_qty ?? 1;
    const maxQty = item.max_order_qty;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        // For FIXED items, increment quantity up to available stock and max order qty
        if (!item.pricing_formula || item.pricing_formula === 'NONE') {
          const effectiveMax = maxQty !== null 
            ? Math.min(maxQty, item.available_stock) 
            : item.available_stock;
          
          if (existingItem.quantity >= effectiveMax) {
            const limitReason = maxQty !== null && existingItem.quantity >= maxQty
              ? `Maximum order quantity is ${maxQty}`
              : `Only ${item.available_stock} available`;
            toast.error("Maximum quantity reached", {
              description: limitReason,
            });
            return prevItems;
          }
          return prevItems.map((i) =>
            i.id === item.id ? { ...i, quantity: Math.min(i.quantity + 1, effectiveMax) } : i
          );
        }
        // Dynamic item already in cart - just return existing
        return prevItems;
      }
      return [
        ...prevItems,
        {
          id: item.id,
          name: item.name,
          points: item.points,
          image: item.image,
          quantity: minQty,
          needs_driver: item.needs_driver,
          pricing_formula: item.pricing_formula,
          points_multiplier: item.points_multiplier,
          extra_data: {},
          available_stock: item.available_stock,
          min_order_qty: minQty,
          max_order_qty: maxQty,
        },
      ];
    });
    toast("Item added to cart", {
      description: item.name,
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const handleUpdateExtraData = (itemId: string, key: string, value: any) => {
    setCartItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? { ...i, extra_data: { ...(i.extra_data || {}), [key]: value } } : i))
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Static top: header, search, filters */}
      <div className="flex-shrink-0 px-4 md:px-8 pt-4 md:pt-8">
        <RedeemItemHeader
          userPoints={userPoints}
          userLoading={userLoading}
          cartItemsCount={cartItems.length}
          onCartClick={() => setCartOpen(true)}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by ID, Name......"
        />

        <CategoryFilters
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={(category) => {
            setActiveCategory(category);
            setCurrentPage_num(1);
          }}
        />
      </div>

      {/* Grid + pagination fill remaining vh */}
      <div className="flex-1 min-h-0 flex flex-col px-4 md:px-8">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ItemsGrid
            items={paginatedItems}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            viewMode={viewMode}
            onAddToCart={handleAddToCart}
            onViewItem={setSelectedItem}
          />
        </div>
        <div className="flex-shrink-0 pb-20 md:pb-4">
          <Pagination
            currentPage={currentPage_num}
            totalPages={totalPages}
            onPageChange={setCurrentPage_num}
          />
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateExtraData={handleUpdateExtraData}
        onRemoveItem={handleRemoveFromCart}
        availablePoints={userPoints}
      />

      {/* View Item Modal */}
      {selectedItem && (
        <ViewItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
