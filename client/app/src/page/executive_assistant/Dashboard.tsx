import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Search, Check, X } from "lucide-react";

interface ApprovalItem {
  id: string;
  submitter: string;
  date: string;
  category: string;
  approvalStatus: "Pending" | "Approved" | "Rejected";
}

function ExecutiveAssistantDashboard() {
  const _navigate = useNavigate();
  const _handleLogout = useLogout();
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalItems] = useState<ApprovalItem[]>([
    {
      id: "101",
      submitter: "Celestine Quizon",
      date: "12-10-2025",
      category: "Client Meal",
      approvalStatus: "Pending",
    },
  ]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Welcome, Jane</h1>
          <p className="text-sm text-muted-foreground">
            Manage approval requests and redemptions
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative flex items-center rounded-lg border bg-card border-border">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Name....."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full h-12 text-base bg-transparent border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Edit Approval Requests Table */}
        <div className="border rounded-lg overflow-hidden bg-card border-border transition-colors">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold">Edit Approval Requests</h2>
          </div>
          <table className="w-full">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Submitter
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Approval Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {approvalItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-accent transition-colors"
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4 text-sm">{item.id}</td>
                  <td className="px-6 py-4 text-sm">{item.submitter}</td>
                  <td className="px-6 py-4 text-sm">{item.date}</td>
                  <td className="px-6 py-4 text-sm">{item.category}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.approvalStatus === "Pending"
                          ? "bg-yellow-400 text-black"
                          : item.approvalStatus === "Approved"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        className="flex items-center gap-1 px-3 py-1 rounded text-sm font-medium bg-success hover:bg-success/90 text-white transition-colors"
                        onClick={() => console.log("Confirm", item.id)}
                      >
                        <Check className="h-4 w-4" />
                        Confirm
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 rounded text-sm font-medium bg-destructive hover:bg-destructive/90 text-white transition-colors"
                        onClick={() => console.log("Reject", item.id)}
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-y-auto pb-20 p-4">
        <h2 className="text-2xl font-semibold mb-4">
          Edit Approval Requests
        </h2>
        <div className="relative flex items-center rounded-lg border mb-4 bg-card border-border">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full text-sm bg-transparent border-0 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3">
          {approvalItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border bg-card border-border"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-sm">{item.id}</p>
                  <p className="text-xs text-muted-foreground">{item.submitter}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.approvalStatus === "Pending"
                      ? "bg-yellow-400 text-black"
                      : item.approvalStatus === "Approved"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {item.approvalStatus}
                </span>
              </div>
              <div className="flex justify-between mb-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Date</p>
                  <p className="font-semibold">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Category</p>
                  <p className="font-semibold">{item.category}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-sm font-medium bg-success hover:bg-success/90 text-white transition-colors"
                  onClick={() => console.log("Confirm", item.id)}
                >
                  <Check className="h-4 w-4" />
                  Confirm
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-sm font-medium bg-destructive hover:bg-destructive/90 text-white transition-colors"
                  onClick={() => console.log("Reject", item.id)}
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExecutiveAssistantDashboard;
