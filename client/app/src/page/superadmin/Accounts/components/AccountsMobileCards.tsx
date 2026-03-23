import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { Eye, Pencil, Archive, ChevronLeft, ChevronRight, Mail, LockOpen } from "lucide-react";
import { MobileCardsSkeleton } from "@/components/shared/mobile-cards-skeleton";
import type { Account } from "../modals";

interface AccountsMobileCardsProps {
  accounts: Account[];
  paginatedAccounts: Account[];
  filteredAccounts: Account[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  onViewAccount: (account: Account) => void;
  onEditAccount: (account: Account) => void;
  onArchiveAccount: (account: Account) => void;
  onSendPasswordResetEmail?: (account: Account) => void;
  onUnlockAccount?: (account: Account) => void;
}

export function AccountsMobileCards({
  accounts,
  paginatedAccounts,
  filteredAccounts,
  loading,
  error,
  onRetry,
  currentPage,
  setCurrentPage,
  onViewAccount,
  onEditAccount,
  onArchiveAccount,
  onSendPasswordResetEmail,
  onUnlockAccount,
}: AccountsMobileCardsProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  return (
    <>
      <div className="space-y-3">
        {loading && accounts.length === 0 ? (
          <MobileCardsSkeleton count={6} showHeader={false} />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            )}
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No accounts found
          </div>
        ) : (
          paginatedAccounts.map((account) => (
            <div
              key={account.id}
              className="p-4 rounded-lg border bg-card border-border transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">
                    {account.full_name || "N/A"}
                  </p>
                  <p className="text-xs mb-1">{account.username || "N/A"}</p>
                  <p
                    className="text-xs text-muted-foreground"
                  >
                    {account.email || "N/A"}
                  </p>
                  <p className="text-xs font-semibold mt-1">
                    {account.uses_points && `Points: ${account.points?.toLocaleString() ?? 0}`}
                  </p>
                </div>
                <div className="flex flex-col gap-1 ml-2 text-right">
                  <span className="text-xs font-medium text-muted-foreground">
                    {account.position || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {account.is_archived ? (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-muted text-[color-mix(in_srgb,var(--color-muted-foreground)_70%,black)] dark:bg-muted dark:text-muted-foreground">
                      Archived
                    </span>
                  ) : (
                    <>
                      {account.is_activated ? (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-success/15 text-[color-mix(in_srgb,var(--color-success)_70%,black)] dark:bg-success/20 dark:text-success">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-destructive/15 text-[color-mix(in_srgb,var(--color-destructive)_70%,black)] dark:bg-destructive/20 dark:text-destructive-foreground">
                          Inactive
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === account.id ? null : account.id
                      )
                    }
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-accent text-foreground transition-colors"
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
                        className="absolute right-0 top-10 z-20 w-40 rounded-lg border shadow-lg py-1 bg-card border-border"
                      >
                        <button
                          onClick={() => {
                            onViewAccount(account);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent"
                          disabled={loading}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            onEditAccount(account);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent"
                          disabled={loading}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onArchiveAccount(account);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-slate-600 hover:bg-accent"
                          disabled={loading}
                        >
                          <Archive className="h-4 w-4" />
                          Archive
                        </button>
                        {onSendPasswordResetEmail && !account.is_archived && (
                          <button
                            onClick={() => {
                              onSendPasswordResetEmail(account);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-amber-600 hover:bg-accent"
                            disabled={loading}
                          >
                            <Mail className="h-4 w-4" />
                            Reset Password
                          </button>
                        )}
                        {onUnlockAccount && !account.is_archived && account.is_locked && (
                          <button
                            onClick={() => {
                              onUnlockAccount(account);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-accent"
                            disabled={loading}
                          >
                            <LockOpen className="h-4 w-4" />
                            Unlock Account
                          </button>
                        )}
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
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <span className="text-xs font-medium">
          Page {safePage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
