import { useEffect, useRef } from "react";
import { getAuthAbortSignal } from "@/lib/fetch-interceptor";

/**
 * Automatically calls `callback` every `intervalMs` milliseconds.
 * Pauses when the browser tab is not visible and resumes when it becomes visible again.
 * Stops immediately when an auth transition aborts the shared AbortController
 * (login / logout), preventing stale polling requests from firing 401s.
 */
export function useAutoRefresh(callback: () => void, intervalMs = 10000) {
  const callbackRef = useRef(callback);

  // Keep the ref current so the interval always calls the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (id !== null) return;
      id = setInterval(() => callbackRef.current(), intervalMs);
    };

    const stop = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    // Stop polling when the auth abort signal fires (login/logout transition)
    const signal = getAuthAbortSignal();
    const handleAbort = () => stop();
    signal.addEventListener("abort", handleAbort);

    // Only start if the tab is currently visible
    if (!document.hidden) {
      start();
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
      signal.removeEventListener("abort", handleAbort);
    };
  }, [intervalMs]);
}
