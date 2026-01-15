import { useTheme } from "next-themes";
import { Bell, ShoppingCart, Sparkles, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { RedeemItemHeaderProps } from "../types";

export function RedeemItemHeader({
  userPoints,
  userLoading,
  cartItemsCount,
  onCartClick,
  onNotificationClick,
  onHistoryClick,
}: RedeemItemHeaderProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative overflow-hidden rounded-2xl border shadow-soft mb-4 md:mb-6">
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-r from-brand via-indigo-500 to-sky-500 opacity-90"
            : "bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 opacity-95"
        }`}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(circle_at_80%_0,rgba(255,255,255,0.08),transparent_35%)]"
        aria-hidden="true"
      />
      <div className="relative p-4 md:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-white">
        <div className="space-y-3">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur ${
              isDark ? "bg-white/10" : "bg-black/10"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Fresh picks curated for you
          </span>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              Redeem Items
            </h1>
            <p className="text-sm md:text-base text-white/80">
              Discover gear you can redeem instantly with your available points.
            </p>
          </div>
          {onHistoryClick && (
            <button
              onClick={onHistoryClick}
              className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg transition-colors backdrop-blur border w-fit ${
                isDark
                  ? "bg-white/15 hover:bg-white/25 border-white/20"
                  : "bg-black/10 hover:bg-black/20 border-black/20"
              }`}
            >
              Track redemption status
              <ArrowUpRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[280px]">
          <div
            className={`rounded-xl border backdrop-blur p-4 shadow-soft ${
              isDark
                ? "bg-gray-950/60 border-gray-800"
                : "bg-white/90 border-white/50"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <p
                className={`text-xs font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Available points
              </p>
              <span
                className={`text-[11px] px-2 py-1 rounded-full font-semibold ${
                  isDark
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                Ready to redeem
              </span>
            </div>
            <div className="flex items-end justify-between gap-3">
              {userLoading ? (
                <span
                  className={`block h-8 w-24 rounded animate-pulse ${
                    isDark ? "bg-gray-800" : "bg-gray-300"
                  }`}
                  aria-hidden="true"
                />
              ) : (
                <p
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {userPoints.toLocaleString()} pts
                </p>
              )}
              <div
                className={`text-xs text-right leading-tight ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Stay within your balance <br /> to speed up approvals.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end">
            <button
              className={`relative p-2 rounded-lg transition-colors text-white ${
                isDark
                  ? "bg-white/15 hover:bg-white/25"
                  : "bg-black/10 hover:bg-black/20"
              }`}
              aria-label="Cart"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-300 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <button
              onClick={onNotificationClick}
              className={`p-2 rounded-lg transition-colors text-white ${
                isDark
                  ? "bg-white/15 hover:bg-white/25"
                  : "bg-black/10 hover:bg-black/20"
              }`}
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
