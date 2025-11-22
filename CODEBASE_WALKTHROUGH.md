# MyCanteen Codebase Walkthrough

Use this guide as the master reference when you need to explain how the product works, onboard a new contributor, or run a live demo for the company.

---

## 1. Project Overview

- Purpose: automate hostel/canteen attendance, prevent food wastage, and keep billing accurate.
- Users: Students (web app + QR code) and Admins (dashboards, scanners, billing tools).
- Hosting: Next.js 15 on Vercel, Supabase (Postgres + Auth + Realtime) for persistence.
- Core Capabilities: QR attendance, meal polls, daily menus, automated billing, notifications, analytics.

### Tech Stack Snapshot

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15 (App Router), React Server Components, Tailwind CSS, Lucide icons |
| Backend | Next.js API Routes + Supabase service key |
| Data | Supabase Postgres, SQL migrations in `database_migrations/` |
| Auth | Supabase email/password, middleware route gating |
| Realtime | Supabase channels (`lib/notificationSystem.js`) |
| QR | `@zxing/browser` + custom camera manager (`components/QRScanner.js`) |

---

## 2. Repository Map (What lives where)

```
app/
  login/, signup/          -> Auth screens (react-hook-form + zod)
  user/                    -> Student experience (dashboard, qr, billing, meal-history)
  admin/                   -> Admin experience (dashboard, qr-scanner, billing, menu, polls, manual-attendance)
  api/                     -> Server endpoints (attendance, polls, billing, menu, notifications)
components/
  QRScanner.js             -> Camera control + ZXing decoding + error overlays
  FormComponents.js        -> Shared inputs, radios, select, submit button
  LoadingSpinner.js        -> Full-page, inline, and button spinners
  Toast.js, Notification*  -> Global notification system
lib/
  supabaseClient.js        -> Client-side auth helper
  supabaseRouteHandler.js  -> Server-side Supabase instance
  pollHelpers.js           -> Slot calculation, poll fetch utilities
  notificationSystem.js    -> Realtime channel subscriptions
middleware.js              -> Auth guard + role-based redirects
database_migrations/       -> All SQL the Supabase instance needs
```

---

## 3. High-Level Architecture Flow

```
[Browser]
   ↓ (Supabase Auth session)
[Next.js Middleware] -> verifies cookie, loads role
   ↓
[Page (RSC)] -> fetch initial data via server actions or API routes
   ↓
[Client Components] -> forms, QR scanner, charts
   ↓
[API Routes] (app/api/*) -> Supabase service role
   ↓
[Supabase Postgres] + Realtime
```

Everything is role controlled: students never hit admin APIs because `middleware.js` and server-side role checks block them.

---

## 4. End-to-End User Journeys

### Student Journey (Login -> Confirm Meal -> Get Charged)

1. Login (`app/login/page.js`)
   - Zod schema + react-hook-form (`mode: 'onBlur'`).
   - Calls Supabase auth; middleware stores session cookie and reroutes by role.
2. Dashboard (`app/user/dashboard/page.js`)
   - Server component loads profile, today’s polls, stats (cached in `lib/cache.js`).
   - Client widgets show quick actions.
3. Mark Attendance (`app/user/dashboard/components/PollModal.js`)
   - Pre-selects current slot via `lib/pollHelpers.js`.
   - Submits to `POST /api/polls`.
4. Generate QR (`app/user/qr/page.js`)
   - Uses `qrcode.react` to encode `{ userId, type: 'attendance', mealSlot }`.
5. Billing View (`app/user/billing/page.js`)
   - Aggregates confirmed meals vs. payments from `transactions`.
6. Realtime Feedback
   - `lib/notificationSystem.js` subscribes to updates on `poll_responses` so confirmations appear instantly.

### Admin Journey (Dashboard -> Scan -> Bill)

1. Dashboard (`app/admin/dashboard/page.js`)
   - KPIs: revenue, outstanding balances, registrations.
2. QR Scanner (`app/admin/qr-scanner/page.js` + `components/QRScanner.js`)
   - Manual `getUserMedia` stream + ZXing `decodeFromStream`.
   - Auto restart on `AbortError`, green overlay on success, vibration on mobile.
3. Attendance API (`app/api/attendance/route.js`)
   - Validates QR payload, ensures poll exists, inserts/updates `poll_responses`.
   - Preserves `actual_meal_time` so rescans keep original booking time.
4. Manual Attendance (`app/admin/manual-attendance/page.js`)
   - Search + confirm without camera using same API.
5. Billing (`app/admin/billing/page.js`)
   - Computes `(full * 60) + (half * 45) - payments` per student/month and records transactions.
6. Menu & Polls
   - `app/admin/menu` writes to `menus` table; `/admin/polls` provides exports & filters.

---

## 5. Database Primer

| Table | Purpose | Highlights |
| --- | --- | --- |
| `profiles_new` | All users + roles | `role` enum, metadata (dept, year, contact) |
| `polls` | Daily slots | Unique `(date, meal_slot)`; toggles open slots |
| `poll_responses` | Attendance records | Unique `(user_id, date, meal_slot)`, `confirmation_status`, `actual_meal_time`, `attended_at` |
| `menus` | Daily menu JSONB | Array of `{ name, description }` per slot |
| `transactions` | Payments | Amount, method, `status`, feeds billing dashboards |

