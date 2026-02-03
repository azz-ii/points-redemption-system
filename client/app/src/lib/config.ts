/**
 * API Configuration
 * 
 * This file provides the API base URL configuration for the application.
 * In development (vite dev), the proxy in vite.config.ts forwards /api to localhost:8000.
 * In production builds, we use the environment variable to point directly to the backend.
 */

// Get API URL from environment variable, fallback to localhost:8000 for production
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Full API path (adds /api to the base URL)
export const API_URL = `${API_BASE_URL}/api`;
