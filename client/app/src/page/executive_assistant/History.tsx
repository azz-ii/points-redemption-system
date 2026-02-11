import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ApprovalHistoryItem {
  id: string;
  submitter: string;
  date: string;
  category: string;
  approvalStatus: "Approved" | "Rejected";
}

function ExecutiveAssistantHistory() {
  const _navigate = useNavigate();
  const _handleLogout = useLogout();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [historyItems] = useState<ApprovalHistoryItem[]>([
    {
      id: "101",
      submitter: "Celestine Quizon",
      date: "12-10-2025",
      category: "Client Meal",
      approvalStatus: "Approved",
    },
    {
      id: "102",
      submitter: "John Smith",
      date: "12-09-2025",
      category: "Travel",
      approvalStatus: "Rejected",
    },
    {
      id: "103",
      submitter: "Maria Garcia",
      date: "12-08-2025",
      category: "Equipment",
      approvalStatus: "Approved",
    },
    {
      id: "104",
      submitter: "David Lee",
      date: "12-07-2025",
      category: "Training",
      approvalStatus: "Approved",
    },
    {
      id: "105",
      submitter: "Sarah Johnson",
      date: "12-06-2025",
      category: "Conference",
      approvalStatus: "Rejected",
    },
    {
      id: "106",
      submitter: "Michael Chen",
      date: "12-05-2025",
      category: "Office Supplies",
      approvalStatus: "Approved",
    },
    {
      id: "107",
      submitter: "Emma Wilson",
      date: "12-04-2025",
      category: "Client Meal",
      approvalStatus: "Approved",
    },
  ]);

  const filteredItems = historyItems.filter(
    (item) =>
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submitter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Approval History</h1>
          <p className="text-sm text-muted-foreground">
            View all approved and rejected requests
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative flex items-center rounded-lg border bg-card border-border">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Name, or Category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full h-12 text-base bg-transparent border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* History Table */}
        <div className="border rounded-lg overflow-hidden bg-card border-border transition-colors">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold">Approval Requests</h2>
          </div>
          <table className="w-full">
            <thead className="bg-muted text-foreground">
              <tr>
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
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-accent transition-colors"
                >
                  <td className="px-6 py-4 text-sm">{item.id}</td>
                  <td className="px-6 py-4 text-sm">{item.submitter}</td>
                  <td className="px-6 py-4 text-sm">{item.date}</td>
                  <td className="px-6 py-4 text-sm">{item.category}</td>
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
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 border-t flex justify-between items-center bg-muted border-border">
            <span className="text-sm text-muted-foreground">
              Showing{" "}
              {paginatedItems.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}{" "}
              to {Math.min(currentPage * itemsPerPage, filteredItems.length)}{" "}
              of {filteredItems.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  currentPage === 1
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 text-white"
                } transition-colors`}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  currentPage === totalPages
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 text-white"
                } transition-colors`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-y-auto pb-20 p-4">
        <h2 className="text-2xl font-semibold mb-4">Approval History</h2>
        <div className="relative flex items-center rounded-lg border mb-4 bg-card border-border">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 w-full text-sm bg-transparent border-0 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3">
          {paginatedItems.map((item) => (
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
                    item.approvalStatus === "Approved"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {item.approvalStatus}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Date</p>
                  <p className="font-semibold">{item.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs text-right">Category</p>
                  <p className="font-semibold text-right">{item.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Pagination */}
        {filteredItems.length > itemsPerPage && (
          <div className="flex justify-between gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                currentPage === 1
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-white"
              } transition-colors`}
            >
              Previous
            </button>
            <span className="px-3 py-2 text-xs text-center text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                currentPage === totalPages
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-white"
              } transition-colors`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExecutiveAssistantHistory;
