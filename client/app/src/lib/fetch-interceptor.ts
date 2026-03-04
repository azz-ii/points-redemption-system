/**
 * Global fetch interceptor — installed once at app startup (imported by main.tsx).
 *
 * Intercepts ALL fetch() calls (including raw fetch calls in lib/*-api.ts and
 * page components) and triggers the forced-logout flow when the server returns
 * 401 or 403 while the user is locally marked as logged-in.
 *
 * A module-level flag prevents duplicate `force-logout` events when multiple
 * concurrent requests all land with 401 at the same time.
 */

const AUTH_ENDPOINTS = [
  '/login',
  '/logout',
  '/otp/',
  '/activate-account',
  '/change-password',
];

let forceLogoutDispatched = false;

/** Called by AuthContext.login() after a successful login to re-arm the guard. */
export function resetForceLogoutFlag() {
  forceLogoutDispatched = false;
}

const originalFetch = window.fetch.bind(window);

window.fetch = async function (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await originalFetch(input, init);

  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : (input as Request).url;

  const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => url.includes(ep));
  if (isAuthEndpoint) return response;

  // Only react to 401 (unauthenticated) or 403 (forbidden) responses while the
  // user is supposed to be logged in.
  const isSessionError = response.status === 401 || response.status === 403;
  if (!isSessionError) return response;

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
