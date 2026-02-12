import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Distributor } from "../modals/types";

interface DistributorsMobileCardsProps {
  paginatedDistributors: Distributor[];
  filteredDistributors: Distributor[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (distributor: Distributor) => void;
  onEdit: (distributor: Distributor) => void;
  onDelete: (distributor: Distributor) => void;
}

export function DistributorsMobileCards({
  paginatedDistributors,
  filteredDistributors,
  loading,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: DistributorsMobileCardsProps) {
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
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            Loading distributors...
          </div>
        ) : filteredDistributors.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No distributors found
          </div>
        ) : (
          paginatedDistributors.map((distributor) => (
            <div
              key={distributor.id}
              className="p-4 rounded-lg border bg-card border-border transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{distributor.name}</h3>
                  <p className="text-xs text-gray-500">ID: {distributor.id}</p>
                </div>
                <span className="text-sm font-medium">
                  {distributor.points} pts
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{distributor.contact_email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{distributor.phone}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">{distributor.location}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Region:</span>
                  <span className="font-medium">{distributor.region}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">
                    {formatDate(distributor.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <button
                  onClick={() => onView(distributor)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors bg-card hover:bg-accent"
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  View
                </button>
                <button
                  onClick={() => onEdit(distributor)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors bg-card hover:bg-accent"
                >
                  <Edit className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(distributor)}
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
