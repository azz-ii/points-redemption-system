import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { SidebarSales } from "@/components/sidebar/sidebar";
import { MobileBottomNavSales } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
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
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage_num - 1) * itemsPerPage,
    currentPage_num * itemsPerPage
  );

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
