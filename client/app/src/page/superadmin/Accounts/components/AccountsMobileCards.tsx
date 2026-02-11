import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { Eye, Ban, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Account } from "../modals";

interface AccountsMobileCardsProps {
  accounts: Account[];
  paginatedAccounts: Account[];
  filteredAccounts: Account[];
  loading: boolean;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  onViewAccount: (account: Account) => void;
  onEditAccount: (account: Account) => void;
  onBanAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
}

export function AccountsMobileCards({
  accounts,
  paginatedAccounts,
  filteredAccounts,
  loading,
  currentPage,
  setCurrentPage,
  onViewAccount,
  onEditAccount,
  onBanAccount,
  onDeleteAccount,
}: AccountsMobileCardsProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  return (
    <>
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
              className="p-4 rounded-lg border bg-card border-border transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p
                    className="text-xs font-semibold mb-2 text-muted-foreground"
                  >
                    ID {account.id ?? "N/A"}
                  </p>
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
                    Points: {account.points?.toLocaleString() ?? 0}
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
                            onBanAccount(account);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-orange-500 hover:bg-accent"
                          disabled={loading}
                        >
                          <Ban className="h-4 w-4" />
                          Ban
                        </button>
                        <button
                          onClick={() => {
                            onDeleteAccount(account);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-500 hover:bg-accent"
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
