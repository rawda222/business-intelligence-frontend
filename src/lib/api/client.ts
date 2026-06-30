"use client";

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { AuthResponse } from "@/types";

// ✅ Always use real backend
export const USE_REAL_BACKEND = true;

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  timeout: 120_000, // 2 minutes for Gemini
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const isAuthEndpoint =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/register") ||
      original?.url?.includes("/auth/refresh");

    // ✅ Don't trigger infinite refresh loop
    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      const { refreshToken, clearAuth, setTokens } = useAuthStore.getState();

      if (!refreshToken) {
        clearAuth();
        return Promise.reject(error);
      }

      original._retry = true;
      try {
        const res = await axios.post<AuthResponse>(
          "http://localhost:8000/api/v1/auth/refresh",
          { refresh_token: refreshToken }
        );
        setTokens(res.data.access_token, res.data.refresh_token);
        original.headers!.set("Authorization", `Bearer ${res.data.access_token}`);
        return api(original);
      } catch (e) {
        clearAuth();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<T>(url, config);
  return res.data;
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.post<T>(url, body, config);
  return res.data;
}