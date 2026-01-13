import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import type { Customer } from "../modals/types";

interface CustomersMobileCardsProps {
  paginatedCustomers: Customer[];
  filteredCustomers: Customer[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomersMobileCards({
  paginatedCustomers,
  filteredCustomers,
  loading,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: CustomersMobileCardsProps) {
  const { resolvedTheme } = useTheme();

  const formatDate = (dateString: string) => {
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
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No customers found
          </div>
        ) : (
          paginatedCustomers.map((customer) => (
            <div
              key={customer.id}
              className={`p-4 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              } transition-colors`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{customer.name}</h3>
                  <p className="text-xs text-gray-500">ID: {customer.id}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    resolvedTheme === "dark"
                      ? "bg-blue-900 text-blue-300"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
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
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  View
                </button>
                <button
                  onClick={() => onEdit(customer)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <Edit className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(customer)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <Trash2 className="h-4 w-4 inline mr-1" />
                  Delete
                </button>
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
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
            resolvedTheme === "dark"
              ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
              : "bg-white border border-gray-300 hover:bg-gray-100"
          }`}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <span className="text-xs font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
            resolvedTheme === "dark"
              ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
              : "bg-white border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
