import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import type { TeamMemberBreakdown as MemberRow } from "@/page/superadmin/Dashboard/utils/analyticsApi";

interface TeamMemberBreakdownProps {
  members: MemberRow[];
}

type SortKey = "full_name" | "total_requests" | "approved_count" | "rejected_count" | "pending_count" | "total_points_redeemed" | "approval_rate";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "full_name", label: "Member" },
  { key: "total_requests", label: "Requests", align: "right" },
  { key: "approved_count", label: "Approved", align: "right" },
  { key: "rejected_count", label: "Rejected", align: "right" },
  { key: "pending_count", label: "Pending", align: "right" },
  { key: "total_points_redeemed", label: "Points", align: "right" },
  { key: "approval_rate", label: "Appr. %", align: "right" },
];

export function TeamMemberBreakdown({ members }: TeamMemberBreakdownProps) {
  const [sortKey, setSortKey] = useState<SortKey>("total_requests");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sorted = [...members].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "string" && typeof bv === "string") {
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No member data available.</p>;
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Member Breakdown</h4>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0">
              <tr className="bg-muted/80 text-left">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-2 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors ${col.align === "right" ? "text-right" : ""}`}
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && <ArrowUpDown className="h-3 w-3" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((m) => (
                <tr key={m.user_id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 text-xs font-medium">{m.full_name}</td>
                  <td className="px-3 py-2 text-xs text-right">{m.total_requests}</td>
                  <td className="px-3 py-2 text-xs text-right text-green-600 dark:text-green-400">{m.approved_count}</td>
                  <td className="px-3 py-2 text-xs text-right text-red-600 dark:text-red-400">{m.rejected_count}</td>
                  <td className="px-3 py-2 text-xs text-right text-yellow-600 dark:text-yellow-400">{m.pending_count}</td>
                  <td className="px-3 py-2 text-xs text-right font-semibold">{m.total_points_redeemed.toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs text-right">
                    <span className={m.approval_rate >= 70 ? "text-green-600 dark:text-green-400" : m.approval_rate >= 40 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}>
                      {m.approval_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
