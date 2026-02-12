/**
 * API Configuration
 * 
 * This file provides the API base URL configuration for the application.
 * In development (vite dev), the proxy in vite.config.ts forwards /api to localhost:8000.
 * In production builds with IIS, we use relative paths and IIS reverse proxy handles routing.
 */

// Get API URL from environment variable
// Empty string or undefined = use relative paths (for IIS reverse proxy)
// 'http://localhost:8000' = direct connection (for local dev without vite proxy)
export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:8000';

// Full API path (adds /api to the base URL)
// If API_BASE_URL is empty, this becomes '/api' (relative path)
export const API_URL = `${API_BASE_URL}/api`;
