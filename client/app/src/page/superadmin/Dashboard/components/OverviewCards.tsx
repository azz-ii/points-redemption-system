import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  UserCheck,
  Ban,
} from "lucide-react";
import type { AnalyticsOverview } from "../utils/analyticsApi";

interface OverviewCardsProps {
  data: AnalyticsOverview | null;
  loading: boolean;
}

interface StatCard {
  label: string;
  key: keyof AnalyticsOverview;
  icon: React.ReactNode;
  color: string;
  format?: "number" | "points";
}

const CARDS: StatCard[] = [
  { label: "Total Requests", key: "total_requests", icon: <FileText className="h-4 w-4" />, color: "text-foreground" },
  { label: "Pending", key: "pending_count", icon: <Clock className="h-4 w-4" />, color: "text-yellow-500" },
  { label: "Approved", key: "approved_count", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-500" },
  { label: "Rejected", key: "rejected_count", icon: <XCircle className="h-4 w-4" />, color: "text-red-500" },
  { label: "Processed", key: "processed_count", icon: <TrendingUp className="h-4 w-4" />, color: "text-blue-500" },
  { label: "Cancelled", key: "cancelled_count", icon: <Ban className="h-4 w-4" />, color: "text-orange-500" },
  { label: "Points Redeemed", key: "total_points_redeemed", icon: <TrendingUp className="h-4 w-4" />, color: "text-purple-500", format: "points" },
  { label: "Distributors", key: "on_board_count", icon: <Users className="h-4 w-4" />, color: "text-indigo-500" },
  { label: "Customers", key: "customers_count", icon: <UserCheck className="h-4 w-4" />, color: "text-teal-500" },
];

export function OverviewCards({ data, loading }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
      {CARDS.map((card) => {
        const rawVal = data ? data[card.key] : 0;
        const value =
          card.format === "points"
            ? (rawVal as number).toLocaleString()
            : String(rawVal ?? 0);

        return (
          <div
            key={card.key}
            className="p-4 rounded-lg border bg-card border-border transition-colors"
          >
            <div className={`flex items-center gap-1.5 mb-2 ${card.color}`}>
              {card.icon}
              <p className="text-xs font-medium truncate">{card.label}</p>
            </div>
            <p className="text-2xl font-bold">
              {loading ? "-" : value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
