import { API_BASE_URL } from './config';

/**
 * Get CSRF token from cookie
 */
export function getCsrfToken(): string | null {
  const name = 'csrftoken';
  let cookieValue: string | null = null;
  
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  
  return cookieValue;
}

/**
 * Fetch wrapper that automatically includes CSRF token for unsafe methods.
 * Resolves relative URLs (e.g. /api/users/1/) against API_BASE_URL so
 * requests are routed to the Django backend in production.
 *
 * Automatically handles 401 responses by clearing auth state and redirecting
 * to the login page (session expired / kicked by new login).
 */
export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  // Resolve relative URLs against the configured API base URL
  if (url.startsWith('/')) {
    url = `${API_BASE_URL}${url}`;
  }

  const method = options.method?.toUpperCase() || 'GET';
  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (unsafeMethods.includes(method)) {
    const csrfToken = getCsrfToken();
    
    options.headers = {
      ...options.headers,
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
    };
  }
  
  // Ensure credentials are included
  options.credentials = options.credentials || 'include';
  
  const response = await fetch(url, options);
  // 401/403 handling is done globally by the fetch interceptor in
  // lib/fetch-interceptor.ts so it covers all raw fetch() calls app-wide.
  return response;
}
