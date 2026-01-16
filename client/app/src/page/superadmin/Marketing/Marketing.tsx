import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { fetchWithCsrf } from "@/lib/csrf";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Bell,
  UserPlus,
  LogOut,
  X,
  RotateCw,
} from "lucide-react";
import {
  ViewAccountModal,
  CreateAccountModal,
  EditAccountModal,
  BanAccountModal,
  DeleteAccountModal,
  BulkBanAccountModal,
  BulkDeleteAccountModal,
  type Account,
} from "../Accounts/modals";
import { AccountsTable, AccountsMobileCards } from "../Accounts/components";

function Marketing() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [newAccount, setNewAccount] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    position: "Marketing",
    is_activated: false,
    is_banned: false,
  });

  const [editAccount, setEditAccount] = useState({
    username: "",
    full_name: "",
    email: "",
    position: "Marketing",
    points: 0,
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
  const [showBulkBanModal, setShowBulkBanModal] = useState(false);
  const [bulkBanTargets, setBulkBanTargets] = useState<Account[]>([]);
  const [bulkBanReason, setBulkBanReason] = useState("");
  const [bulkBanMessage, setBulkBanMessage] = useState("");
  const [bulkBanDuration, setBulkBanDuration] = useState<"1" | "7" | "30" | "permanent">("1");
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<Account[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch accounts - filtered for Marketing position
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/");
      const data = await response.json();

      if (response.ok) {
        const marketingUsers = (data.accounts || []).filter(
          (account: Account) => account.position === "Marketing"
        );
        setAccounts(marketingUsers);
      } else {
        setError("Failed to load marketing users");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching marketing users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleCreateAccount = async () => {
    if (
      !newAccount.username ||
      !newAccount.password ||
      !newAccount.full_name ||
      !newAccount.email
    ) {
      setError("All fields are required");
      return;
    }

    setShowCreateModal(false);
    setNewAccount({
      username: "",
      password: "",
      full_name: "",
      email: "",
      position: "Marketing",
      is_activated: false,
      is_banned: false,
    });
    setError("");

    setToast({
      message: `Marketing account for ${newAccount.full_name} created successfully!`,
      type: "success",
    });

    fetchWithCsrf("/api/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAccount),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          fetchAccounts();
        } else {
          setToast({
            message: "Failed to create marketing account",
            type: "error",
          });
        }
      })
      .catch((err) => {
        console.error("Error creating marketing account:", err);
        setToast({
          message: "Error creating marketing account",
          type: "error",
        });
      });
  };

  const handleEditClick = (account: Account) => {
    setEditingAccount(account);
    setEditAccount({
      username: account.username,
      full_name: account.full_name,
      email: account.email,
      position: account.position,
      points: account.points || 0,
      is_activated: account.is_activated,
      is_banned: account.is_banned,
    });
    setShowEditModal(true);
    setError("");
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount) return;

    if (
      !editAccount.username ||
      !editAccount.full_name ||
      !editAccount.email
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithCsrf(`/api/users/${editingAccount.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editAccount),
      });
      const data = await response.json();

      if (response.ok) {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === editingAccount.id ? { ...acc, ...data.user } : acc
          )
        );
        setShowEditModal(false);
        setEditingAccount(null);
        setError("");
        setToast({
          message: "Marketing account updated successfully!",
          type: "success",
        });
      } else {
        setError(data.error || "Failed to update marketing account");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error updating marketing account:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: number, skipPrompt = false) => {
    if (!skipPrompt && !confirm("Are you sure you want to delete this marketing user?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithCsrf(`/api/users/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAccounts((prev) => prev.filter((acc) => acc.id !== id));
        setToast({
          message: "Marketing user deleted successfully!",
          type: "success",
        });
      } else {
        setError("Failed to delete marketing user");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error deleting marketing user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async (selectedAccounts: Account[]) => {
    setBulkDeleteTargets(selectedAccounts);
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      setLoading(true);
      const deletePromises = bulkDeleteTargets.map((account) =>
        fetchWithCsrf(`/api/users/${account.id}/`, {
          method: "DELETE",
        })
      );

      await Promise.all(deletePromises);

      setAccounts((prev) =>
        prev.filter(
          (acc) => !bulkDeleteTargets.some((target) => target.id === acc.id)
        )
      );
      setShowBulkDeleteModal(false);
      setBulkDeleteTargets([]);
      setToast({
        message: `${bulkDeleteTargets.length} marketing user(s) deleted successfully!`,
        type: "success",
      });
    } catch (err) {
      setError("Error deleting marketing users");
      console.error("Error bulk deleting marketing users:", err);
      setToast({
        message: "Error deleting marketing users",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanSelected = async (selectedAccounts: Account[]) => {
    setBulkBanTargets(selectedAccounts);
    setBulkBanReason("");
    setBulkBanMessage("");
    setBulkBanDuration("1");
    setShowBulkBanModal(true);
    setError("");
  };

  const handleBulkBanConfirm = async () => {
    if (!bulkBanReason) {
      setError("Ban reason is required");
      return;
    }

    try {
      setLoading(true);
      const now = new Date();
      const banDate = now.toISOString();
      let unbanDate = null;

      if (bulkBanDuration !== "permanent") {
        const daysToAdd = parseInt(bulkBanDuration);
        const unbanDateTime = new Date(now);
        unbanDateTime.setDate(unbanDateTime.getDate() + daysToAdd);
        unbanDate = unbanDateTime.toISOString();
      }

      const banPromises = bulkBanTargets.map((account) =>
        fetchWithCsrf(`/api/users/${account.id}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_banned: true,
            ban_reason: bulkBanReason,
            ban_message: bulkBanMessage,
            ban_duration:
              bulkBanDuration === "permanent"
                ? null
                : parseInt(bulkBanDuration),
            ban_date: banDate,
            unban_date: unbanDate,
          }),
        })
      );

      await Promise.all(banPromises);

      await fetchAccounts();
      setShowBulkBanModal(false);
      setBulkBanTargets([]);
      setBulkBanReason("");
      setBulkBanMessage("");
      setBulkBanDuration("1");
      setToast({
        message: `${bulkBanTargets.length} marketing user(s) banned successfully!`,
        type: "success",
      });
    } catch (err) {
      setError("Error banning marketing users");
      console.error("Error bulk banning marketing users:", err);
      setToast({
        message: "Error banning marketing users",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanSubmit = async () => {
    if (!banTarget) return;
    if (!banReason) {
      setError("Ban reason is required");
      return;
    }

    try {
      setLoading(true);
      const now = new Date();
      const banDate = now.toISOString();
      let unbanDate = null;

      if (banDuration !== "permanent") {
        const daysToAdd = parseInt(banDuration);
        const unbanDateTime = new Date(now);
        unbanDateTime.setDate(unbanDateTime.getDate() + daysToAdd);
        unbanDate = unbanDateTime.toISOString();
      }

      const response = await fetchWithCsrf(`/api/users/${banTarget.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_banned: true,
          ban_reason: banReason,
          ban_message: banMessage,
          ban_duration: banDuration === "permanent" ? null : parseInt(banDuration),
          ban_date: banDate,
          unban_date: unbanDate,
        }),
      });

      if (response.ok) {
        await fetchAccounts();
        setShowBanModal(false);
        setBanTarget(null);
        setBanReason("");
        setBanMessage("");
        setBanDuration("1");
        setError("");
        setToast({
          message: "Marketing user banned successfully!",
          type: "success",
        });
      } else {
        setError("Failed to ban marketing user");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error banning marketing user:", err);
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  const filteredAccounts = accounts.filter(
    (account) =>
      account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.id.toString().includes(searchQuery)
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
      className={`flex flex-col h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Header */}
        <div
          className={`md:hidden sticky top-0 z-40 p-4 ${
            resolvedTheme === "dark"
              ? "bg-gray-900 border-b border-gray-700"
              : "bg-white border-b border-gray-100"
          } flex items-center justify-between`}
        >
          <img
            src="/src/assets/oracle-logo-mb.png"
            alt="Oracle Petroleum"
            className="w-8 h-auto object-contain"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="currentColor" font-size="10" font-family="sans-serif">ORACLE</text></svg>';
            }}
          />
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsNotificationOpen(true)}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "hover:bg-gray-800"
                  : "hover:bg-gray-100"
              }`}
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "hover:bg-gray-800"
                  : "hover:bg-gray-100"
              }`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Marketing Users</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setIsNotificationOpen(true)}
                className={`p-2 rounded-lg ${
                  resolvedTheme === "dark"
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-100"
                }`}
              >
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center justify-between">
              <p className="text-red-500">{error}</p>
              <button onClick={() => setError("")}>
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          )}

          <AccountsTable
            accounts={accounts}
            loading={loading}
            onViewAccount={(account) => {
              setViewTarget(account);
              setShowViewModal(true);
            }}
            onEditAccount={handleEditClick}
            onBanAccount={(account) => {
              setBanTarget(account);
              setBanReason("");
              setBanMessage("");
              setBanDuration("1");
              setShowBanModal(true);
              setError("");
            }}
            onDeleteAccount={(account) => {
              setDeleteTarget(account);
              setShowDeleteModal(true);
            }}
            onDeleteSelected={handleDeleteSelected}
            onBanSelected={handleBanSelected}
            onCreateNew={() => setShowCreateModal(true)}
            onRefresh={fetchAccounts}
            refreshing={loading}
          />
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col flex-1 p-4 mb-16">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Marketing Users</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              <UserPlus className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center justify-between">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={() => setError("")}>
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          )}

          <Input
            type="text"
            placeholder="Search marketing users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="mb-4"
          />

          <AccountsMobileCards
            accounts={accounts}
            paginatedAccounts={paginatedAccounts}
            filteredAccounts={filteredAccounts}
            loading={loading}
            resolvedTheme={resolvedTheme}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onViewAccount={(account) => {
              setViewTarget(account);
              setShowViewModal(true);
            }}
            onEditAccount={handleEditClick}
            onBanAccount={(account) => {
              setBanTarget(account);
              setBanReason("");
              setBanMessage("");
              setBanDuration("1");
              setShowBanModal(true);
              setError("");
            }}
            onDeleteAccount={(account) => {
              setDeleteTarget(account);
              setShowDeleteModal(true);
            }}
          />
        </div>
      </div>

      <MobileBottomNav />
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Modals */}
      <ViewAccountModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewTarget(null);
        }}
        account={viewTarget}
      />

      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setError("");
        }}
        newAccount={newAccount}
        setNewAccount={setNewAccount}
        onSubmit={handleCreateAccount}
        error={error}
        positionFixed="Marketing"
      />

      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAccount(null);
          setError("");
        }}
        editAccount={editAccount}
        setEditAccount={setEditAccount}
        onSubmit={handleUpdateAccount}
        loading={loading}
        error={error}
        positionFixed="Marketing"
      />

      <BanAccountModal
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setBanTarget(null);
          setBanReason("");
          setBanMessage("");
          setBanDuration("1");
          setError("");
        }}
        account={banTarget}
        banReason={banReason}
        setBanReason={setBanReason}
        banMessage={banMessage}
        setBanMessage={setBanMessage}
        banDuration={banDuration}
        setBanDuration={setBanDuration}
        onSubmit={handleBanSubmit}
        loading={loading}
        error={error}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        account={deleteTarget}
        onConfirm={() => {
          if (deleteTarget) {
            handleDeleteAccount(deleteTarget.id, true);
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }
        }}
        loading={loading}
      />

      <BulkBanAccountModal
        isOpen={showBulkBanModal}
        onClose={() => {
          setShowBulkBanModal(false);
          setBulkBanTargets([]);
          setBulkBanReason("");
          setBulkBanMessage("");
          setBulkBanDuration("1");
          setError("");
        }}
        accounts={bulkBanTargets}
        banReason={bulkBanReason}
        setBanReason={setBulkBanReason}
        banMessage={bulkBanMessage}
        setBanMessage={setBulkBanMessage}
        banDuration={bulkBanDuration}
        setBanDuration={setBulkBanDuration}
        onSubmit={handleBulkBanConfirm}
        loading={loading}
        error={error}
      />

      <BulkDeleteAccountModal
        isOpen={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
          setBulkDeleteTargets([]);
        }}
        accounts={bulkDeleteTargets}
        onConfirm={handleBulkDeleteConfirm}
        loading={loading}
      />
    </div>
  );
}

export default Marketing;
