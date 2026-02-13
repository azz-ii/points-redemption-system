import { Eye, Edit, ChevronLeft, ChevronRight, Archive, ArchiveRestore } from "lucide-react";
import type { Customer } from "../modals/types";

interface CustomersMobileCardsProps {
  customers: Customer[];
  paginatedCustomers: Customer[];
  filteredCustomers: Customer[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onArchive: (customer: Customer) => void;
  onUnarchive: (customer: Customer) => void;
}

export function CustomersMobileCards({
  customers,
  paginatedCustomers,
  filteredCustomers,
  loading,
  error,
  onRetry,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
}: CustomersMobileCardsProps) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Cards */}
      <div className="space-y-3">
        {loading && customers.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Loading customers...
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
              >
                Retry
              </button>
            )}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No customers found
          </div>
        ) : (
          paginatedCustomers.map((customer) => (
            <div
              key={customer.id}
              className="p-4 rounded-lg border bg-card border-border transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{customer.name}</h3>
                  <p className="text-xs text-gray-500">ID: {customer.id}</p>
                  {customer.is_archived && (
                    <span className="inline-block mt-1 px-2 py-1 rounded text-xs font-semibold bg-slate-600 text-white">
                      Archived
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {customer.points} pts
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{customer.contact_email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{customer.phone}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">{customer.location}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">
                    {formatDate(customer.date_added)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <button
                  onClick={() => onView(customer)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors bg-card hover:bg-accent"
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  View
                </button>
                {customer.is_archived ? (
                  <button
                    onClick={() => onUnarchive(customer)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors"
                  >
                    <ArchiveRestore className="h-4 w-4 inline mr-1" />
                    Restore
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(customer)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors bg-card hover:bg-accent"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => onArchive(customer)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-600 hover:bg-slate-700 text-white transition-colors"
                    >
                      <Archive className="h-4 w-4 inline mr-1" />
                      Archive
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <span className="text-xs font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
