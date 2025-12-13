import { useState } from "react";
import { useTheme } from "next-themes";
import { SidebarSales } from "@/components/sidebar/sidebar";
import { MobileBottomNavSales } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import CartModal, { type CartItem } from "@/components/cart-modal";
import { Bell, Search, ShoppingCart, Plus } from "lucide-react";

interface RedeemItemData {
  id: string;
  name: string;
  points: number;
  image: string;
  category: string;
}

type SalesPages = "dashboard" | "redemption-status" | "redeem-items";

interface RedeemItemProps {
  onNavigate: (page: SalesPages) => void;
  onLogout?: () => void;
  currentPage?: SalesPages;
}

export default function RedeemItem({
  onNavigate,
  onLogout,
  currentPage = "redeem-items",
}: RedeemItemProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage_num, setCurrentPage_num] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const itemsPerPage = 6;

  const items: RedeemItemData[] = [
    {
      id: "1",
      name: "Platinum Polo Shirt",
      points: 5000,
      image: "/images/sample-shirt.jpg",
      category: "Apparel",
    },
    {
      id: "2",
      name: "Platinum Polo Shirt",
      points: 5000,
      image: "/images/sample-shirt.jpg",
      category: "Apparel",
    },
    {
      id: "3",
      name: "Platinum Polo Shirt",
      points: 5000,
      image: "/images/sample-shirt.jpg",
      category: "Apparel",
    },
    {
      id: "4",
      name: "Platinum Polo Shirt",
      points: 5000,
      image: "/images/sample-shirt.jpg",
      category: "Apparel",
    },
    {
      id: "5",
      name: "Platinum Polo Shirt",
      points: 5000,
      image: "/images/sample-shirt.jpg",
      category: "Apparel",
    },
    {
      id: "6",
      name: "Platinum Polo Shirt",
      points: 5000,
      image: "/images/sample-shirt.jpg",
      category: "Apparel",
    },
    {
      id: "7",
      name: "Platinum Polo Shirt",
      points: 5000,
      image: "/images/sample-shirt.jpg",
      category: "Apparel",
    },
    {
      id: "8",
      name: "Platinum Polo Shirt",
      points: 5000,
      image: "/images/sample-shirt.jpg",
      category: "Apparel",
    },
  ];

  const categories = ["All", "Apparel", "Accessories", "Gift"];

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

  const handleNavigate = (page: SalesPages) => onNavigate(page);

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
      <SidebarSales
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={onLogout || (() => {})}
      />

      <div
        className={`flex-1 overflow-y-auto pb-20 md:pb-0 ${
          isDark ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="p-4 md:p-8 md:pb-6">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-1">
                Redeem Items
              </h1>
              <p
                className={`text-xs md:text-base ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Select an item to redeem it instantly.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`text-sm font-semibold flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isDark
                    ? "bg-gray-900 text-yellow-300"
                    : "bg-gray-100 text-yellow-600"
                }`}
              >
                Points: 20,000
              </div>
              <button
                className={`relative p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
                aria-label="Cart"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Search */}
          <div className="mb-4 md:mb-6">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-800"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Search
                className={`h-5 w-5 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                placeholder="Search by ID, Name......"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${
                  isDark
                    ? "text-white placeholder-gray-500"
                    : "text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentPage_num(1);
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? isDark
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : isDark
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg overflow-hidden border ${
                  isDark
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                {/* Image */}
                <div className="bg-gray-300 h-40 md:h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Info */}
                <div className="p-4 relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-sm md:text-base">
                        {item.name}
                      </h3>
                      <p
                        className={`text-xs md:text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {item.points.toLocaleString()} pts
                      </p>
                    </div>
                    {/* Add button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDark
                          ? "bg-yellow-400 text-black hover:bg-yellow-300"
                          : "bg-yellow-400 text-black hover:bg-yellow-300"
                      }`}
                      aria-label={`Add ${item.name}`}
                    >
                      <Plus className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <button
                disabled={currentPage_num === 1}
                onClick={() =>
                  setCurrentPage_num(Math.max(1, currentPage_num - 1))
                }
                className={`px-3 py-2 rounded-lg ${
                  currentPage_num === 1
                    ? isDark
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : "bg-gray-200 text-gray-600 cursor-not-allowed"
                    : isDark
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage_num(page)}
                    className={`px-3 py-2 rounded-lg ${
                      page === currentPage_num
                        ? isDark
                          ? "bg-blue-600 text-white"
                          : "bg-blue-600 text-white"
                        : isDark
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                disabled={currentPage_num === totalPages}
                onClick={() =>
                  setCurrentPage_num(Math.min(totalPages, currentPage_num + 1))
                }
                className={`px-3 py-2 rounded-lg ${
                  currentPage_num === totalPages
                    ? isDark
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : "bg-gray-200 text-gray-600 cursor-not-allowed"
                    : isDark
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          )}
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
        availablePoints={20000}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavSales
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={onLogout || (() => {})}
      />
    </div>
  );
}
