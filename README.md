# Soft Target

Soft Target is the Next.js frontend for an internal investigation documentation system. Authorized operators sign in, create and manage structured investigation reports (with primary and soft targets), preview them as A4 documents, and export pixel-perfect PDFs — either from the server (canonical, versioned) or locally via html-to-image + jsPDF.

Admins additionally manage user accounts and review a system-wide audit log.

**This is an internal tool.** There is no public signup and no public-facing marketing surface — the root route redirects straight to the login terminal.

---

## Tech Stack

- **Next.js 16** (App Router) with **React 19**
- **Tailwind CSS v4** (design tokens in `app/globals.css` via `@theme`)
- **react-hook-form** (`useForm`, `useFieldArray`) for form state
- **html-to-image** + **jsPDF** for client-side document export
- **lucide-react** for icons
- **JWT bearer + refresh token rotation** for authentication
- No UI framework — primitives live in `components/ui/`

---

## Features

### For all authenticated users

- Dashboard with stats and recent reports
- Create new investigation reports (case ID, primary target, soft targets, summary)
- View reports with the embedded A4 `DocumentTemplate` preview
- Download canonical PDF from the server (versioned) or a local copy via jsPDF
- Export local PNG of the report
- Paginated report list

### For administrators

- Edit reports (creates a new version, prior state retained server-side)
- Soft-delete reports
- User management — create, edit, soft-delete operator accounts
- System-wide audit log viewer (actions, actor, resource, timestamp)

---

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # then edit NEXT_PUBLIC_API_BASE_URL if needed
npm run dev
```

Dev server runs on port **3245**:

```
http://localhost:3245
```

### Environment variables

| Variable                   | Default                     | Description                                               |
| -------------------------- | --------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://41.242.60.230:4382` | Backend base URL (no trailing slash, no `/api/v1` suffix) |

If unset, the app falls back to the VPS URL so it works out of the box.

### Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start Next.js dev server on port 3245    |
| `npm run build` | Build the production bundle              |
| `npm run start` | Start the production server on port 3245 |

---

## Project Structure

```
soft-target/
├── API.md                         Backend API reference (developer reference only)
├── .env.local.example             Environment variable template
│
├── app/                           Next.js App Router
│   ├── globals.css                Tailwind v4 + design tokens (do not edit)
│   ├── layout.js                  Root layout with <Providers>
│   ├── providers.jsx              AuthProvider + ToastProvider wrapper
│   ├── page.js                    Root — redirects to /login or /dashboard
│   │
│   ├── login/
│   │   └── page.jsx               Minimal login form
│   │
│   └── (app)/                     Authenticated route group
│       ├── layout.jsx             Auth guard + Sidebar + Topbar shell
│       ├── dashboard/             Stats and recent reports
│       ├── reports/               List, create, view, edit reports
│       └── admin/                 Admin-only: users + audit log
│           ├── layout.jsx         Admin role guard
│           ├── users/
│           └── audit/
│
├── components/
│   ├── DocumentTemplate.jsx       A4 printable report (forwardRef, do not edit)
│   ├── ui/                        Design-system primitives
│   │   ├── Button, Input, Card, Badge           (original)
│   │   └── Textarea, Select, Table, Spinner,
│   │       EmptyState, Dialog, Toast            (new)
│   ├── layout/
│   │   ├── Sidebar.jsx            App sidebar with role-gated nav
│   │   ├── Topbar.jsx             App topbar with user menu
│   │   ├── UserMenu.jsx           User dropdown with logout
│   │   └── PageHeader.jsx         Consistent page header block
│   ├── reports/
│   │   ├── ReportForm.jsx         Shared create/edit form
│   │   ├── SoftTargetFields.jsx   useFieldArray soft targets
│   │   ├── ReportTable.jsx        Reports list table
│   │   └── ReportPreviewPanel.jsx Wraps DocumentTemplate + export toolbar
│   └── admin/
│       ├── UserForm.jsx
│       ├── UserTable.jsx
│       └── AuditTable.jsx
│
├── lib/
│   ├── api/
│   │   ├── config.js              API_BASE resolution + apiUrl/rawUrl helpers
│   │   ├── client.js              apiFetch() — bearer auth + auto-refresh on 401
│   │   ├── auth.js                login, refresh, health
│   │   ├── reports.js             list/get/create/update/delete/downloadPdf
│   │   ├── users.js               admin users CRUD
│   │   └── audit.js               admin audit log
│   ├── auth/
│   │   ├── tokenStorage.js        localStorage "st.tokens" + JWT decode
│   │   ├── AuthContext.jsx        React context (user, tokens, login, logout)
│   │   └── useAuth.js             hook re-export
│   ├── toast/
│   │   ├── ToastContext.jsx       Queue-based toast provider
│   │   └── useToast.js
│   └── utils/
│       ├── cn.js                  classNames join
│       ├── format.js              date + api error formatters
│       └── mapReport.js           form ⇄ API payload conversion
│
├── public/                        Static assets
├── jsconfig.json                  Path alias @/* → project root
├── next.config.mjs
├── package.json
└── postcss.config.mjs
```

