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

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage_num(1);
  }, [debouncedSearch]);

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
            items={items}
            loading={loading}
            error={error}
            searchQuery={debouncedSearch}
            activeCategory={activeCategory}
            onAddToCart={handleAddToCart}
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