Definitions live inside `database_migrations/` and helper scripts such as `poll_responses_table.sql`.

---

## 6. Critical API Routes

### POST `/api/attendance`

```json
{
  "scannedData": "{\"userId\":\"uuid\",\"type\":\"attendance\",\"mealSlot\":\"lunch\"}",
  "mealSlot": "lunch"
}
```

Flow:
1. Ensure admin session.
2. Parse QR JSON; reject if `type !== 'attendance'`.
3. Fetch poll + existing response.
4. Insert new or update existing record while preserving `actual_meal_time`.
5. Return payload for toast + overlay.

### POST `/api/polls`
- Body: `{ attendance: 'yes'|'no', portion: 'full'|'half', mealSlot }`.
- Upserts into `poll_responses` with `pending_customer_response` status.

### POST `/api/billing`
- Body: `{ userId, amount, monthYear, paymentMethod }`.
- Creates `transactions` row then recomputes outstanding balance.

Additional endpoints: `/api/menu` (GET/POST), `/api/attendance?action=get-user-attendance` for exports. Every route re-checks the Supabase role before running.

---

## 7. Feature Deep Dives

### QR Scanner (`components/QRScanner.js`)
- Single `BrowserMultiFormatReader` instance.
- Manages `MediaStream` manually to avoid ZXing autoplay quirks.
- Restarts stream on `AbortError` via `setTimeout` debounce.
- Visual feedback: green overlay + vibration; human-readable camera errors.

### Poll Modal
- Radio buttons for attendance + portion, built with `FormComponents.js` helpers.
- Cache invalidation via `lib/cache.js` for `user_stats_{userId}` so dashboard re-fetches immediately.

### Billing Calculations
- `app/admin/billing/page.js` and `app/user/billing/page.js` share logic: confirmed meals × rate minus payments.
- Transactions are displayed chronologically with manual entry modal.

### Loading & Error UX
- Spinners from `components/LoadingSpinner.js` (full page, inline, button).
- Skeletons keep perceived speed high while data loads.
- `components/ErrorBoundary.js` prevents single widget crashes from breaking the page.

---

## 8. Data Flow Examples

### Student lunch booking to confirmation
1. Student submits poll (status `pending_customer_response`).
2. QR generated; admin scans.
3. `/api/attendance` flips status to `confirmed_attended`, stamps `attended_at`, keeps `actual_meal_time`.
4. Supabase realtime notifies student dashboard; toast shows success.
5. Billing view now counts the meal (full or half rate).

### Billing cycle close
1. Admin opens `/admin/billing` -> aggregates confirmed meals by month.
2. Outstanding balances sorted descending.
3. Recording a payment inserts `transactions` row.
4. Student view refreshes via realtime subscription to same table.

---

## 9. Security & Reliability Checklist

- Auth: Supabase sessions enforced via `middleware.js`; unauthenticated users redirected to `/login`.
- Role Checks: Every sensitive API double-checks `profiles_new.role` before proceeding.
- Validation: Zod on inputs, server-side guards for enums and UUIDs.
- RLS: Supabase row policies deny cross-user reads/writes.
- Error Handling: QR scanner catches `NotFoundException`, `ChecksumException`, etc., without killing the stream.
- Caching: `lib/cache.js` stores stats/menu data with TTL; invalidated after writes to avoid stale dashboards.

---

## 10. Testing & Demo Script

### Manual Regression Checklist
1. Login/logout (student + admin).
2. Student dashboard: mark attendance, see toast, verify status changes.
3. QR scanner: ensure camera permission prompt, scan sample QR, observe success overlay + vibration.
4. Billing: confirm totals adjust when transactions inserted.
5. Menu management: create/edit menu, verify `/menu` shows latest copy.
6. Notifications: open student tab + admin tab, validate realtime updates.

### Suggested Live Demo Flow (10 minutes)
1. Intro (1 min): highlight tech stack.
2. Student Journey (3 min): login, book meal, show QR.
3. Admin Journey (3 min): scan QR, highlight overlay, show attendance list updating.
4. Billing (2 min): display outstanding list, record payment, show student side update.
5. Wrap-up (1 min): mention security, realtime, extensibility.

---

## 11. Deployment & Ops Notes

- `npm run lint` is clean aside from acknowledged `react-hooks/exhaustive-deps` warnings.
- `npm run build` used by Vercel preview; environment variables stored in project settings.
- Database migrations must be applied to Supabase before deploying new features.
- Monitoring: rely on Supabase logs + Vercel analytics; consider adding Sentry if required.

---

## 12. Next Steps / Talking Points

Use these prompts during handoff meetings:

1. Scalability: Add pagination to admin tables (`app/admin/dashboard/components/UserTable`).
2. Accessibility: Switch form validation to `onChange`, increase touch targets, add empty-state illustrations.
3. Extensibility: Additional meal slot (snacks) requires enum update + UI toggle.
4. Automation: Cron-triggered reminder emails for missed polls can reuse Supabase Edge Functions.

---

_Last updated: 22 Nov 2025_
