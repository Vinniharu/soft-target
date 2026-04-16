import { apiFetch } from "./client";

export async function listAudit({ limit = 100, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch(`/admin/audit?${params.toString()}`);
}
