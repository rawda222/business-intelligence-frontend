"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthResponse, User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (res: AuthResponse) => void;
  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (res) =>
        set({
          user: res.user,
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          isAuthenticated: true,
        }),
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "bip-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
