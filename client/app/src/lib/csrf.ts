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
 * Fetch wrapper that automatically includes CSRF token for unsafe methods
 */
export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
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
  
  return fetch(url, options);
}