Path alias: `@/*` resolves from the project root, so imports like `@/components/ui/Button` and `@/lib/api/reports` work from any file.

---

## Authentication Flow

1. User submits email + password at `/login`
2. Frontend calls `POST /api/v1/auth/login`, receives `{ access_token, refresh_token }`
3. Tokens are stored in `localStorage` under the key `st.tokens`
4. User claims (id, email, role) are extracted client-side by decoding the JWT payload — used only for UI gating; the server is always the source of truth
5. Every subsequent API call goes through `lib/api/client.js::apiFetch()`, which attaches the bearer token automatically
6. On `401`, `apiFetch` transparently calls `POST /api/v1/auth/refresh` once to get a new token pair, retries the original request, and rotates the stored tokens
7. If refresh fails, tokens are cleared, a global `auth:expired` event fires, and the user is redirected to `/login`

See `API.md` for the full backend specification.

---

## Data Flow: creating a report

```
ReportForm (form shape)
      │
      │  formToApi(form)  — lib/utils/mapReport.js
      ▼
POST /api/v1/reports   — lib/api/reports.js
      │
      │  201 { id, case_id, version, data, ... }
      ▼
router.push(`/reports/${id}`)
      │
      │  getReport(id)
      │  apiToForm(report)
      ▼
<ReportPreviewPanel data={formShape} reportId={id} ... />
      │
      │  html-to-image  →  jsPDF     (local)
      │  downloadReportPdf(id)       (server canonical)
      ▼
   PDF download
```

The form uses a convenient flat shape (`caseId`, `target.imei`, `target.imei2`, `softTargets[]`). The API uses a nested shape (`case_id`, `payload.primary_target.imei_numbers[]`, `payload.soft_targets[]`). `lib/utils/mapReport.js` handles both directions so neither the form nor `DocumentTemplate.jsx` need to know about the API schema.

---

## Design System

All color, typography, and spacing tokens live in `app/globals.css` inside a Tailwind v4 `@theme` block. Never hardcode hex colors in components — use the CSS variables:

| Token                        | Value     | Usage                  |
| ---------------------------- | --------- | ---------------------- |
| `--color-primary`            | `#dc2626` | Primary red (Red-600)  |
| `--color-primary-foreground` | `#ffffff` | Text on primary        |
| `--color-secondary`          | `#f3f4f6` | Light gray backgrounds |
| `--color-border`             | `#e5e7eb` | All borders            |
| `--color-muted-foreground`   | `#6b7280` | Mono labels, metadata  |

Typography is **Geist Sans** (body) and **Geist Mono** (labels, code, metadata). Heavy weights dominate: `font-black` for page titles, `font-bold uppercase tracking-widest` for section headers, `font-mono` for anything operator-facing.

---

## Notes and Caveats

- **Single-page PDF export.** The local jsPDF export scales the captured image to fit one A4 page. Multi-page pagination is not implemented — for canonical multi-page output, rely on the server PDF (`GET /api/v1/reports/{id}/pdf`).
- **Role claims come from the JWT.** If the backend rotates claim shapes, update `lib/auth/tokenStorage.js::userFromTokens`.
- **No test suite.** Verification is a manual smoke check against a live backend.
- **CORS.** The backend's `CORS_ALLOWED_ORIGINS` env var must include this frontend's origin.

---

## Reference

- `API.md` — backend API reference (developer-only, not rendered in-app)
- Backend default: `http://41.242.60.230:4382` — override with `NEXT_PUBLIC_API_BASE_URL`
