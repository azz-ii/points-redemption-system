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
import {
  ViewAccountModal,
  CreateAccountModal,
  EditAccountModal,
  BanAccountModal,
  DeleteAccountModal,
  type Account,
} from "./modals";

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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Create new account (non-blocking)
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

    // Close modal and reset form immediately
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

    // Show optimistic success message
    setToast({
      message: `Account for ${newAccount.full_name} created successfully!`,
      type: "success",
    });

    // Execute API call in background without blocking
    fetch("http://127.0.0.1:8000/api/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAccount),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.error) {
          // Silently refresh accounts list in background
          fetchAccounts();
        } else {
          // Show error toast if creation failed
          setToast({
            message:
              data.details?.username?.[0] ||
              data.details?.email?.[0] ||
              data.error ||
              "Failed to create account",
            type: "error",
          });
        }
      })
      .catch((err) => {
        console.error("Error creating account:", err);
        setToast({
          message: "Error connecting to server",
          type: "error",
        });
      });
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

      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newAccount={newAccount}
        setNewAccount={setNewAccount}
        loading={loading}
        error={error}
        setError={setError}
        onSubmit={handleCreateAccount}
      />

      <BanAccountModal
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setBanTarget(null);
        }}
        account={banTarget}
        banReason={banReason}
        setBanReason={setBanReason}
        banMessage={banMessage}
        setBanMessage={setBanMessage}
        banDuration={banDuration}
        setBanDuration={setBanDuration}
        loading={loading}
        error={error}
        setError={setError}
        onSubmit={handleBanSubmit}
      />

      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
        editAccount={editAccount}
        setEditAccount={setEditAccount}
        loading={loading}
        error={error}
        setError={setError}
        onSubmit={handleUpdateAccount}
      />

      <ViewAccountModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewTarget(null);
        }}
        account={viewTarget}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        account={deleteTarget}
        loading={loading}
        onConfirm={(id) => handleDeleteAccount(id, true)}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animation-fade-in ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex-1">{toast.message}</div>
          <button
            onClick={() => setToast(null)}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Accounts;
