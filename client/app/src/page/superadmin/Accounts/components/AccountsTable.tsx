import type { Dispatch, SetStateAction } from "react";
import { Eye, Ban, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Account } from "../modals";

interface AccountsTableProps {
  accounts: Account[];
  paginatedAccounts: Account[];
  filteredAccounts: Account[];
  loading: boolean;
  resolvedTheme: string | undefined;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  onViewAccount: (account: Account) => void;
  onEditAccount: (account: Account) => void;
  onBanAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
}

export function AccountsTable({
  accounts,
  paginatedAccounts,
  filteredAccounts,
  loading,
  resolvedTheme,
  currentPage,
  setCurrentPage,
  onViewAccount,
  onEditAccount,
  onBanAccount,
  onDeleteAccount,
}: AccountsTableProps) {
  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  return (
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
            <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Username</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Full Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Position</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
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
            paginatedAccounts.map((account) => (
              <tr
                key={account.id}
                className={`hover:${
                  resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                } transition-colors`}
              >
                <td className="px-6 py-4 text-sm">{account.id ?? "N/A"}</td>
                <td className="px-6 py-4 text-sm">{account.username || "N/A"}</td>
                <td className="px-6 py-4 text-sm">{account.full_name || "N/A"}</td>
                <td className="px-6 py-4 text-sm">{account.email || "N/A"}</td>
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
                      onClick={() => onViewAccount(account)}
                      className="px-4 py-2 rounded flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                      title="View"
                      disabled={loading}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onBanAccount(account)}
                      className="px-4 py-2 rounded flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                      title="Ban"
                      disabled={loading}
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditAccount(account)}
                      className="px-4 py-2 rounded flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                      title="Edit"
                      disabled={loading}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAccount(account)}
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
          onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
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
  );
}
