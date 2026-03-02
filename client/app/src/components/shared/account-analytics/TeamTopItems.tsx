import { Package } from "lucide-react";
import type { TeamTopItem } from "@/page/superadmin/Dashboard/utils/analyticsApi";

interface TeamTopItemsProps {
  items: TeamTopItem[];
}

export function TeamTopItems({ items }: TeamTopItemsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <Package className="h-3.5 w-3.5" />
        Top Redeemed Items
      </h4>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/80 text-left">
              <th className="px-3 py-2 font-medium text-muted-foreground">Product</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">Category</th>
              <th className="px-3 py-2 font-medium text-muted-foreground text-right">Qty</th>
              <th className="px-3 py-2 font-medium text-muted-foreground text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item, i) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 text-xs font-medium truncate max-w-[200px]">{item.product_name}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{item.category || "\u2014"}</td>
                <td className="px-3 py-2 text-xs text-right">{item.total_quantity.toLocaleString()}</td>
                <td className="px-3 py-2 text-xs text-right font-semibold">{item.total_points.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
