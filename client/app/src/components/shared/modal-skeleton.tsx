import { FormSkeleton } from "./form-skeleton"
import { TableSkeleton } from "./table-skeleton"

interface ModalSkeletonProps {
  showFormSection?: boolean
  formFieldCount?: number
  formColumns?: 1 | 2
  showMembersSection?: boolean
  memberRowCount?: number
}

export function ModalSkeleton({
  showFormSection = true,
  formFieldCount = 2,
  formColumns = 2,
  showMembersSection = true,
  memberRowCount = 5,
}: ModalSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Team Information Section */}
      {showFormSection && (
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <FormSkeleton fieldCount={formFieldCount} columns={formColumns} />
        </div>
      )}

      {/* Members Section */}
      {showMembersSection && (
        <div className="pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            <div className="h-8 w-28 rounded bg-muted animate-pulse" />
          </div>
          
          {/* Members Table */}
          <TableSkeleton
            rowCount={memberRowCount}
            showCheckbox={false}
            showToolbar={false}
            columnConfig={[
              { width: 150, type: "text" },     // Name
              { width: 180, type: "text" },     // Email
              { width: 80, type: "text" },      // Points
              { width: 100, align: "right", type: "actions" }, // Actions
            ]}
          />
        </div>
      )}
    </div>
  )
}
