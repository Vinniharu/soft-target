import { apiFetch } from "./client";

export async function listUsers({ limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch(`/admin/users?${params.toString()}`);
}

export async function createUser({ email, password, name, role }) {
  return apiFetch("/admin/users", {
    method: "POST",
    body: JSON.stringify({ email, password, name, role }),
  });
}

export async function updateUser(userId, { email, password, name, role } = {}) {
  const body = {};
  if (email !== undefined) body.email = email;
  if (name !== undefined) body.name = name;
  if (password !== undefined && password !== "") body.password = password;
  if (role !== undefined) body.role = role;
  return apiFetch(`/admin/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteUser(userId) {
  return apiFetch(`/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}
