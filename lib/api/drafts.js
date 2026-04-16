import { apiFetch } from "./client";

export async function getDraft() {
  return apiFetch("/reports/draft");
}

export async function saveDraft(payload) {
  return apiFetch("/reports/draft", {
    method: "PUT",
    body: JSON.stringify({ payload }),
  });
}

export async function clearDraft() {
  return apiFetch("/reports/draft", {
    method: "DELETE",
  });
}
