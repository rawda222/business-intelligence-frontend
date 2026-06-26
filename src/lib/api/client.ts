"use client";

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { AuthResponse } from "@/types";

/**
 * Flip this to `true` to route every request to the real FastAPI backend
 * (port 8000) through the gateway via `?XTransformPort=8000`.
 * Default `false` uses the local mock API routes that faithfully implement
 * the platform schemas — so the app is fully functional out of the box.
 */
export const USE_REAL_BACKEND = false;
const BACKEND_PORT = 8000;

export const api = axios.create({
  baseURL: "/api/v1",
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

/* ----------------------------- request: JWT + port ----------------------------- */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (USE_REAL_BACKEND) {
    config.params = { ...config.params, XTransformPort: BACKEND_PORT };
  }
  return config;
});

/* ----------------------------- response: refresh on 401 ----------------------------- */
let isRefreshing = false;
let waiters: Array<(token: string | null) => void> = [];

function notifyWaiters(token: string | null) {
  waiters.forEach((cb) => cb(token));
  waiters = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    // Don't try to refresh on the auth endpoints themselves.
    const isAuthEndpoint =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/register") ||
      original?.url?.includes("/auth/refresh");

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

      if (!refreshToken) {
        clearAuth();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waiters.push((token) => {
            if (!token) return reject(error);
            original.headers!.set("Authorization", `Bearer ${token}`);
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const res = await axios.post<AuthResponse>("/api/v1/auth/refresh", {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token } = res.data;
        setTokens(access_token, refresh_token);
        notifyWaiters(access_token);
        original.headers!.set("Authorization", `Bearer ${access_token}`);
        return api(original);
      } catch (e) {
        notifyWaiters(null);
        clearAuth();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

/** Convenience helper for typed requests. */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<T>(url, config);
  return res.data;
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.post<T>(url, body, config);
  return res.data;
}
