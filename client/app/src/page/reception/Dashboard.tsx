import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";

interface ServiceItem {
  id: string;
  employee: string;
  vehicle: string;
  date: string;
  driverStatus: "With Driver" | "Without Driver" | "Pending";
  approvalStatus: "Pending" | "Approved" | "Rejected";
}

function ReceptionDashboard() {
  const _navigate = useNavigate();
  const _handleLogout = useLogout();
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceItems] = useState<ServiceItem[]>([
    {
      id: "DV-330021",
      employee: "Raham Tresvalles",
      vehicle: "L-3000",
      date: "12-10-2025",
      driverStatus: "With Driver",
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
            Manage points, track redemptions and redeem items
          </p>
        </div>

        {/* Search + Actions Row */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex items-center flex-1 max-w-xl rounded-lg border bg-card border-border">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search Distributors....."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full h-12 text-base bg-transparent border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="px-4 py-2 rounded-md font-medium flex items-center gap-2 bg-card border border-border hover:bg-accent">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Service Vehicle Status Table */}
        <div className="border rounded-lg overflow-hidden bg-card border-border transition-colors">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold">Service Vehicle Status</h2>
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
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Vehicle
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Driver Status
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
              {serviceItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-accent transition-colors"
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4 text-sm">{item.id}</td>
                  <td className="px-6 py-4 text-sm">{item.employee}</td>
                  <td className="px-6 py-4 text-sm">{item.date}</td>
                  <td className="px-6 py-4 text-sm">{item.vehicle}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.driverStatus === "With Driver"
                          ? "bg-green-500 text-white"
                          : item.driverStatus === "Without Driver"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-400 text-black"
                      }`}
                    >
                      {item.driverStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                        item.approvalStatus === "Pending"
                          ? "bg-yellow-400 text-black"
                          : item.approvalStatus === "Approved"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.approvalStatus === "Pending" && (
                        <Clock className="h-3 w-3" />
                      )}
                      {item.approvalStatus === "Approved" && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {item.approvalStatus === "Rejected" && (
                        <XCircle className="h-3 w-3" />
                      )}
                      {item.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1 rounded-md text-sm bg-success hover:bg-success/90 text-white">
                        ✓ Confirm
                      </button>
                      <button className="px-3 py-1 rounded-md text-sm bg-destructive hover:bg-destructive/90 text-white">
                        ✗ Reject
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
          Service Vehicle Status
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
          {serviceItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border bg-card border-border"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-sm">{item.id}</p>
                  <p className="text-xs text-muted-foreground">{item.employee}</p>
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

              <p className="text-base font-semibold mb-1">{item.vehicle}</p>
              <p className="text-sm text-muted-foreground mb-3">Date: {item.date}</p>

              <div className="mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.driverStatus === "With Driver"
                      ? "bg-green-500 text-white"
                      : item.driverStatus === "Without Driver"
                      ? "bg-red-500 text-white"
                      : "bg-yellow-400 text-black"
                  }`}
                >
                  {item.driverStatus}
                </span>
              </div>

              {item.approvalStatus === "Pending" && (
                <div className="space-y-2">
                  <button
                    className="w-full py-1.5 rounded-lg bg-success text-white font-semibold hover:bg-success/90 transition-colors"
                    onClick={() => {
                      console.log("Accepted:", item.id);
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="w-full py-1.5 rounded-lg bg-destructive text-white font-semibold hover:bg-destructive/90 transition-colors"
                    onClick={() => {
                      console.log("Rejected:", item.id);
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionDashboard;
