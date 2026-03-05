import { X } from "lucide-react";
import { TeamAnalytics } from "@/components/shared/account-analytics";
import type { ModalBaseProps } from "./types";

interface AnalyticsModalProps extends ModalBaseProps {
  team: { id: number; name: string } | null;
}

export function AnalyticsModal({ isOpen, onClose, team }: AnalyticsModalProps) {
  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="analytics-team-title"
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="analytics-team-title" className="text-xl font-semibold">Team Analytics</h2>
            <p className="text-sm text-muted-foreground mt-1">{team.name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <TeamAnalytics teamId={team.id} />
        </div>
      </div>
    </div>
  );
}
