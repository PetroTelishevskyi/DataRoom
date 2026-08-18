import { apiRequest } from "@/lib/api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "./auth.types";

export async function getCurrentUser() {
  const response = await apiRequest<AuthResponse>("/auth/me");

  return response.data.user;
}

export async function login(payload: LoginPayload) {
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data.user;
}

export async function register(payload: RegisterPayload) {
  const response = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data.user;
}

export async function logout() {
  await apiRequest<void>("/auth/logout", {
    method: "POST",
  });
}
