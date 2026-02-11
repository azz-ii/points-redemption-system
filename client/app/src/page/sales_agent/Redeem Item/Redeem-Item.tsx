import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/context/AuthContext";
import CartModal, { type CartItem } from "@/components/cart-modal";
import { fetchCatalogueItems, type RedeemItemData, fetchCurrentUser } from "@/lib/api";
import { toast } from "sonner";
import {
  RedeemItemHeader,
  SearchBar,
  CategoryFilters,
  ItemsGrid,
  Pagination,
} from "./components";
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
  const [items, setItems] = useState<RedeemItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userLoading, setUserLoading] = useState(true);
  const itemsPerPage = 6;

  // Fetch items and user profile on component mount
  useEffect(() => {
    console.log("[Redeem-Item] Component mounted, fetching catalogue items and user profile...");
    
    const loadData = async () => {
      try {
        // Fetch catalogue items
        setLoading(true);
        setError(null);
        console.log("[Redeem-Item] Starting API fetch for items...");
        
        const fetchedItems = await fetchCatalogueItems();
        console.log("[Redeem-Item] Successfully fetched items:", fetchedItems);
        
        setItems(fetchedItems);
        console.log("[Redeem-Item] State updated with items");
      } catch (err) {
        console.error("[Redeem-Item] Error loading catalogue items:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load catalogue items";
        setError(errorMessage);
        console.error("[Redeem-Item] Error state set:", errorMessage);
      } finally {
        setLoading(false);
        console.log("[Redeem-Item] Loading complete");
      }

      try {
        // Fetch user profile
        setUserLoading(true);
        console.log("[Redeem-Item] Starting API fetch for user profile...");
        
        const userProfile = await fetchCurrentUser();
        console.log("[Redeem-Item] Successfully fetched user profile:", userProfile);
        
        // Get points from either the direct field or profile field
        const points = userProfile.points || userProfile.profile?.points || 0;
        setUserPoints(points);
        console.log("[Redeem-Item] User points set to:", points);
      } catch (err) {
        console.error("[Redeem-Item] Error loading user profile:", err);
        // Don't set error state for user profile, just keep default points
        setUserPoints(0);
        console.error("[Redeem-Item] User points defaulted to 0");
      } finally {
        setUserLoading(false);
        console.log("[Redeem-Item] User profile loading complete");
      }
    };

    loadData();
  }, []);

  // Extract unique categories from items
  const categories = ["All", ...Array.from(new Set(items.map(item => item.category)))];

  const filtered = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(q);
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Sort by available_stock descending (in-stock items first, out-of-stock last)
    if (a.available_stock === 0 && b.available_stock > 0) return 1;
    if (a.available_stock > 0 && b.available_stock === 0) return -1;
    return 0;
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
        if (item.pricing_type === 'FIXED') {
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
          pricing_type: item.pricing_type,
          points_multiplier: item.points_multiplier,
          dynamic_quantity: item.pricing_type === 'FIXED' ? undefined : 0,
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

  const handleUpdateDynamicQuantity = (itemId: string, dynamicQuantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? { ...i, dynamic_quantity: dynamicQuantity } : i))
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  };

  return (
    <div
      className="flex-1 overflow-y-auto pb-20 md:pb-0"
    >
      {/* Header */}
      <div className="p-4 md:p-8 md:pb-6">
        <RedeemItemHeader
          userPoints={userPoints}
          userLoading={userLoading}
          cartItemsCount={cartItems.length}
          onCartClick={() => setCartOpen(true)}
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

        <ItemsGrid
          items={paginatedItems}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          onAddToCart={handleAddToCart}
        />

        <Pagination
          currentPage={currentPage_num}
          totalPages={totalPages}
          onPageChange={setCurrentPage_num}
        />
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateDynamicQuantity={handleUpdateDynamicQuantity}
        onRemoveItem={handleRemoveFromCart}
        availablePoints={userPoints}
      />
    </div>
  );
}
