import { apiFetch } from "./client";

export async function getMyOrg() {
  return apiFetch("/org/me");
}

export async function listMyOrgUsers({ limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch(`/org/users?${params.toString()}`);
}

export async function getMyOrgUser(userId) {
  return apiFetch(`/org/users/${encodeURIComponent(userId)}`);
}

export async function createMyOrgUser({ email, password, name }) {
  return apiFetch("/org/users", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export async function updateMyOrgUser(userId, { email, password, name } = {}) {
  const body = {};
  if (email !== undefined) body.email = email;
  if (name !== undefined) body.name = name;
  if (password !== undefined && password !== "") body.password = password;
  return apiFetch(`/org/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteMyOrgUser(userId) {
  return apiFetch(`/org/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}

export async function listMyOrgReports({ limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch(`/org/reports?${params.toString()}`);
}
