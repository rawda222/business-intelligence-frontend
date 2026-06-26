"use client";

import { create } from "zustand";

/**
 * Client-side SPA router. The platform exposes only the `/` route to users,
 * so navigation between dashboard / businesses / reports / settings is handled
 * in-memory with a back stack.
 */
export type ViewName =
  | "dashboard"
  | "businesses"
  | "business-detail"
  | "upload"
  | "swot"
  | "strategy"
  | "campaigns"
  | "history"
  | "settings";

export interface Route {
  view: ViewName;
  /** business context for detail/report views */
  businessId?: string;
  /** optional preselection (e.g. upload target) */
  preset?: string;
}

interface UiState {
  route: Route;
  history: Route[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navigate: (route: Route) => void;
  back: () => void;
  canGoBack: () => boolean;
}

const DEFAULT_ROUTE: Route = { view: "dashboard" };

export const useUiStore = create<UiState>((set, get) => ({
  route: DEFAULT_ROUTE,
  history: [],
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  navigate: (route) =>
    set((state) => ({
      history: [...state.history, state.route],
      route,
      sidebarOpen: false,
    })),
  back: () =>
    set((state) => {
      if (state.history.length === 0) return state;
      const history = [...state.history];
      const route = history.pop()!;
      return { history, route, sidebarOpen: false };
    }),
  canGoBack: () => get().history.length > 0,
}));
