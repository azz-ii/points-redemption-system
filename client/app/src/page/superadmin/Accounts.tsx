import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import {
  Bell,
  Search,
  Sliders,
  UserPlus,
  Home,
  LogOut,
  History as HistoryIcon,
  User,
  Pencil,
  Trash2,
  X,
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
    page: "dashboard" | "history" | "accounts" | "catalogue"
  ) => void;
  onLogout?: () => void;
}

function Accounts({ onNavigate, onLogout }: AccountsProps) {
  const { resolvedTheme } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    is_activated: true,
    is_banned: false,
  });

  const [editAccount, setEditAccount] = useState({
    username: "",
    full_name: "",
    email: "",
    position: "",
    is_activated: true,
    is_banned: false,
  });

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
    if (!newAccount.username || !newAccount.password || !newAccount.full_name || !newAccount.email || !newAccount.position) {
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
          is_activated: true,
          is_banned: false,
        });
        setError("");
        // Refresh accounts list
        fetchAccounts();
      } else {
        setError(data.details?.username?.[0] || data.details?.email?.[0] || data.error || "Failed to create account");
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
    
    if (!editAccount.username || !editAccount.full_name || !editAccount.email || !editAccount.position) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/users/${editingAccount.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editAccount),
      });

      const data = await response.json();

      if (response.ok) {
        setShowEditModal(false);
        setEditingAccount(null);
        setError("");
        // Refresh accounts list
        fetchAccounts();
      } else {
        setError(data.details?.username?.[0] || data.details?.email?.[0] || data.error || "Failed to update account");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error updating account:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/users/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
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

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(
    (account) =>
      account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.id.toString().includes(searchQuery) ||
      account.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <span className="text-sm font-medium">Izza</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
            >
              <Bell className="h-5 w-5" />
            </button>
            <ThemeToggle />
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 w-80 ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
            <div className="flex gap-2">
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
              <tbody className="divide-y divide-gray-300">
                {loading && accounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Loading accounts...
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No accounts found
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className={`hover:${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4 text-sm">{account.id}</td>
                    <td className="px-6 py-4 text-sm">{account.username}</td>
                    <td className="px-6 py-4 text-sm">{account.full_name}</td>
                    <td className="px-6 py-4 text-sm">{account.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-black">
                        {account.position}
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
                          onClick={() => handleEditClick(account)}
                          className="px-4 py-2 rounded flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                          title="Edit"
                          disabled={loading}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="text-sm">Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="px-4 py-2 rounded flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                          title="Delete"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-sm">Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24">
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
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <Search className="absolute left-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search....."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <div className="text-center text-gray-500 py-8">Loading accounts...</div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No accounts found</div>
            ) : (
              filteredAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-700"
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
                      ID {account.id}
                    </p>
                    <p className="font-semibold text-sm mb-1">
                      {account.full_name}
                    </p>
                    <p className="text-xs mb-1">{account.username}</p>
                    <p
                      className={`text-xs ${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {account.email}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-400 text-black">
                      {account.position}
                    </span>
                    {account.is_activated ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white text-center">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500 text-white text-center">
                        Inactive
                      </span>
                    )}
                    {account.is_banned && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white text-center">
                        Banned
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditClick(account)}
                    className={`p-2 rounded ${
                      resolvedTheme === "dark"
                        ? "bg-white hover:bg-gray-200"
                        : "bg-gray-100 hover:bg-gray-200"
                    } transition-colors`}
                    disabled={loading}
                  >
                    <Pencil className="h-4 w-4 text-gray-900" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAccount(account.id)}
                    className="p-2 rounded bg-red-500 hover:bg-red-600 transition-colors"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center p-4 border-t ${
          resolvedTheme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <button
          onClick={() => onNavigate && onNavigate("dashboard")}
          className="flex flex-col items-center gap-1"
        >
          <Home className="h-6 w-6" />
          <span className="text-xs">Dashboard</span>
        </button>
        <button
          onClick={() => onNavigate && onNavigate("history")}
          className="flex flex-col items-center gap-1"
        >
          <HistoryIcon className="h-6 w-6" />
          <span className="text-xs">History</span>
        </button>
        <button
          onClick={() => onNavigate && onNavigate("accounts")}
          className="flex flex-col items-center gap-1"
        >
          <User className="h-6 w-6" />
          <span className="text-xs">Accounts</span>
        </button>
        <button onClick={onLogout} className="flex flex-col items-center gap-1">
          <LogOut className="h-6 w-6" />
          <span className="text-xs">Logout</span>
        </button>
      </div>

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
                  <option value="Admin">Admin</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newAccount.is_activated}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, is_activated: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Is Activated</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newAccount.is_banned}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, is_banned: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Is Banned</span>
                </label>
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
                    setEditAccount({ ...editAccount, full_name: e.target.value })
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
                  <option value="Admin">Admin</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editAccount.is_activated}
                    onChange={(e) =>
                      setEditAccount({ ...editAccount, is_activated: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Is Activated</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editAccount.is_banned}
                    onChange={(e) =>
                      setEditAccount({ ...editAccount, is_banned: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Is Banned</span>
                </label>
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
    </div>
  );
}

export default Accounts;
