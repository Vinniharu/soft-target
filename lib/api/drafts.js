import { apiFetch } from "./client";

export async function listDrafts({ limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch(`/reports/drafts?${params.toString()}`);
}

export async function createDraft({ title, payload } = {}) {
  const body = {};
  if (title !== undefined) body.title = title;
  if (payload !== undefined) body.payload = payload;
  return apiFetch("/reports/drafts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getDraft(draftId) {
  return apiFetch(`/reports/drafts/${encodeURIComponent(draftId)}`);
}

export async function updateDraft(draftId, { title, payload } = {}) {
  const body = {};
  if (title !== undefined) body.title = title;
  if (payload !== undefined) body.payload = payload;
  return apiFetch(`/reports/drafts/${encodeURIComponent(draftId)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteDraft(draftId) {
  return apiFetch(`/reports/drafts/${encodeURIComponent(draftId)}`, {
    method: "DELETE",
  });
}
