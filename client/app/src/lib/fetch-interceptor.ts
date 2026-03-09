/**
 * Global fetch interceptor — installed once at app startup (imported by main.tsx).
 *
 * Intercepts ALL fetch() calls (including raw fetch calls in lib/*-api.ts and
 * page components) and triggers the forced-logout flow when the server returns
 * 401 while the user is locally marked as logged-in.
 *
 * A module-level flag prevents duplicate `force-logout` events when multiple
 * concurrent requests all land with 401 at the same time.
 *
 * A login-generation counter prevents stale responses from a previous session
 * (e.g. in-flight polling requests) from triggering force-logout after a new
 * login has already completed.
 */

const AUTH_ENDPOINTS = [
  '/login',
  '/logout',
  '/otp/',
  '/activate-account',
  '/change-password',
  '/users/change_password',
  '/users/unlock_account',
];

let forceLogoutDispatched = false;

/**
 * Monotonically-incrementing counter bumped on every login/logout transition.
 * Requests capture the value at start time; if it differs when the response
 * arrives the request is stale and its 401 is ignored.
 */
let loginGeneration = 0;

/**
 * Called by AuthContext.login() after a successful login to re-arm the guard
 * and bump the generation so that in-flight requests from the old session are
 * treated as stale.
 */
export function resetForceLogoutFlag() {
  forceLogoutDispatched = false;
  loginGeneration++;
}

// ---------------------------------------------------------------------------
// Shared AbortController — lets auth transitions cancel in-flight requests
// ---------------------------------------------------------------------------
let authAbortController = new AbortController();

/** Get the current abort signal. Wire this into fetch calls that should be
 *  cancelled on login/logout (e.g. polling requests in useAutoRefresh). */
export function getAuthAbortSignal(): AbortSignal {
  return authAbortController.signal;
}

/** Abort all in-flight requests tied to the previous auth session, then
 *  create a fresh controller for the new session. */
export function abortPendingRequests() {
  authAbortController.abort();
  authAbortController = new AbortController();
  loginGeneration++;
}

const originalFetch = window.fetch.bind(window);

window.fetch = async function (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  // Snapshot the generation BEFORE the network round-trip.
  const startGeneration = loginGeneration;

  let response: Response;
  try {
    response = await originalFetch(input, init);
  } catch (err) {
    // If the request was aborted due to an auth transition, suppress the
    // error silently so it doesn't trigger unhandled-rejection noise.
    if (err instanceof DOMException && err.name === 'AbortError') {
      return new Response(null, { status: 0, statusText: 'aborted' });
    }
    throw err;
  }

  // If a login/logout transition happened while this request was in flight,
  // the response belongs to an old session — skip force-logout processing.
  if (loginGeneration !== startGeneration) return response;

  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : (input as Request).url;

  const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => url.includes(ep));
  if (isAuthEndpoint) return response;

  // Only react to 401 (unauthenticated). 403 is used for permission-denied
  // (archived accounts, role restrictions) and should NOT trigger force-logout.
  if (response.status !== 401) return response;

  const wasLoggedIn = (() => {
    try {
      return localStorage.getItem('isLoggedIn') === 'true';
    } catch {
      return false;
    }
  })();

  if (wasLoggedIn && !forceLogoutDispatched && !window.location.pathname.includes('/login')) {
    forceLogoutDispatched = true;

    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      localStorage.removeItem('position');
    } catch { /* ignore */ }

    window.dispatchEvent(new CustomEvent('force-logout'));
  }

  return response;
};
