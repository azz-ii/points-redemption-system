import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithCsrf } from "@/lib/csrf";
import { usersApi } from "@/lib/users-api";
import { API_URL } from "@/lib/config";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  ViewAccountModal,
  CreateAccountModal,
  EditAccountModal,
  BanAccountModal,
  ArchiveAccountModal,
  BulkBanAccountModal,
  BulkArchiveAccountModal,
  UnarchiveAccountModal,
  ExportModal,
  SetPointsModal,
  type Account,
} from "./modals";
import { AccountsTable, AccountsMobileCards } from "./components";
import { PointsHistoryModal } from "@/components/modals/PointsHistoryModal";

function Accounts() {
  const { updateProfilePicture, username: loggedInUsername } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Server-side pagination state
  const [tablePage, setTablePage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const PAGE_SIZE = 15;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [newAccount, setNewAccount] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    position: "",
    points: 0,
    is_activated: false,
    is_banned: false,
  });
  const [newAccountImage, setNewAccountImage] = useState<File | null>(null);
  const [newAccountImagePreview, setNewAccountImagePreview] = useState<
    string | null
  >(null);

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
  const [editAccountImagePreview, setEditAccountImagePreview] = useState<
    string | null
  >(null);

  const [showBanModal, setShowBanModal] = useState(false);
  const [banTarget, setBanTarget] = useState<Account | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banMessage, setBanMessage] = useState("");
  const [banDuration, setBanDuration] = useState<
    "1" | "7" | "30" | "permanent"
  >("1");
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTarget, setViewTarget] = useState<Account | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Account | null>(null);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [unarchiveTarget, setUnarchiveTarget] = useState<Account | null>(null);
  const [showBulkBanModal, setShowBulkBanModal] = useState(false);
  const [bulkBanTargets, setBulkBanTargets] = useState<Account[]>([]);
  const [bulkBanReason, setBulkBanReason] = useState("");
  const [bulkBanMessage, setBulkBanMessage] = useState("");
  const [bulkBanDuration, setBulkBanDuration] = useState<
    "1" | "7" | "30" | "permanent"
  >("1");
  const [showBulkArchiveModal, setShowBulkArchiveModal] = useState(false);
  const [bulkArchiveTargets, setBulkArchiveTargets] = useState<Account[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSetPointsModal, setShowSetPointsModal] = useState(false);
  const [showPointsHistory, setShowPointsHistory] = useState(false);
  const [pointsHistoryTarget, setPointsHistoryTarget] = useState<Account | null>(null);
  const [showArchived, setShowArchived] = useState(false);

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
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_URL}/users/`, window.location.origin);
      url.searchParams.append('page', String(tablePage + 1));
      url.searchParams.append('page_size', String(PAGE_SIZE));
      if (showArchived) {
        url.searchParams.append('show_archived', 'true');
      }
      if (searchQuery) {
        url.searchParams.append('search', searchQuery);
      }
      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      if (!response.ok) {
        setError("Failed to load accounts");
        return;
      }
      const data = await response.json();
      setAccounts(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
    }
  }, [tablePage, searchQuery, showArchived]);

  // Load accounts on mount and when dependencies change
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Reset to first page when showArchived changes
  useEffect(() => {
    setTablePage(0);
  }, [showArchived]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setTablePage(0);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setTablePage(page);
  }, []);

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
      points: 0,
      is_activated: false,
      is_banned: false,
    });
    setNewAccountImage(null);
    setNewAccountImagePreview(null);
    setError("");

    // Show optimistic success message
    toast.success(`Account for ${fullName} created successfully!`);

    // Prepare form data for file upload
    const formData = new FormData();
    Object.entries(newAccount).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    if (imageFile) {
      formData.append("profile_picture", imageFile);
    }

    // Execute API call in background without blocking
    fetchWithCsrf(`${API_URL}/users/`, {
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
          toast.error(
            data.details?.username?.[0] ||
              data.details?.email?.[0] ||
              data.error ||
              "Failed to create account",
          );
        }
      })
      .catch((err) => {
        console.error("Error creating account:", err);
        toast.error("Error connecting to server");
      });
  };

  // Handle account update from view modal
  const handleViewAccountUpdate = (updatedAccount: Account) => {
    // Update the account in the accounts list
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc)),
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
    toast.success("Profile picture updated successfully");
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
        formData.append("profile_picture", editAccountImage);
      }

      const response = await fetchWithCsrf(`/api/users/${editingAccount.id}/`, {
        method: "PUT",
        body: formData,
      });

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
            "Failed to update account",
        );
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error updating account:", err);
    } finally {
      setLoading(false);
    }
  };

  // Archive account
  const handleArchiveAccount = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetchWithCsrf(`/api/users/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowArchiveModal(false);
        setArchiveTarget(null);
        toast.success("Account archived successfully");
        fetchAccounts();
      } else {
        setError("Failed to archive account");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error archiving account:", err);
    } finally {
      setLoading(false);
    }
  };

  // Unarchive account
  const handleUnarchiveAccount = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetchWithCsrf(`/api/users/${id}/unarchive/`, {
        method: "POST",
      });

      if (response.ok) {
        setShowUnarchiveModal(false);
        setUnarchiveTarget(null);
        toast.success("Account restored successfully");
        fetchAccounts();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to restore account");
      }
    } catch (err) {
      console.error("Error restoring account:", err);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Archive selected accounts (bulk archive)
  const handleArchiveSelected = async (selectedAccounts: Account[]) => {
    setBulkArchiveTargets(selectedAccounts);
    setShowBulkArchiveModal(true);
  };

  // Confirm bulk archive
  const handleBulkArchiveConfirm = async () => {
    try {
      setLoading(true);

      const archiveResults = await Promise.allSettled(
        bulkArchiveTargets.map((account) =>
          fetchWithCsrf(`/api/users/${account.id}/`, {
            method: "DELETE",
          }),
        ),
      );

      const successCount = archiveResults.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failCount = archiveResults.filter(
        (r) => r.status === "rejected",
      ).length;

      setShowBulkArchiveModal(false);
      setBulkArchiveTargets([]);

      if (failCount === 0) {
        toast.success(`Successfully archived ${successCount} account(s)`);
      } else {
        toast.error(`Archived ${successCount} of ${bulkArchiveTargets.length} account(s). ${failCount} failed.`);
      }

      fetchAccounts();
    } catch (err) {
      setError("Error archiving accounts");
      console.error("Error archiving accounts:", err);
      toast.error("Error archiving some accounts");
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
        bulkBanTargets.map((account) => {
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
        }),
      );

      const successCount = banResults.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failCount = banResults.filter(
        (r) => r.status === "rejected",
      ).length;

      setShowBulkBanModal(false);
      setBulkBanTargets([]);
      setError("");

      if (failCount === 0) {
        toast.success(`Successfully banned ${successCount} account(s)`);
      } else {
        toast.error(`Banned ${successCount} of ${bulkBanTargets.length} account(s). ${failCount} failed.`);
      }

      fetchAccounts();
    } catch (err) {
      setError("Error banning accounts");
      console.error("Error banning accounts:", err);
      toast.error("Error banning some accounts");
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

      const response = await fetchWithCsrf(`/api/users/${banTarget.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
            "Failed to ban user",
        );
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error banning user:", err);
    } finally {
      setLoading(false);
    }
  };

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
      if ((prev as Record<string, any>)[field] === value) {
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

  const handleSaveInlineEdit = useCallback(
    async (accountId: number) => {
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
          toast.success("Account updated successfully");
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
          toast.error(data.error || "Failed to update account");
        }
      } catch (err) {
        console.error("Error updating account:", err);
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    },
    [editingRowId, editedData, fetchAccounts],
  );

  // Handle set points submission - batch updates (only changed accounts)
  const handleSetPoints = async (updates: { id: number; points: number }[], reason: string = '') => {
    try {
      setLoading(true);

      // Use batch API for efficiency
      const result = await usersApi.batchUpdatePoints(updates, reason);

      setShowSetPointsModal(false);

      if (result.failed_count === 0) {
        toast.success(`Successfully updated points for ${result.updated_count} account(s)`);
      } else {
        toast.error(`Updated ${result.updated_count} of ${updates.length} account(s). ${result.failed_count} failed.`);
      }

      // Refresh accounts list
      fetchAccounts();
    } catch (err) {
      console.error("Error updating points:", err);
      toast.error("Error updating points");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSetPoints = async (pointsDelta: number, password: string) => {
    try {
      setLoading(true);

      const response = await fetchWithCsrf(
        `${API_URL}/users/bulk_update_points/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            points_delta: pointsDelta,
            password: password,
          }),
        },
      );

      const data = await response.json();

      setShowSetPointsModal(false);

      if (response.ok) {
        toast.success(
          data.message ||
            `Successfully updated points for ${data.updated_count} account(s)`,
        );
        // Refresh accounts list
        fetchAccounts();
      } else {
        toast.error(data.error || "Failed to update points");
      }
    } catch (err) {
      console.error("Error in bulk points update:", err);
      setShowSetPointsModal(false);
      toast.error("Error updating points. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAllPoints = async (password: string) => {
    try {
      setLoading(true);

      const response = await fetchWithCsrf(
        `${API_URL}/users/bulk_update_points/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reset_to_zero: true,
            password: password,
          }),
        },
      );

      const data = await response.json();

      setShowSetPointsModal(false);

      if (response.ok) {
        toast.success(
          data.message ||
            `Successfully reset points for ${data.updated_count} account(s)`,
        );
        // Refresh accounts list
        fetchAccounts();
      } else {
        toast.error(data.error || "Failed to reset points");
      }
    } catch (err) {
      console.error("Error resetting points:", err);
      setShowSetPointsModal(false);
      toast.error("Error resetting points. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Accounts</h1>
            <p className="text-sm text-muted-foreground">
              View and manage user accounts.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show Archived
          </label>
        </div>

        {/* Desktop Table */}
        <AccountsTable
          accounts={accounts}
          loading={loading}
          error={error}
          onRetry={fetchAccounts}
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
          onArchiveAccount={(account) => {
            setArchiveTarget(account);
            setShowArchiveModal(true);
            setError("");
          }}
          onUnarchiveAccount={(account) => {
            setUnarchiveTarget(account);
            setShowUnarchiveModal(true);
          }}
          onArchiveSelected={handleArchiveSelected}
          onBanSelected={handleBanSelected}
          onCreateNew={() => setShowCreateModal(true)}
          onSetPoints={() => setShowSetPointsModal(true)}
          onRefresh={fetchAccounts}
          refreshing={loading}
          onExport={() => setShowExportModal(true)}
          onViewPointsHistory={(account) => {
            setPointsHistoryTarget(account);
            setShowPointsHistory(true);
          }}
          editingRowId={editingRowId}
          editedData={editedData}
          onToggleInlineEdit={handleToggleInlineEdit}
          onSaveInlineEdit={handleSaveInlineEdit}
          onCancelInlineEdit={handleCancelInlineEdit}
          onFieldChange={handleFieldChange}
          fieldErrors={fieldErrors}
          manualPagination
          pageCount={pageCount}
          totalResults={totalCount}
          currentPage={tablePage}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
        />
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col flex-1 p-4 mb-16">
        <h1 className="text-2xl font-semibold mb-2">Accounts</h1>
        <p className="text-xs text-muted-foreground mb-4">
          Manage user accounts
        </p>

        {/* Add Account Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 mb-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold text-sm"
        >
          <UserPlus className="h-5 w-5" />
          <span>Add Account</span>
        </button>

        {/* Mobile Cards */}
        <AccountsMobileCards
          accounts={accounts}
          paginatedAccounts={accounts}
          filteredAccounts={accounts}
          loading={loading}
          error={error}
          onRetry={fetchAccounts}
          currentPage={tablePage + 1}
          setCurrentPage={((p: number) => setTablePage(p - 1)) as React.Dispatch<React.SetStateAction<number>>}
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
          onArchiveAccount={(account) => {
            setArchiveTarget(account);
            setShowArchiveModal(true);
            setError("");
          }}
        />
      </div>

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

      <ArchiveAccountModal
        isOpen={showArchiveModal}
        onClose={() => {
          setShowArchiveModal(false);
          setArchiveTarget(null);
        }}
        account={archiveTarget}
        loading={loading}
        onConfirm={(id) => handleArchiveAccount(id)}
      />

      <UnarchiveAccountModal
        isOpen={showUnarchiveModal}
        onClose={() => {
          setShowUnarchiveModal(false);
          setUnarchiveTarget(null);
        }}
        account={unarchiveTarget}
        loading={loading}
        onConfirm={(id) => handleUnarchiveAccount(id)}
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

      <BulkArchiveAccountModal
        isOpen={showBulkArchiveModal}
        onClose={() => {
          setShowBulkArchiveModal(false);
          setBulkArchiveTargets([]);
        }}
        accounts={bulkArchiveTargets}
        loading={loading}
        onConfirm={handleBulkArchiveConfirm}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        accounts={accounts}
      />

      <SetPointsModal
        isOpen={showSetPointsModal}
        onClose={() => setShowSetPointsModal(false)}
        onFetchPage={usersApi.getAccountsPage}
        loading={loading}
        onSubmit={handleSetPoints}
        onBulkSubmit={handleBulkSetPoints}
        onResetAll={handleResetAllPoints}
      />

      {pointsHistoryTarget && (
        <PointsHistoryModal
          isOpen={showPointsHistory}
          onClose={() => {
            setShowPointsHistory(false);
            setPointsHistoryTarget(null);
          }}
          entityType="USER"
          entityId={pointsHistoryTarget.id}
          entityName={pointsHistoryTarget.full_name || pointsHistoryTarget.username}
        />
      )}

    </>
  );
}

export default Accounts;
