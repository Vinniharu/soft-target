import { apiFetch } from "./client";

export async function getMe() {
  return apiFetch("/auth/me");
}
