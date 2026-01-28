import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout, useAuth } from "@/context/AuthContext";
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
  Warehouse,
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
  ExportModal,
  SetPointsModal,
  type Account,
} from "./modals";
import { AccountsTable, AccountsMobileCards } from "./components";

function Accounts() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { updateProfilePicture, username: loggedInUsername } = useAuth();
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
    position: "",
    is_activated: false,
    is_banned: false,
  });
  const [newAccountImage, setNewAccountImage] = useState<File | null>(null);
  const [newAccountImagePreview, setNewAccountImagePreview] = useState<string | null>(null);

  const [editAccount, setEditAccount] = useState({
    username: "",
    full_name: "",
    email: "",
    position: "",
    points: 0,
    is_activated: false,
    is_banned: false,
  });
  const [editAccountImage, setEditAccountImage] = useState<File | null>(null);
  const [editAccountImagePreview, setEditAccountImagePreview] = useState<string | null>(null);

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
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSetPointsModal, setShowSetPointsModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Inline edit state
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<Account>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Image handling helpers
  const handleNewAccountImageSelect = (file: File | null) => {
    setNewAccountImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAccountImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewAccountImageRemove = () => {
    setNewAccountImage(null);
    setNewAccountImagePreview(null);
  };

  const handleEditAccountImageSelect = (file: File | null) => {
    setEditAccountImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAccountImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditAccountImageRemove = () => {
    setEditAccountImage(null);
    setEditAccountImagePreview(null);
  };

  // Fetch accounts on component mount
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/");
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
    const fullName = newAccount.full_name;
    const imageFile = newAccountImage;
    setNewAccount({
      username: "",
      password: "",
      full_name: "",
      email: "",
      position: "",
      is_activated: false,
      is_banned: false,
    });
    setNewAccountImage(null);
    setNewAccountImagePreview(null);
    setError("");

    // Show optimistic success message
    setToast({
      message: `Account for ${fullName} created successfully!`,
      type: "success",
    });

    // Prepare form data for file upload
    const formData = new FormData();
    Object.entries(newAccount).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    if (imageFile) {
      formData.append('profile_picture', imageFile);
    }

    // Execute API call in background without blocking
    fetchWithCsrf("/api/users/", {
      method: "POST",
      body: formData,
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

  // Handle account update from view modal
  const handleViewAccountUpdate = (updatedAccount: Account) => {
    // Update the account in the accounts list
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );

    // If the updated account is the logged-in user, update sidebar profile picture
    if (loggedInUsername && updatedAccount.username === loggedInUsername) {
      if (updatedAccount.profile_picture) {
        updateProfilePicture(updatedAccount.profile_picture);
      }
    }

    // Update the viewTarget to reflect changes in the modal
    setViewTarget(updatedAccount);

    // Show success toast
    setToast({
      message: "Profile picture updated successfully",
      type: "success",
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
      points: account.points || 0,
      is_activated: account.is_activated,
      is_banned: account.is_banned,
    });
    setEditAccountImage(null);
    setEditAccountImagePreview(null);
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
      
      // Prepare form data for file upload
      const formData = new FormData();
      Object.entries(editAccount).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (editAccountImage) {
        formData.append('profile_picture', editAccountImage);
      }
      
      const response = await fetchWithCsrf(
        `/api/users/${editingAccount.id}/`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        // If the updated account is the logged-in user, update profile picture in localStorage
        if (data.user?.username === loggedInUsername) {
          const updatedProfilePicture = data.user.profile_picture || null;
          updateProfilePicture(updatedProfilePicture);
        }
        
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
      const response = await fetchWithCsrf(`/api/users/${id}/`, {
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

  // Delete selected accounts (bulk delete)
  const handleDeleteSelected = async (selectedAccounts: Account[]) => {
    setBulkDeleteTargets(selectedAccounts);
    setShowBulkDeleteModal(true);
  };

  // Confirm bulk delete
  const handleBulkDeleteConfirm = async () => {
    try {
      setLoading(true);
      
      // Delete all selected accounts
      const deleteResults = await Promise.allSettled(
        bulkDeleteTargets.map(account =>
          fetchWithCsrf(`/api/users/${account.id}/`, {
            method: "DELETE",
          })
        )
      );

      const successCount = deleteResults.filter(r => r.status === "fulfilled").length;
      const failCount = deleteResults.filter(r => r.status === "rejected").length;
      
      setShowBulkDeleteModal(false);
      setBulkDeleteTargets([]);
      
      if (failCount === 0) {
        setToast({
          message: `Successfully deleted ${successCount} account(s)`,
          type: "success",
        });
      } else {
        setToast({
          message: `Deleted ${successCount} of ${bulkDeleteTargets.length} account(s). ${failCount} failed.`,
          type: "error",
        });
      }
      
      // Refresh accounts list
      fetchAccounts();
    } catch (err) {
      setError("Error deleting accounts");
      console.error("Error deleting accounts:", err);
      setToast({
        message: "Error deleting some accounts",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Ban selected accounts (bulk ban)
  const handleBanSelected = async (selectedAccounts: Account[]) => {
    setBulkBanTargets(selectedAccounts);
    setBulkBanReason("");
    setBulkBanMessage("");
    setBulkBanDuration("1");
    setShowBulkBanModal(true);
    setError("");
  };

  // Confirm bulk ban
  const handleBulkBanConfirm = async () => {
    if (!bulkBanReason) {
      setError("Ban reason is required");
      return;
    }

    try {
      setLoading(true);

      const ban_date = new Date().toISOString();
      let unban_date: string | null = null;
      let durationValue: number | null = null;

      if (bulkBanDuration !== "permanent") {
        durationValue = parseInt(bulkBanDuration, 10);
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + durationValue);
        unban_date = d.toISOString();
      }

      // Ban all selected accounts
      const banResults = await Promise.allSettled(
        bulkBanTargets.map(account => {
          const payload = {
            username: account.username,
            full_name: account.full_name,
            email: account.email,
            position: account.position,
            is_activated: account.is_activated,
            is_banned: true,
            ban_reason: bulkBanReason,
            ban_message: bulkBanMessage || null,
            ban_duration: durationValue,
            ban_date,
            unban_date,
          };

          return fetchWithCsrf(`/api/users/${account.id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        })
      );

      const successCount = banResults.filter(r => r.status === "fulfilled").length;
      const failCount = banResults.filter(r => r.status === "rejected").length;

      setShowBulkBanModal(false);
      setBulkBanTargets([]);
      setError("");

      if (failCount === 0) {
        setToast({
          message: `Successfully banned ${successCount} account(s)`,
          type: "success",
        });
      } else {
        setToast({
          message: `Banned ${successCount} of ${bulkBanTargets.length} account(s). ${failCount} failed.`,
          type: "error",
        });
      }

      fetchAccounts();
    } catch (err) {
      setError("Error banning accounts");
      console.error("Error banning accounts:", err);
      setToast({
        message: "Error banning some accounts",
        type: "error",
      });
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

      const response = await fetchWithCsrf(
        `/api/users/${banTarget.id}/`,
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

  // Mobile pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Inline edit handlers
  const handleToggleInlineEdit = useCallback((account: Account) => {
    setEditingRowId(account.id);
    setEditedData({
      username: account.username,
      full_name: account.full_name,
      email: account.email,
      position: account.position,
      points: account.points,
    });
    setFieldErrors({});
  }, []);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setEditedData((prev) => {
      // Only update if value actually changed
      if (prev[field] === value) {
        return prev;
      }
      return { ...prev, [field]: value };
    });
    // Clear field error when user starts typing
    setFieldErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []); // No dependencies needed since we use functional setState

  const handleCancelInlineEdit = useCallback(() => {
    setEditingRowId(null);
    setEditedData({});
    setFieldErrors({});
  }, []);

  const handleSaveInlineEdit = useCallback(async (accountId: number) => {
    if (!editingRowId) return;

    // Validate fields
    const errors: Record<string, string> = {};
    
    if (!editedData.username?.trim()) {
      errors.username = "Username is required";
    }
    if (!editedData.full_name?.trim()) {
      errors.full_name = "Full name is required";
    }
    if (!editedData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedData.email)) {
      errors.email = "Invalid email format";
    }
    if (!editedData.position?.trim()) {
      errors.position = "Position is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithCsrf(`/api/users/${accountId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedData),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          message: "Account updated successfully",
          type: "success",
        });
        setEditingRowId(null);
        setEditedData({});
        setFieldErrors({});
        // Refresh accounts list
        fetchAccounts();
      } else {
        // Handle server-side validation errors
        const serverErrors: Record<string, string> = {};
        if (data.details) {
          Object.keys(data.details).forEach((key) => {
            serverErrors[key] = data.details[key][0];
          });
        }
        setFieldErrors(serverErrors);
        setToast({
          message: data.error || "Failed to update account",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Error updating account:", err);
      setToast({
        message: "Error connecting to server",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [editingRowId, editedData, fetchAccounts]);

  // Handle set points submission
  const handleSetPoints = async (updates: { id: number; points: number }[]) => {
    try {
      setLoading(true);
      
      // Update points for all users
      const updateResults = await Promise.allSettled(
        updates.map(update =>
          fetchWithCsrf(`/api/users/${update.id}/`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ points: update.points }),
          })
        )
      );

      const successCount = updateResults.filter(r => r.status === "fulfilled").length;
      const failCount = updateResults.filter(r => r.status === "rejected").length;
      
      setShowSetPointsModal(false);
      
      if (failCount === 0) {
        setToast({
          message: `Successfully updated points for ${successCount} account(s)`,
          type: "success",
        });
      } else {
        setToast({
          message: `Updated ${successCount} of ${updates.length} account(s). ${failCount} failed.`,
          type: "error",
        });
      }
      
      // Refresh accounts list
      fetchAccounts();
    } catch (err) {
      console.error("Error updating points:", err);
      setToast({
        message: "Error updating points",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSetPoints = async (pointsDelta: number, password: string) => {
    try {
      setLoading(true);
      
      const response = await fetchWithCsrf("/api/users/bulk_update_points/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          points_delta: pointsDelta,
          password: password,
        }),
      });

      const data = await response.json();

      setShowSetPointsModal(false);

      if (response.ok) {
        setToast({
          message: data.message || `Successfully updated points for ${data.updated_count} account(s)`,
          type: "success",
        });
        // Refresh accounts list
        fetchAccounts();
      } else {
        setToast({
          message: data.error || "Failed to update points",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Error in bulk points update:", err);
      setShowSetPointsModal(false);
      setToast({
        message: "Error updating points. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAllPoints = async (password: string) => {
    try {
      setLoading(true);
      
      const response = await fetchWithCsrf("/api/users/bulk_update_points/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reset_to_zero: true,
          password: password,
        }),
      });

      const data = await response.json();

      setShowSetPointsModal(false);

      if (response.ok) {
        setToast({
          message: data.message || `Successfully reset points for ${data.updated_count} account(s)`,
          type: "success",
        });
        // Refresh accounts list
        fetchAccounts();
      } else {
        setToast({
          message: data.error || "Failed to reset points",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Error resetting points:", err);
      setShowSetPointsModal(false);
      setToast({
        message: "Error resetting points. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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
      <Sidebar />

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
              onClick={() => navigate("/admin/inventory")}
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
              onClick={handleLogout}
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



          {/* Table */}
          <AccountsTable
            accounts={accounts}
            loading={loading}
            onViewAccount={(account) => {
              setViewTarget(account);
              setShowViewModal(true);
              setError("");
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
              setError("");
            }}
            onDeleteSelected={handleDeleteSelected}
            onBanSelected={handleBanSelected}
            onCreateNew={() => setShowCreateModal(true)}
            onSetPoints={() => setShowSetPointsModal(true)}
            onRefresh={fetchAccounts}
            refreshing={loading}
            onExport={() => setShowExportModal(true)}
            editingRowId={editingRowId}
            editedData={editedData}
            onToggleInlineEdit={handleToggleInlineEdit}
            onSaveInlineEdit={handleSaveInlineEdit}
            onCancelInlineEdit={handleCancelInlineEdit}
            onFieldChange={handleFieldChange}
            fieldErrors={fieldErrors}
          />
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
                setError("");
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

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
        profileImage={newAccountImage}
        profileImagePreview={newAccountImagePreview}
        onImageSelect={handleNewAccountImageSelect}
        onImageRemove={handleNewAccountImageRemove}
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
        profileImage={editAccountImage}
        profileImagePreview={editAccountImagePreview}
        onImageSelect={handleEditAccountImageSelect}
        onImageRemove={handleEditAccountImageRemove}
      />

      <ViewAccountModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewTarget(null);
        }}
        account={viewTarget}
        onAccountUpdate={handleViewAccountUpdate}
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

      <BulkBanAccountModal
        isOpen={showBulkBanModal}
        onClose={() => {
          setShowBulkBanModal(false);
          setBulkBanTargets([]);
        }}
        accounts={bulkBanTargets}
        banReason={bulkBanReason}
        setBanReason={setBulkBanReason}
        banMessage={bulkBanMessage}
        setBanMessage={setBulkBanMessage}
        banDuration={bulkBanDuration}
        setBanDuration={setBulkBanDuration}
        loading={loading}
        error={error}
        setError={setError}
        onSubmit={handleBulkBanConfirm}
      />

      <BulkDeleteAccountModal
        isOpen={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
          setBulkDeleteTargets([]);
        }}
        accounts={bulkDeleteTargets}
        loading={loading}
        onConfirm={handleBulkDeleteConfirm}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        accounts={accounts}
      />

      <SetPointsModal
        isOpen={showSetPointsModal}
        onClose={() => setShowSetPointsModal(false)}
        accounts={accounts}
        loading={loading}
        onSubmit={handleSetPoints}
        onBulkSubmit={handleBulkSetPoints}
        onResetAll={handleResetAllPoints}
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
