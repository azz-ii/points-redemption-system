import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface HistoryItem {
  id: string;
  employee: string;
  vehicle: string;
  date: string;
  driverStatus: "With Driver" | "Without Driver";
  approvalStatus: "Approved" | "Rejected";
}

function ReceptionHistory() {
  const _navigate = useNavigate();
  const _handleLogout = useLogout();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyItems] = useState<HistoryItem[]>([
    {
      id: "DV-330021",
      employee: "Raham Tresvalles",
      vehicle: "L-3000",
      date: "12-10-2025",
      driverStatus: "With Driver",
      approvalStatus: "Approved",
    },
    {
      id: "DV-330022",
      employee: "John Doe",
      vehicle: "L-3001",
      date: "12-09-2025",
      driverStatus: "Without Driver",
      approvalStatus: "Approved",
    },
    {
      id: "DV-330023",
      employee: "Jane Smith",
      vehicle: "L-3002",
      date: "12-08-2025",
      driverStatus: "With Driver",
      approvalStatus: "Rejected",
    },
  ]);

  const pageSize = 7;
  const filteredItems = historyItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(query) ||
      item.employee.toLowerCase().includes(query) ||
      item.vehicle.toLowerCase().includes(query) ||
      item.approvalStatus.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">History</h1>
          <p className="text-sm text-muted-foreground">
            View and manage the complete history of service vehicle
            requests.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative flex items-center bg-card border-border">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Employee....."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full bg-transparent border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden bg-card border-border transition-colors">
          <table className="w-full">
            <thead className="bg-muted text-foreground">
              <tr>
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
                  Status
                </th>
                {/* No per-row actions */}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-accent transition-colors"
                >
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
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.approvalStatus === "Approved"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.approvalStatus}
                    </span>
                  </td>
                  {/* No per-row actions */}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Desktop Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <button
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm font-medium">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, safePage + 1))
              }
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Employee....."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* History Cards */}
          <div className="space-y-3">
            {paginatedItems.map((item) => (
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
                      item.approvalStatus === "Approved"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.approvalStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Date</p>
                    <p className="font-semibold">{item.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Vehicle</p>
                    <p className="font-semibold">{item.vehicle}</p>
                  </div>
                </div>
                <div className="mb-3">
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
                {/* No card actions */}
              </div>
            ))}
          </div>

          {/* Mobile Pagination */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-xs font-medium">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, safePage + 1))
              }
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionHistory;
