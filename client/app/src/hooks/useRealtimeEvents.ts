import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";

/**
 * SSE event types emitted by the backend.
 */
type SSEEventType =
  | "request_created"
  | "request_approved"
  | "request_rejected"
  | "request_processed"
  | "request_cancelled"
  | "request_withdrawn"
  | "items_processed"
  | "ar_uploaded";

interface SSEEvent {
  type: SSEEventType;
  timestamp: number;
  request_id?: number;
  requested_by_name?: string;
  status?: string;
  all_complete?: boolean;
}

/** Human-readable labels for toast notifications. */
const EVENT_LABELS: Record<SSEEventType, string> = {
  request_created: "New redemption request",
  request_approved: "Request approved",
  request_rejected: "Request rejected",
  request_processed: "Request processed",
  request_cancelled: "Request cancelled",
  request_withdrawn: "Request withdrawn",
  items_processed: "Items processed",
  ar_uploaded: "Acknowledgement receipt uploaded",
};

/**
 * Invalidate all request-related + dashboard queries so the UI refreshes.
 * Called on every SSE event since all event types relate to requests.
 */
function invalidateRequestQueries() {
  queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.agent });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.approver });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.marketing });
  queryClient.invalidateQueries({ queryKey: ["dashboard", "superadmin"] });
}

/**
 * Connect to the SSE endpoint and invalidate TanStack Query caches
 * whenever the server pushes a real-time event.
 *
 * Mount this once inside DashboardLayout so it's active for all
 * authenticated pages and tears down on logout / unmount.
 */
export function useRealtimeEvents() {
  const { isLoggedIn } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only connect when authenticated
    if (!isLoggedIn) return;

    const url = `${API_URL}/sse/events/`;
    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);

        // Invalidate relevant queries
        invalidateRequestQueries();

        // Show a toast notification
        const label = EVENT_LABELS[data.type] || data.type;
        const detail = data.request_id ? ` #${data.request_id}` : "";
        toast.info(`${label}${detail}`, { duration: 4000 });
      } catch {
        // Ignore malformed events
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects; nothing to do here
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [isLoggedIn]);
}
