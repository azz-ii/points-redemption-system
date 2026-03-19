import { ShoppingCart, LayoutGrid, List } from "lucide-react";
import type { RedeemItemHeaderProps } from "../types";

export function RedeemItemHeader({
  userPoints,
  userLoading,
  cartItemsCount,
  onCartClick,
  viewMode,
  setViewMode,
}: RedeemItemHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-4 md:mb-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold mb-1">
          Redeem Items
        </h1>
        <p
          className="text-xs md:text-base text-muted-foreground"
        >
          Select an item to redeem it instantly.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid" 
                ? "bg-background shadow-sm" 
                : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list" 
                ? "bg-background shadow-sm" 
                : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        
        <div
          className={`text-sm font-semibold flex items-center gap-2 px-3 py-2 rounded-lg bg-muted ${
            userPoints < 0
              ? "text-red-600 dark:text-red-400"
              : "text-yellow-600 dark:text-yellow-300"
          }`}
        >
          {userLoading ? "Points: 999,999,999" : `Points: ${userPoints.toLocaleString()}`}
        </div>
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-accent"
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
      </div>
    </div>
  );
}
