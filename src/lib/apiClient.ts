/**
 * Axios-based API client for the SquintScale FastAPI backend.
 *
 * - Base URL from VITE_API_URL env var
 * - Automatically attaches the Supabase JWT as a Bearer token
 * - Handles 401 responses by signing out and redirecting to /login
 */

import axios from 'axios';
import { supabase } from './supabaseClient';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const baseURL = rawBaseUrl.replace(/\/$/, '') + '/api/v1';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach Bearer token ─────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token is invalid/expired — sign out and redirect
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
