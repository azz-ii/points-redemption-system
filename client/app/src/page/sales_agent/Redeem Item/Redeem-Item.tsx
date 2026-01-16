import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { SidebarSales } from "@/components/sidebar/sidebar";
import { MobileBottomNavSales } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import CartModal, { type CartItem } from "@/components/cart-modal";
import { fetchCatalogueItems, type RedeemItemData, fetchCurrentUser } from "@/lib/api";
import { useDebounce } from "@/lib/useDebounce";
import { toast } from "sonner";
import { ShieldCheck, Truck, FilterX, Sparkles } from "lucide-react";
import {
  RedeemItemHeader,
  SearchBar,
  CategoryFilters,
  ItemsGrid,
  Pagination,
} from "./components";
import type { SalesPages } from "./types";

// Static categories since they are defined in the backend model
const CATEGORIES = ["All", "Collateral", "Giveaway", "Asset", "Benefit"];

export default function RedeemItem() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const currentPage = "redeem-items" as SalesPages;

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage_num, setCurrentPage_num] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [items, setItems] = useState<RedeemItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userLoading, setUserLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [affordableOnly, setAffordableOnly] = useState(false);
  const [needsDriverOnly, setNeedsDriverOnly] = useState(false);
  const itemsPerPage = 6;

  // Debounce search query to avoid excessive API calls (300ms delay)
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch catalogue items with server-side pagination
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[Redeem-Item] Fetching items - page:", currentPage_num, "search:", debouncedSearch, "category:", activeCategory);
      
      const response = await fetchCatalogueItems({
        page: currentPage_num,
        pageSize: itemsPerPage,
        search: debouncedSearch,
        category: activeCategory,
      });
      
      console.log("[Redeem-Item] Received", response.items.length, "items, total:", response.totalCount);
      
      setItems(response.items);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error("[Redeem-Item] Error loading catalogue items:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load catalogue items";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage_num, debouncedSearch, activeCategory, itemsPerPage]);

  // Fetch items when page, search, or category changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Fetch user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
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
        setUserPoints(0);
      } finally {
        setUserLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Use static categories
  const categories = CATEGORIES;

  // Calculate category counts for display (using totalCount for "All")
  const categoryCounts: Record<string, number> = {
    "All": totalCount,
  };

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage_num(1);
  }, [debouncedSearch]);

  // Client-side filtering for affordable and needs_driver (applied to server results)
  const clientFilteredItems = items.filter((item) => {
    const matchesPoints = !affordableOnly || userLoading ? true : item.points <= userPoints;
    const matchesDriver = !needsDriverOnly || item.needs_driver;
    return matchesPoints && matchesDriver;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setCurrentPage_num(1);
    setAffordableOnly(false);
    setNeedsDriverOnly(false);
  };

  const handleAddToCart = (item: RedeemItemData) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prevItems,
        {
          id: item.id,
          name: item.name,
          points: item.points,
          image: item.image,
          quantity: 1,
          needs_driver: item.needs_driver,
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

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  };

  const featuredSuggestions = categories.filter((c) => c !== "All").slice(0, 4);

  return (
    <div className="flex h-screen">
      <SidebarSales />

      <div
        className={`flex-1 overflow-y-auto pb-20 md:pb-0 ${
          isDark ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="p-4 md:p-8 md:pb-6">
          <RedeemItemHeader
            userPoints={userPoints}
            userLoading={userLoading}
            cartItemsCount={cartItems.length}
            onCartClick={() => setCartOpen(true)}
            onNotificationClick={() => setNotificationOpen(!notificationOpen)}
            onHistoryClick={() => navigate("/sales/redemption-status")}
          />

          <SearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setCurrentPage_num(1);
            }}
            placeholder="Search by ID, Name......"
            onClear={handleClearFilters}
            suggestions={featuredSuggestions}
          />

          <div
            className={`rounded-xl border shadow-soft p-4 mb-3 flex flex-col gap-3 ${
              isDark
                ? "bg-gray-900/70 border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div
                className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Showing {clientFilteredItems.length} of {totalCount} items
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isDark
                      ? "bg-gray-800 text-gray-200"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  Category: {activeCategory}
                </span>
                <button
                  onClick={handleClearFilters}
                  className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border ${
                    isDark
                      ? "border-gray-700 text-gray-100 hover:bg-gray-800"
                      : "border-gray-200 text-gray-800 hover:bg-white"
                  }`}
                >
                  <FilterX className="h-4 w-4" />
                  Reset filters
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAffordableOnly((prev) => !prev)}
                className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                  affordableOnly
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-soft"
                    : isDark
                    ? "border-gray-700 text-gray-100 hover:bg-gray-800"
                    : "border-gray-200 text-gray-800 hover:bg-white"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Within my points
              </button>
              <button
                onClick={() => setNeedsDriverOnly((prev) => !prev)}
                className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                  needsDriverOnly
                    ? "bg-blue-500 text-white border-blue-500 shadow-soft"
                    : isDark
                    ? "border-gray-700 text-gray-100 hover:bg-gray-800"
                    : "border-gray-200 text-gray-800 hover:bg-white"
                }`}
              >
                <Truck className="h-4 w-4" />
                Delivery required
              </button>
              <span
                className={`inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                  isDark
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                <Sparkles className="h-4 w-4 text-yellow-300" />
                {affordableOnly ||
                needsDriverOnly ||
                activeCategory !== "All" ||
                searchQuery
                  ? "Filters active"
                  : "Browse freely"}
              </span>
            </div>
          </div>

          <CategoryFilters
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={(category) => {
              setActiveCategory(category);
              setCurrentPage_num(1);
            }}
            counts={categoryCounts}
          />

          <ItemsGrid
            items={clientFilteredItems}
            loading={loading}
            error={error}
            searchQuery={debouncedSearch}
            activeCategory={activeCategory}
            onAddToCart={handleAddToCart}
            onRetry={fetchItems}
            onResetFilters={handleClearFilters}
          />

          <Pagination
            currentPage={currentPage_num}
            totalPages={totalPages}
            onPageChange={setCurrentPage_num}
          />
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        availablePoints={userPoints}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavSales />
    </div>
  );
}

  const handleAddToCart = (item: RedeemItemData) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prevItems,
        {
          id: item.id,
          name: item.name,
          points: item.points,
          image: item.image,
          quantity: 1,
          needs_driver: item.needs_driver,
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

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  };

  const featuredSuggestions = categories.filter((c) => c !== "All").slice(0, 4);

  return (
    <div className="flex h-screen">
      <SidebarSales />

      <div
        className={`flex-1 overflow-y-auto pb-20 md:pb-0 ${
          isDark ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="p-4 md:p-8 md:pb-6">
          <RedeemItemHeader
            userPoints={userPoints}
            userLoading={userLoading}
            cartItemsCount={cartItems.length}
            onCartClick={() => setCartOpen(true)}
            onNotificationClick={() => setNotificationOpen(!notificationOpen)}
            onHistoryClick={() => navigate("/sales/redemption-status")}
          />

          <SearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setCurrentPage_num(1);
            }}
            placeholder="Search by ID, Name......"
            onClear={handleClearFilters}
            suggestions={featuredSuggestions}
          />

          <div
            className={`rounded-xl border shadow-soft p-4 mb-3 flex flex-col gap-3 ${
              isDark
                ? "bg-gray-900/70 border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div
                className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Showing {paginatedItems.length} of {totalResults} items
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isDark
                      ? "bg-gray-800 text-gray-200"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  Category: {activeCategory}
                </span>
                <button
                  onClick={handleClearFilters}
                  className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border ${
                    isDark
                      ? "border-gray-700 text-gray-100 hover:bg-gray-800"
                      : "border-gray-200 text-gray-800 hover:bg-white"
                  }`}
                >
                  <FilterX className="h-4 w-4" />
                  Reset filters
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAffordableOnly((prev) => !prev)}
                className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                  affordableOnly
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-soft"
                    : isDark
                    ? "border-gray-700 text-gray-100 hover:bg-gray-800"
                    : "border-gray-200 text-gray-800 hover:bg-white"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Within my points
              </button>
              <button
                onClick={() => setNeedsDriverOnly((prev) => !prev)}
                className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                  needsDriverOnly
                    ? "bg-blue-500 text-white border-blue-500 shadow-soft"
                    : isDark
                    ? "border-gray-700 text-gray-100 hover:bg-gray-800"
                    : "border-gray-200 text-gray-800 hover:bg-white"
                }`}
              >
                <Truck className="h-4 w-4" />
                Delivery required
              </button>
              <span
                className={`inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                  isDark
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                <Sparkles className="h-4 w-4 text-yellow-300" />
                {affordableOnly ||
                needsDriverOnly ||
                activeCategory !== "All" ||
                searchQuery
                  ? "Filters active"
                  : "Browse freely"}
              </span>
            </div>
          </div>

          <CategoryFilters
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={(category) => {
              setActiveCategory(category);
              setCurrentPage_num(1);
            }}
            counts={categoryCounts}
          />

          <ItemsGrid
            items={items}
            loading={loading}
            error={error}
            searchQuery={debouncedSearch}
            activeCategory={activeCategory}
            onAddToCart={handleAddToCart}
            onRetry={loadData}
            onResetFilters={handleClearFilters}
          />

          <Pagination
            currentPage={currentPage_num}
            totalPages={totalPages}
            onPageChange={setCurrentPage_num}
          />
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        availablePoints={userPoints}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavSales />
    </div>
  );
}
