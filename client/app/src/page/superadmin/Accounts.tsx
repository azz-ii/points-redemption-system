import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Bell,
  Search,
  Sliders,
  UserPlus,
  LogOut,
  Pencil,
  Warehouse,
  Trash2,
  X,
  Eye,
  Ban,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

interface Account {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  is_activated: boolean;
  is_banned: boolean;
}

interface AccountsProps {
  onNavigate?: (
    page:
      | "dashboard"
      | "history"
      | "accounts"
      | "catalogue"
      | "redemption"
      | "inventory"
      | "distributors"
  ) => void;
  onLogout?: () => void;
}

function Accounts({ onNavigate, onLogout }: AccountsProps) {
  const { resolvedTheme } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [newAccount, setNewAccount] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    position: "",
    is_activated: false,
    is_banned: false,
  });

  const [editAccount, setEditAccount] = useState({
    username: "",
    full_name: "",
    email: "",
    position: "",
    is_activated: false,
    is_banned: false,
  });

  const [showBanModal, setShowBanModal] = useState(false);
  const [banTarget, setBanTarget] = useState<Account | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banMessage, setBanMessage] = useState("");
  const [banDuration, setBanDuration] = useState<
    "1" | "7" | "30" | "permanent"
  >("1");
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTarget, setViewTarget] = useState<Account | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Fetch accounts on component mount
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/users/");
      const data = await response.json();

      if (response.ok) {
        setAccounts(data.accounts || []);
      } else {
        setError("Failed to load accounts");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Create new account
  const handleCreateAccount = async () => {
    if (
      !newAccount.username ||
      !newAccount.password ||
      !newAccount.full_name ||
      !newAccount.email ||
      !newAccount.position
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAccount),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setNewAccount({
          username: "",
          password: "",
          full_name: "",
          email: "",
          position: "",
          is_activated: false,
          is_banned: false,
        });
        setError("");
        // Refresh accounts list
        fetchAccounts();
      } else {
        setError(
          data.details?.username?.[0] ||
            data.details?.email?.[0] ||
            data.error ||
            "Failed to create account"
        );
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error creating account:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const handleEditClick = (account: Account) => {
    setEditingAccount(account);
    setEditAccount({
      username: account.username,
      full_name: account.full_name,
      email: account.email,
      position: account.position,
      is_activated: account.is_activated,
      is_banned: account.is_banned,
    });
    setShowEditModal(true);
    setError("");
  };

  // Update account
  const handleUpdateAccount = async () => {
    if (!editingAccount) return;

    if (
      !editAccount.username ||
      !editAccount.full_name ||
      !editAccount.email ||
      !editAccount.position
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${editingAccount.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editAccount),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowEditModal(false);
        setEditingAccount(null);
        setError("");
        // Refresh accounts list
        fetchAccounts();
      } else {
        setError(
          data.details?.username?.[0] ||
            data.details?.email?.[0] ||
            data.error ||
            "Failed to update account"
        );
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error updating account:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async (id: number, skipPrompt = false) => {
    if (!skipPrompt && !confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/users/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setDeleteTarget(null);
        // Refresh accounts list
        fetchAccounts();
      } else {
        setError("Failed to delete account");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error deleting account:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open ban modal is handled inline when clicking Ban button

  // Submit ban: compute ban_date and unban_date then send update
  const handleBanSubmit = async () => {
    if (!banTarget) return;
    if (!banReason) {
      setError("Ban reason is required");
      return;
    }

    try {
      setLoading(true);

      const ban_date = new Date().toISOString();
      let unban_date: string | null = null;
      let durationValue: number | null = null;

      if (banDuration !== "permanent") {
        durationValue = parseInt(banDuration, 10);
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + durationValue);
        unban_date = d.toISOString();
      }

      const payload = {
        username: banTarget.username,
        full_name: banTarget.full_name,
        email: banTarget.email,
        position: banTarget.position,
        is_activated: banTarget.is_activated,
        is_banned: true,
        ban_reason: banReason,
        ban_message: banMessage || null,
        ban_duration: durationValue,
        ban_date,
        unban_date,
      };

      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${banTarget.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowBanModal(false);
        setBanTarget(null);
        setError("");
        fetchAccounts();
      } else {
        setError(
          data.details?.username?.[0] ||
            data.error ||
            data.detail ||
            "Failed to ban user"
        );
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error banning user:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(
    (account) =>
      account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.id.toString().includes(searchQuery) ||
      account.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / itemsPerPage)
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <Sidebar
        currentPage="accounts"
        onNavigate={onNavigate || (() => {})}
        onLogout={onLogout || (() => {})}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div
          className={`md:hidden sticky top-0 z-40 p-4 border-b flex justify-between items-center ${
            resolvedTheme === "dark"
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full ${
                resolvedTheme === "dark" ? "bg-green-600" : "bg-green-500"
              } flex items-center justify-center`}
            >
              <span className="text-white font-semibold text-xs">I</span>
            </div>
            <span className="font-medium text-sm">Welcome, Izza!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAccounts()}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
              title="Refresh Accounts"
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsNotificationOpen(true)}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => onNavigate?.("inventory")}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
            >
              <Warehouse className="h-5 w-5" />
            </button>
            <ThemeToggle />
            <button
              onClick={onLogout}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Accounts</h1>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                View and manage user accounts.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsNotificationOpen(true)}
                className={`p-2 rounded-lg ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 hover:bg-gray-800"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition-colors`}
              >
                <Bell className="h-6 w-6" />
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex justify-between items-center mb-6">
            <div
              className={`relative flex items-center ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <Search className="absolute left-3 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search by ID, Name, Email......"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 w-80 ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchAccounts()}
                title={loading ? "Refreshing..." : "Refresh"}
                disabled={loading}
                className={`p-2 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "border-gray-700 hover:bg-gray-900"
                    : "border-gray-300 hover:bg-gray-100"
                } transition-colors disabled:opacity-50`}
              >
                <RotateCw
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                className={`p-2 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "border-gray-700 hover:bg-gray-900"
                    : "border-gray-300 hover:bg-gray-100"
                } transition-colors`}
              >
                <Sliders className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  resolvedTheme === "dark"
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-gray-900 text-white hover:bg-gray-700"
                } transition-colors font-semibold`}
              >
                <UserPlus className="h-5 w-5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div
            className={`border rounded-lg overflow-hidden ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            } transition-colors`}
          >
            <table className="w-full">
              <thead
                className={`${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading && accounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading accounts...
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No accounts found
                    </td>
                  </tr>
                ) : (
                  paginatedAccounts.map((account) => (
                    <tr
                      key={account.id}
                      className={`hover:${
                        resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                      } transition-colors`}
                    >
                      <td className="px-6 py-4 text-sm">
                        {account.id ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {account.username || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {account.full_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {account.email || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-black">
                          {account.position || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {account.is_activated ? (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500 text-white">
                              Inactive
                            </span>
                          )}
                          {account.is_banned && (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white">
                              Banned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setViewTarget(account);
                              setShowViewModal(true);
                              setError("");
                            }}
                            className="px-4 py-2 rounded flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                            title="View"
                            disabled={loading}
                          >
                            <Eye className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => {
                              setBanTarget(account);
                              setBanReason("");
                              setBanMessage("");
                              setBanDuration("1");
                              setShowBanModal(true);
                              setError("");
                            }}
                            className="px-4 py-2 rounded flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                            title="Ban"
                            disabled={loading}
                          >
                            <Ban className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleEditClick(account)}
                            className="px-4 py-2 rounded flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                            title="Edit"
                            disabled={loading}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setDeleteTarget(account);
                              setShowDeleteModal(true);
                              setError("");
                            }}
                            className="px-4 py-2 rounded flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                            title="Delete"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
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
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto pb-20">
          <div className="p-4 space-y-4">
            <h2 className="text-2xl font-semibold mb-2">Accounts</h2>
            <p
              className={`text-xs mb-4 ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Manage user accounts
            </p>

            {/* Mobile Search */}
            <div className="mb-4">
              <div
                className={`relative flex items-center rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-300"
                }`}
              >
                <Search className="absolute left-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search....."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`pl-10 w-full text-sm ${
                    resolvedTheme === "dark"
                      ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                      : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Add Account Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 mb-6 ${
                resolvedTheme === "dark"
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              } transition-colors font-semibold text-sm`}
            >
              <UserPlus className="h-5 w-5" />
              <span>Add Account</span>
            </button>

            {/* Mobile Cards */}
            <div className="space-y-3">
              {loading && accounts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Loading accounts...
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No accounts found
                </div>
              ) : (
                paginatedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`p-4 rounded-lg border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-900 border-gray-700"
                        : "bg-white border-gray-200"
                    } transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p
                          className={`text-xs font-semibold mb-2 ${
                            resolvedTheme === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          ID {account.id ?? "N/A"}
                        </p>
                        <p className="font-semibold text-sm mb-1">
                          {account.full_name || "N/A"}
                        </p>
                        <p className="text-xs mb-1">
                          {account.username || "N/A"}
                        </p>
                        <p
                          className={`text-xs ${
                            resolvedTheme === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {account.email || "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-400 text-black">
                          {account.position || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {account.is_activated ? (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500 text-white">
                            Inactive
                          </span>
                        )}
                        {account.is_banned && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white">
                            Banned
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === account.id ? null : account.id
                            )
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            resolvedTheme === "dark"
                              ? "bg-gray-800 hover:bg-gray-700 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                          } transition-colors`}
                          disabled={loading}
                        >
                          Actions
                        </button>

                        {openMenuId === account.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div
                              className={`absolute right-0 top-10 z-20 w-40 rounded-lg border shadow-lg py-1 ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-900 border-gray-700"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <button
                                onClick={() => {
                                  setViewTarget(account);
                                  setShowViewModal(true);
                                  setOpenMenuId(null);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                                  resolvedTheme === "dark"
                                    ? "hover:bg-gray-800"
                                    : "hover:bg-gray-100"
                                }`}
                                disabled={loading}
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </button>
                              <button
                                onClick={() => {
                                  handleEditClick(account);
                                  setOpenMenuId(null);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                                  resolvedTheme === "dark"
                                    ? "hover:bg-gray-800"
                                    : "hover:bg-gray-100"
                                }`}
                                disabled={loading}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setBanTarget(account);
                                  setBanReason("");
                                  setBanMessage("");
                                  setBanDuration("1");
                                  setShowBanModal(true);
                                  setError("");
                                  setOpenMenuId(null);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-orange-500 ${
                                  resolvedTheme === "dark"
                                    ? "hover:bg-gray-800"
                                    : "hover:bg-gray-100"
                                }`}
                                disabled={loading}
                              >
                                <Ban className="h-4 w-4" />
                                Ban
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget(account);
                                  setShowDeleteModal(true);
                                  setError("");
                                  setOpenMenuId(null);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-500 ${
                                  resolvedTheme === "dark"
                                    ? "hover:bg-gray-800"
                                    : "hover:bg-gray-100"
                                }`}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="text-xs font-medium">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, safePage + 1))
                }
                disabled={safePage === totalPages}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentPage="accounts"
        onNavigate={onNavigate || (() => {})}
      />

      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-md w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-semibold">Create New Account</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Please fill in the details to create a new account
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError("");
                }}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Username *
                </label>
                <input
                  type="text"
                  value={newAccount.username}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, username: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Password *
                </label>
                <input
                  type="password"
                  value={newAccount.password}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, password: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newAccount.full_name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, full_name: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newAccount.email}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, email: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Position *
                </label>
                <select
                  value={newAccount.position}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, position: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                >
                  <option value="">Select position</option>
                  <option value="Sales Agent">Sales Agent</option>
                  <option value="Approver">Approver</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Reception">Reception</option>
                  <option value="Executive Assistant">
                    Executive Assistant
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                {/* `is_activated` and `is_banned` default to false; inputs removed */}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              {error && (
                <div className="w-full mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleCreateAccount}
                disabled={loading}
                className={`w-full px-4 py-2 rounded font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-white hover:bg-gray-100 text-gray-900 disabled:opacity-50"
                    : "bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
                }`}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Account Modal */}
      {showBanModal && banTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-md w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-semibold">Ban User</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Ban user {banTarget.full_name}{" "}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanTarget(null);
                  setError("");
                }}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Ban Reason *
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Reason for ban"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Ban Message
                </label>
                <textarea
                  value={banMessage}
                  onChange={(e) => setBanMessage(e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Optional message shown to user"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Ban Duration *
                </label>
                <select
                  value={banDuration}
                  onChange={(e) =>
                    setBanDuration(
                      e.target.value as "1" | "7" | "30" | "permanent"
                    )
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                >
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700">
              {error && (
                <div className="w-full mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setBanTarget(null);
                    setError("");
                  }}
                  className={`px-4 py-2 rounded font-semibold transition-colors ${
                    resolvedTheme === "dark"
                      ? "bg-white hover:bg-gray-100 text-gray-900"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </button>

                <button
                  onClick={handleBanSubmit}
                  disabled={loading}
                  className={`px-4 py-2 rounded font-semibold transition-colors ${
                    resolvedTheme === "dark"
                      ? "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                      : "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                  }`}
                >
                  {loading ? "Banning..." : "Ban User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-md w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-semibold">Edit Account</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Update account details for {editingAccount.full_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAccount(null);
                  setError("");
                }}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Username *
                </label>
                <input
                  type="text"
                  value={editAccount.username}
                  onChange={(e) =>
                    setEditAccount({ ...editAccount, username: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editAccount.full_name}
                  onChange={(e) =>
                    setEditAccount({
                      ...editAccount,
                      full_name: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editAccount.email}
                  onChange={(e) =>
                    setEditAccount({ ...editAccount, email: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  Position *
                </label>
                <select
                  value={editAccount.position}
                  onChange={(e) =>
                    setEditAccount({ ...editAccount, position: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                >
                  <option value="">Select position</option>
                  <option value="Sales Agent">Sales Agent</option>
                  <option value="Approver">Approver</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Reception">Reception</option>
                  <option value="Executive Assistant">
                    Executive Assistant
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                {/* `is_activated` and `is_banned` default to false; inputs removed */}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              {error && (
                <div className="w-full mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleUpdateAccount}
                disabled={loading}
                className={`w-full px-4 py-2 rounded font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-white hover:bg-gray-100 text-gray-900 disabled:opacity-50"
                    : "bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
                }`}
              >
                {loading ? "Updating..." : "Update Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Account Modal */}
      {showViewModal && viewTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-md w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-semibold">View Account</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Details for {viewTarget.full_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewTarget(null);
                  setError("");
                }}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="font-medium">{viewTarget.username || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-medium">{viewTarget.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{viewTarget.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Position</p>
                <p className="font-medium">{viewTarget.position || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium">
                  {viewTarget.is_activated ? "Active" : "Inactive"}
                  {viewTarget.is_banned ? " • Banned" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-md w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-semibold">Delete User</h2>
                <p className="text-xs text-gray-500 mt-1">
                  This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                  setError("");
                }}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget.full_name}</strong> (
                {deleteTarget.username})?
              </p>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                  setError("");
                }}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-white hover:bg-gray-100 text-gray-900"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  deleteTarget && handleDeleteAccount(deleteTarget.id, true)
                }
                disabled={loading}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                    : "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                }`}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;
