# Backend changes — User self-edit for reports

The frontend now lets a report's **creator** edit their own report. Delete remains admin-only. This document describes the single new backend endpoint required, plus the authorization rules that need to hold.

The frontend already calls this endpoint — currently it returns `405 Method Not Allowed` because the route doesn't exist yet.

---

## 1. New endpoint

### `PATCH /api/v1/reports/{id}`

Update a report **owned by the calling user**. Mirrors the existing `PATCH /api/v1/admin/reports/{id}` exactly in request and response shape — only the authorization rule differs.

**Auth**: Bearer token (any authenticated user).

**Path params**

| Name | Type | Description |
|---|---|---|
| `id` | UUID | Report ID |

**Request body** (same shape as the admin PATCH; both fields optional, at least one required)

```json
{
  "case_id": "CASE-2026-0042",
  "payload": {
    "primary_target": { /* … */ },
    "soft_targets":   [ /* … */ ],
    "summary": "…"
  }
}
```

**Response 200** — the updated report, same shape as `GET /reports/{id}` (including the `creator` block and the new `version` number). Saving must increment `version` and update `updated_at`, exactly as the admin PATCH does today.

**Errors**

| Status | When |
|---|---|
| `400` | Invalid body (validation) |
| `401` | Missing / expired token |
| `403` | Caller is authenticated but is **not** the creator of the report (`report.user_id != caller.id`) and is not an admin |
| `404` | Report not found (or soft-deleted) |
| `409` | Optional — `case_id` collision, if the admin endpoint already returns this |
| `429` | Rate limited |

**Authorization rule**

```
allow if  caller.role == "admin"
       or report.user_id == caller.id
deny  otherwise → 403
```

Admins should also be able to hit this endpoint successfully (it's a strict superset of the owner case). Non-creators who are not admin must get `403`, **not** `404` — the frontend uses the 403 to show "You can only edit your own reports."

**Audit log**

Emit a `report.update` audit entry just like `PATCH /admin/reports/{id}` does. Include `actor_id`, `report_id`, and the new `version`. If you currently distinguish admin vs. owner edits in the audit metadata, add a flag (e.g. `via: "owner" | "admin"`) — otherwise a single `report.update` action is fine.

---

## 2. What is **not** changing

- `PATCH /api/v1/admin/reports/{id}` — keep as-is. Admin-only path stays for cross-user edits.
- `DELETE /api/v1/admin/reports/{id}` — **delete remains admin-only.** Do **not** add `DELETE /api/v1/reports/{id}`.
- `POST /api/v1/reports` — unchanged. Owner is set from the caller's JWT as today.
- `GET /api/v1/reports/{id}` — unchanged. Any authenticated user can read any report (the frontend's read-only view across operators relies on this).
- The `creator: { id, name, email }` block on report responses — already implemented and used by the frontend.

---

## 3. Implementation checklist

- [ ] Add route handler for `PATCH /api/v1/reports/{id}`.
- [ ] Reuse the existing admin PATCH handler logic (validation, version bump, `updated_at`, audit, response serialization). The only difference is the authorization check.
- [ ] Authorization: load the report, return `404` if missing/soft-deleted, return `403` if `caller.role != "admin"` and `report.user_id != caller.id`.
- [ ] Audit log entry for owner edits (action `report.update`).
- [ ] Apply the same rate limit as the admin PATCH endpoint.
- [ ] OpenAPI / `API.md` — add the new endpoint under "Reports" alongside `POST /reports` and `GET /reports/{id}`.

---

## 4. Smoke test

1. As a normal user, `PATCH /api/v1/reports/{ownReportId}` with a changed `summary` → `200`, response shows incremented `version`.
2. As a normal user, `PATCH /api/v1/reports/{otherUsersReportId}` → `403`.
3. As an admin, `PATCH /api/v1/reports/{anyReportId}` → `200` (admin can edit anything).
4. Without a token, `PATCH /api/v1/reports/{id}` → `401`.
5. `PATCH /api/v1/reports/{nonexistent}` → `404`.
6. Audit log shows a `report.update` row for each successful edit, with the correct `actor_id`.
7. After a successful owner edit, `GET /api/v1/reports/{id}` reflects the new `version`, `updated_at`, and `payload`.

---

## 5. Frontend wiring (for reference, no action needed)

The frontend already calls the new endpoint via `lib/api/reports.js`:

```js
export async function updateMyReport(reportId, { case_id, payload }) {
  return apiFetch(`/reports/${encodeURIComponent(reportId)}`, {
    method: "PATCH",
    body: JSON.stringify({ case_id, payload }),
  });
}
```

It maps to `${API_BASE}/api/v1/reports/{id}`. The 403 path is handled with a toast and a redirect to the read-only view.
