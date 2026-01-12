import { useTheme } from "next-themes";
import { Bell, ShoppingCart } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { RedeemItemHeaderProps } from "../types";

export function RedeemItemHeader({
  userPoints,
  userLoading,
  cartItemsCount,
  onCartClick,
  onNotificationClick,
}: RedeemItemHeaderProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
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
          {userLoading ? "Points: 999,999,999" : `Points: ${userPoints.toLocaleString()}`}
        </div>
        <button
          className={`relative p-2 rounded-lg transition-colors ${
            isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
          }`}
          aria-label="Cart"
          onClick={onCartClick}
        >
          <ShoppingCart className="h-6 w-6" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartItemsCount}
            </span>
          )}
        </button>
        <button
          onClick={onNotificationClick}
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
  );
}
