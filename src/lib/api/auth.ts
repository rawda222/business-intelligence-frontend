"use client";

import { apiPost, apiGet } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types";

export const authApi = {
  login: (body: LoginRequest) =>
    apiPost<AuthResponse>("/auth/login", body),

  register: (body: RegisterRequest) =>
    apiPost<AuthResponse>("/auth/register", body),

  me: () => apiGet<User>("/auth/me"),
};
