import { ShoppingCart } from "lucide-react";
import type { RedeemItemHeaderProps } from "../types";

export function RedeemItemHeader({
  userPoints,
  userLoading,
  cartItemsCount,
  onCartClick,
}: RedeemItemHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-4 md:mb-6">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold mb-1">
          Redeem Items
        </h1>
        <p
          className="text-xs md:text-base text-muted-foreground"
        >
          Select an item to redeem it instantly.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="text-sm font-semibold flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-yellow-600 dark:text-yellow-300"
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
