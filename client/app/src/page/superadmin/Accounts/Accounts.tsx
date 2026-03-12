import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithCsrf } from "@/lib/csrf";
import { usersApi } from "@/lib/users-api";
import { API_URL } from "@/lib/config";
import { UserPlus } from "lucide-react";
import { useAccountsPage } from "@/hooks/queries/useAccounts";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import {
  ViewAccountModal,
  CreateAccountModal,
  EditAccountModal,
  ArchiveAccountModal,
  BulkArchiveAccountModal,
  UnarchiveAccountModal,
  ExportModal,
  SetPointsModal,
  SendPasswordResetEmailModal,
  UnlockAccountModal,
  type Account,
  type TeamOption,
} from "./modals";
import { AccountsTable, AccountsMobileCards } from "./components";
import { PointsHistoryModal } from "@/components/modals/PointsHistoryModal";

function Accounts() {
  const { username: loggedInUsername } = useAuth();
  const queryClient = useQueryClient();

  // Server-side pagination state
  const [tablePage, setTablePage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Mutation-specific state (loading spinners for mutations, form validation errors)
  const [mutationLoading, setMutationLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const { data: accountsData, isLoading: loading, isFetching: refreshing, error: queryError, refetch } = useAccountsPage(
    tablePage + 1, pageSize, searchQuery, showArchived, 10000,
  );
  const accounts = accountsData?.results ?? [];
  const totalCount = accountsData?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const error = queryError ? "Failed to load accounts" : formError;

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
    can_self_request: false,
  });

  // Team assignment for Sales Agent on creation
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Team membership for Approver on creation (which team they belong to as a member)
  const [selectedMemberTeamId, setSelectedMemberTeamId] = useState<number | null>(null);

  // Team management for edit modal
  const [selectedEditTeamId, setSelectedEditTeamId] = useState<number | null | "REMOVE">(null);

  // Team management for Approver (edit modal)
  const [approverTeamsToRemove, setApproverTeamsToRemove] = useState<number[]>([]);
  const [approverTeamToAdd, setApproverTeamToAdd] = useState<number | null>(null);

  const [editAccount, setEditAccount] = useState({
    username: "",
    full_name: "",
    email: "",
    position: "",
    points: 0,
    is_activated: true,
    can_self_request: false,
  });

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTarget, setViewTarget] = useState<Account | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Account | null>(null);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [unarchiveTarget, setUnarchiveTarget] = useState<Account | null>(null);
  const [showBulkArchiveModal, setShowBulkArchiveModal] = useState(false);
  const [bulkArchiveTargets, setBulkArchiveTargets] = useState<Account[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSetPointsModal, setShowSetPointsModal] = useState(false);
  const [showPointsHistory, setShowPointsHistory] = useState(false);
  const [pointsHistoryTarget, setPointsHistoryTarget] = useState<Account | null>(null);
  const [showSendResetEmailModal, setShowSendResetEmailModal] = useState(false);
  const [sendResetEmailTarget, setSendResetEmailTarget] = useState<Account | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<Account | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);

  const handleManualRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.accounts.all });
  }, [queryClient]);

  // Fetch teams lazily when the create or edit modal opens
  useEffect(() => {
    if ((!showCreateModal && !showEditModal) || teams.length > 0) return;
    fetch(`${API_URL}/teams/`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { id: number; name: string }[]) => {
        setTeams(data.map((t) => ({ id: t.id, name: t.name })));
      })
      .catch((err) => console.error("Error fetching teams:", err));
  }, [showCreateModal, showEditModal, teams.length]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setTablePage(0);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setTablePage(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setTablePage(0); // Reset to first page when page size changes
  }, []);

  const handleToggleArchived = useCallback((checked: boolean) => {
    setShowArchived(checked);
    setTablePage(0);
    setSearchQuery("");
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
      setFormError("All fields are required");
      return;
    }

    if (newAccount.password.length < 8) {
      setFormError("Password must be at least 8 characters long");
      return;
    }

    // Capture before reset so the background calls use the intended values
    const capturedTeamId = selectedTeamId;
    const capturedMemberTeamId = selectedMemberTeamId;
    const positionWas = newAccount.position;

    // Close modal and reset form immediately
    setShowCreateModal(false);
    const fullName = newAccount.full_name;
    setNewAccount({
      username: "",
      password: "",
      full_name: "",
      email: "",
      position: "",
      points: 0,
      is_activated: false,
      can_self_request: false,
    });
    setSelectedTeamId(null);
    setSelectedMemberTeamId(null);
    setFormError("");

    // Show optimistic success message
    toast.success(`Account for ${fullName} created successfully!`);

    // Prepare form data
    const formData = new FormData();
    Object.entries(newAccount).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    // Execute API call in background without blocking
    fetchWithCsrf(`${API_URL}/users/`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (!data.error) {
          // Assign to team if selected
          if (capturedTeamId && positionWas === "Sales Agent" && data.user?.id) {
            try {
              const teamRes = await fetchWithCsrf(
                `${API_URL}/teams/${capturedTeamId}/assign_member/`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: data.user.id }),
                },
              );
              if (!teamRes.ok) {
                const teamErr = await teamRes.json().catch(() => ({}));
                toast.warning(
                  `Account created but team assignment failed: ${
                    teamErr?.user?.[0] ||
                    teamErr?.detail ||
                    teamErr?.error ||
                    "Unknown error"
                  }`,
                );
              }
            } catch {
              toast.warning("Account created but team assignment failed.");
            }
          }

          // Assign team if Approver (manages team)
          if (capturedTeamId && positionWas === "Approver" && data.user?.id) {
            try {
              const teamRes = await fetchWithCsrf(
                `${API_URL}/teams/${capturedTeamId}/`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ approver: data.user.id }),
                },
              );
              if (!teamRes.ok) {
                const teamErr = await teamRes.json().catch(() => ({}));
                toast.warning(
                  `Account created but team assignment failed: ${
                    teamErr?.approver?.[0] ||
                    teamErr?.detail ||
                    teamErr?.error ||
                    "Unknown error"
                  }`,
                );
              }
            } catch {
              toast.warning("Account created but team assignment failed.");
            }
          }

          // Assign membership team if Approver (member of team)
          if (capturedMemberTeamId && positionWas === "Approver" && data.user?.id) {
            try {
              const memberRes = await fetchWithCsrf(
                `${API_URL}/teams/${capturedMemberTeamId}/assign_member/`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: data.user.id }),
                },
              );
              if (!memberRes.ok) {
                const memberErr = await memberRes.json().catch(() => ({}));
                toast.warning(
                  `Account created but team membership assignment failed: ${
                    memberErr?.user_id?.[0] ||
                    memberErr?.detail ||
                    memberErr?.error ||
                    "Unknown error"
                  }`,
                );
              }
            } catch {
              toast.warning("Account created but team membership assignment failed.");
            }
          }
          // Silently refresh accounts list in background
          queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
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
    queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });

    // Update the viewTarget to reflect changes in the modal
    setViewTarget(updatedAccount);
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
      can_self_request: account.can_self_request ?? false,
    });
    setSelectedEditTeamId(account.team_id ?? null);
    setApproverTeamsToRemove([]);
    setApproverTeamToAdd(null);
    setShowEditModal(true);
    setFormError("");
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
      setFormError("All fields are required");
      return;
    }

    // Capture team intent before any async work
    const oldTeamId = editingAccount.team_id ?? null;
    const capturedEditTeamId = selectedEditTeamId;
    const capturedApproverTeamsToRemove = approverTeamsToRemove;
    const capturedApproverTeamToAdd = approverTeamToAdd;

    try {
      setMutationLoading(true);

      // Prepare form data
      const formData = new FormData();
      Object.entries(editAccount).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const response = await fetchWithCsrf(`/api/users/${editingAccount.id}/`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setShowEditModal(false);
        setEditingAccount(null);
        setSelectedEditTeamId(null);
        setApproverTeamsToRemove([]);
        setApproverTeamToAdd(null);
        setFormError("");

        // Handle team changes
        if (editAccount.position === "Sales Agent") {
          const shouldRemove =
            oldTeamId != null &&
            capturedEditTeamId !== oldTeamId;
          const shouldAssign =
            typeof capturedEditTeamId === "number" &&
            capturedEditTeamId !== oldTeamId;

          if (shouldRemove) {
            try {
              await fetchWithCsrf(
                `${API_URL}/teams/${oldTeamId}/remove_member/`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: editingAccount.id }),
                },
              );
            } catch {
              toast.warning("Account updated but failed to remove from team.");
            }
          }

          if (shouldAssign) {
            try {
              const teamRes = await fetchWithCsrf(
                `${API_URL}/teams/${capturedEditTeamId}/assign_member/`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: editingAccount.id }),
                },
              );
              if (!teamRes.ok) {
                const teamErr = await teamRes.json().catch(() => ({}));
                toast.warning(
                  `Account updated but team assignment failed: ${
                    teamErr?.user_id?.[0] ??
                    teamErr?.user?.[0] ??
                    teamErr?.detail ??
                    teamErr?.error ??
                    "Unknown error"
                  }`,
                );
              }
            } catch {
              toast.warning("Account updated but team assignment failed.");
            }
          }
        }

        // Handle team changes for Approver
        if (editAccount.position === "Approver") {
          if (capturedApproverTeamsToRemove.length > 0) {
            const removalResults = await Promise.allSettled(
              capturedApproverTeamsToRemove.map((teamId) =>
                fetchWithCsrf(`${API_URL}/teams/${teamId}/`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ approver: null }),
                }),
              ),
            );
            removalResults.forEach((result) => {
              if (result.status === "rejected") {
                toast.warning("Account updated but failed to remove from a team.");
              }
            });
          }

          if (capturedApproverTeamToAdd !== null) {
            try {
              const teamRes = await fetchWithCsrf(
                `${API_URL}/teams/${capturedApproverTeamToAdd}/`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ approver: editingAccount.id }),
                },
              );
              if (!teamRes.ok) {
                const teamErr = await teamRes.json().catch(() => ({}));
                toast.warning(
                  `Account updated but team assignment failed: ${
                    teamErr?.approver?.[0] ??
                    teamErr?.detail ??
                    teamErr?.error ??
                    "Unknown error"
                  }`,
                );
              }
            } catch {
              toast.warning("Account updated but team assignment failed.");
            }
          }

          // Handle membership team changes for Approver
          const oldMemberTeamId = editingAccount.team_id ?? null;
          const shouldRemoveMembership =
            oldMemberTeamId != null &&
            capturedEditTeamId !== oldMemberTeamId;
          const shouldAssignMembership =
            typeof capturedEditTeamId === "number" &&
            capturedEditTeamId !== oldMemberTeamId;

          if (shouldRemoveMembership) {
            try {
              await fetchWithCsrf(
                `${API_URL}/teams/${oldMemberTeamId}/remove_member/`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: editingAccount.id }),
                },
              );
            } catch {
              toast.warning("Account updated but failed to remove membership from team.");
            }
          }

          if (shouldAssignMembership) {
            try {
              const memberRes = await fetchWithCsrf(
                `${API_URL}/teams/${capturedEditTeamId}/assign_member/`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: editingAccount.id }),
                },
              );
              if (!memberRes.ok) {
                const memberErr = await memberRes.json().catch(() => ({}));
                toast.warning(
                  `Account updated but team membership assignment failed: ${
                    memberErr?.user_id?.[0] ??
                    memberErr?.detail ??
                    memberErr?.error ??
                    "Unknown error"
                  }`,
                );
              }
            } catch {
              toast.warning("Account updated but team membership assignment failed.");
            }
          }
        }

        // Refresh accounts list
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      } else {
        setFormError(
          data.details?.username?.[0] ||
            data.details?.email?.[0] ||
            data.error ||
            "Failed to update account",
        );
      }
    } catch (err) {
      setFormError("Error connecting to server");
      console.error("Error updating account:", err);
    } finally {
      setMutationLoading(false);
    }
  };

  // Archive account
  const handleArchiveAccount = async (id: number) => {
    try {
      setMutationLoading(true);
      const response = await fetchWithCsrf(`/api/users/${id}/archive/`, {
        method: "POST",
      });

      if (response.ok) {
        setShowArchiveModal(false);
        setArchiveTarget(null);
        toast.success("Account archived successfully");
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      } else {
        setFormError("Failed to archive account");
      }
    } catch (err) {
      setFormError("Error connecting to server");
      console.error("Error archiving account:", err);
    } finally {
      setMutationLoading(false);
    }
  };

  // Unarchive account
  const handleUnarchiveAccount = async (id: number) => {
    try {
      setMutationLoading(true);
      const response = await fetchWithCsrf(`/api/users/${id}/unarchive/`, {
        method: "POST",
      });

      if (response.ok) {
        setShowUnarchiveModal(false);
        setUnarchiveTarget(null);
        toast.success("Account restored successfully");
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to restore account");
      }
    } catch (err) {
      console.error("Error restoring account:", err);
      toast.error("Error connecting to server");
    } finally {
      setMutationLoading(false);
    }
  };

  // Unlock locked-out account
  const handleUnlockAccount = async (id: number, password: string) => {
    setUnlockLoading(true);
    try {
      console.debug(`[Accounts] unlock_account request for id=${id}`);
      const response = await fetchWithCsrf(`${API_URL}/users/${id}/unlock_account/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      console.debug(`[Accounts] unlock_account response:`, response.status, data);
      if (response.ok) {
        toast.success(data.message || "Account unlocked successfully");
        setShowUnlockModal(false);
        setUnlockTarget(null);
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      } else {
        toast.error(data.error || "Failed to unlock account");
      }
    } catch (err) {
      console.error("[Accounts] unlock_account error:", err);
      toast.error("Error connecting to server");
    } finally {
      setUnlockLoading(false);
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
      setMutationLoading(true);

      const archiveResults = await Promise.allSettled(
        bulkArchiveTargets.map((account) =>
          fetchWithCsrf(`/api/users/${account.id}/archive/`, {
            method: "POST",
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

      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    } catch (err) {
      setFormError("Error archiving accounts");
      console.error("Error archiving accounts:", err);
      toast.error("Error archiving some accounts");
    } finally {
      setMutationLoading(false);
    }
  };

  // Handle set points submission - batch updates (only changed accounts)
  const handleSetPoints = async (updates: { id: number; points: number }[], reason: string = '') => {
    try {
      setMutationLoading(true);

      // Use batch API for efficiency
      const result = await usersApi.batchUpdatePoints(updates, reason);

      setShowSetPointsModal(false);

      if (result.failed_count === 0) {
        toast.success(`Successfully updated points for ${result.updated_count} account(s)`);
      } else {
        toast.error(`Updated ${result.updated_count} of ${updates.length} account(s). ${result.failed_count} failed.`);
      }

      // Refresh accounts list
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    } catch (err) {
      console.error("Error updating points:", err);
      toast.error("Error updating points");
    } finally {
      setMutationLoading(false);
    }
  };

  const handleBulkSetPoints = async (pointsDelta: number, password: string) => {
    try {
      setMutationLoading(true);

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
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      } else {
        toast.error(data.error || "Failed to update points");
      }
    } catch (err) {
      console.error("Error in bulk points update:", err);
      setShowSetPointsModal(false);
      toast.error("Error updating points. Please try again.");
    } finally {
      setMutationLoading(false);
    }
  };

  const handleResetAllPoints = async (password: string) => {
    try {
      setMutationLoading(true);

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
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      } else {
        toast.error(data.error || "Failed to reset points");
      }
    } catch (err) {
      console.error("Error resetting points:", err);
      setShowSetPointsModal(false);
      toast.error("Error resetting points. Please try again.");
    } finally {
      setMutationLoading(false);
    }
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:h-full md:overflow-hidden md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Accounts</h1>
            <p className="text-sm text-muted-foreground">
              View and manage user accounts.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => handleToggleArchived(e.target.checked)}
              className="rounded border-border"
            />
            Show Archived
          </label>
        </div>

        {/* Desktop Table */}
        <div className="flex-1 min-h-0">
          <AccountsTable
            key={showArchived ? "archived" : "active"}
          accounts={accounts}
          loading={loading}
          error={error}
          onRetry={() => refetch()}
          onViewAccount={(account) => {
            setViewTarget(account);
            setShowViewModal(true);
            setFormError("");
          }}
          onEditAccount={handleEditClick}
          onArchiveAccount={(account) => {
            setArchiveTarget(account);
            setShowArchiveModal(true);
            setFormError("");
          }}
          onUnarchiveAccount={(account) => {
            setUnarchiveTarget(account);
            setShowUnarchiveModal(true);
          }}
          onArchiveSelected={handleArchiveSelected}
          onCreateNew={() => setShowCreateModal(true)}
          onSetPoints={() => setShowSetPointsModal(true)}
          onRefresh={handleManualRefresh}
          refreshing={refreshing}
          onExport={() => setShowExportModal(true)}
          onViewPointsHistory={(account) => {
            setPointsHistoryTarget(account);
            setShowPointsHistory(true);
          }}
          onSendPasswordResetEmail={(account) => {
            setSendResetEmailTarget(account);
            setShowSendResetEmailModal(true);
          }}
          onUnlockAccount={(account) => {
            setUnlockTarget(account);
            setShowUnlockModal(true);
          }}
          manualPagination
          pageCount={pageCount}
          totalResults={totalCount}
          currentPage={tablePage}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          pageSize={pageSize}
          pageSizeOptions={[15, 50, 100]}
          onPageSizeChange={handlePageSizeChange}
          fillHeight
        />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col flex-1 p-4 mb-16">
        <h1 className="text-xl font-semibold mb-2">Accounts</h1>
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
          onRetry={() => refetch()}
          currentPage={tablePage + 1}
          setCurrentPage={((p: number) => setTablePage(p - 1)) as React.Dispatch<React.SetStateAction<number>>}
          onViewAccount={(account) => {
            setViewTarget(account);
            setShowViewModal(true);
          }}
          onEditAccount={handleEditClick}
          onArchiveAccount={(account) => {
            setArchiveTarget(account);
            setShowArchiveModal(true);
            setFormError("");
          }}
          onSendPasswordResetEmail={(account) => {
            setSendResetEmailTarget(account);
            setShowSendResetEmailModal(true);
          }}
          onUnlockAccount={(account) => {
            setUnlockTarget(account);
            setShowUnlockModal(true);
          }}
        />
      </div>

      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newAccount={newAccount}
        setNewAccount={setNewAccount}
        teams={teams}
        selectedTeamId={selectedTeamId}
        setSelectedTeamId={setSelectedTeamId}
        selectedMemberTeamId={selectedMemberTeamId}
        setSelectedMemberTeamId={setSelectedMemberTeamId}
        loading={loading}
        error={error}
        setError={setFormError}
        onSubmit={handleCreateAccount}
      />

      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAccount(null);
          setSelectedEditTeamId(null);
          setApproverTeamsToRemove([]);
          setApproverTeamToAdd(null);
        }}
        account={editingAccount}
        editAccount={editAccount}
        setEditAccount={setEditAccount}
        teams={teams}
        selectedEditTeamId={selectedEditTeamId}
        setSelectedEditTeamId={setSelectedEditTeamId}
        approverTeamsToRemove={approverTeamsToRemove}
        setApproverTeamsToRemove={setApproverTeamsToRemove}
        approverTeamToAdd={approverTeamToAdd}
        setApproverTeamToAdd={setApproverTeamToAdd}
        loading={loading}
        error={error}
        setError={setFormError}
        onSubmit={handleUpdateAccount}
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
        searchQuery={searchQuery}
        showArchived={showArchived}
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

      <SendPasswordResetEmailModal
        isOpen={showSendResetEmailModal}
        onClose={() => {
          setShowSendResetEmailModal(false);
          setSendResetEmailTarget(null);
        }}
        account={sendResetEmailTarget}
      />

      <UnlockAccountModal
        isOpen={showUnlockModal}
        onClose={() => {
          setShowUnlockModal(false);
          setUnlockTarget(null);
        }}
        account={unlockTarget}
        loading={unlockLoading}
        onConfirm={(id, password) => handleUnlockAccount(id, password)}
      />

    </>
  );
}

export default Accounts;
