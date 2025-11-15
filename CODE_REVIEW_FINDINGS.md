# MyCanteen Code Review Findings

_Date: 15 November 2025_

This document captures the critical and high-impact issues identified during the recent codebase analysis. Each item includes severity, location, impact, and recommended remediation steps.

## Summary Table

| # | Severity | Area | Description |
|---|----------|------|-------------|
| 1 | Critical | `app/api/attendance-scan/route.js` | Syntax error leaves the primary QR scan API unusable. |
| 2 | Critical | `app/api/invoice/route.js` | Service-role invoice endpoint exposes any student data without auth. |
| 3 | Critical | `app/api/public-poll-stats/route.js` | Public marketing page leaks per-student attendance details. |
| 4 | Critical | `app/api/create-profile/route.js` | Unauthenticated API allows arbitrary account creation via service key. |
| 5 | High | Notifications system / `app/layout.js` | No shared notification store and missing bottom nav rendering. |
| 6 | Medium | `app/api/attendance/route.js` | Updating attendance overwrites `actual_meal_time` with last scan. |
| 7 | Medium | `/admin/qr-scanner` flow | Broken new API forces fallback that cannot auto-create polls. |

---

## 1. QR Scan API Syntax Error (Critical)
- **Location:** `app/api/attendance-scan/route.js`
- **Issue:** The block that validates `userId`/`type` never closes, so the file fails to compile. As a result the route crashes on load and the admin QR scanner silently falls back to the older `/api/attendance` endpoint.
- **Impact:** Primary scan path is dead; any future refactors that remove the fallback will completely break attendance capture.
- **Fix:** Add the missing closing brace and add unit coverage to ensure the handler loads. Re-test `/admin/qr-scanner` once deployed.

## 2. Invoice Endpoint Lacks Authorization (Critical)
- **Location:** `app/api/invoice/route.js`
- **Issue:** Handler imports `supabaseAdmin` (service role) and never checks the caller. Anyone can POST arbitrary `userId`/date ranges and download full meal history PDFs.
- **Impact:** Complete bypass of RLS + privacy breach of student attendance/billing data.
- **Fix:** Require a valid session via `getSupabaseRouteClient`, enforce role-based access (self-service for the owner, admin override for staff), and avoid using the service role unless absolutely necessary.

## 3. Public Poll Stats Leak (Critical)
- **Location:** `app/api/public-poll-stats/route.js`
- **Issue:** Exposed from the marketing landing page with no auth, yet uses the service role to fetch raw `poll_responses` joined with `profiles_new` (names, emails, departments).
- **Impact:** Anyone can scrape individual attendance decisions every day.
- **Fix:** Either gate the endpoint behind authentication with proper RLS-aware clients or limit the response to aggregate counts with anonymized data. Remove service-role usage.

## 4. Unrestricted Profile Creation (Critical)
- **Location:** `app/api/create-profile/route.js`
- **Issue:** Uses `supabaseAdmin.auth.admin.createUser` without checking who is calling the route. Any anonymous client can provision new accounts or enumerate existing emails via error responses.
- **Impact:** Attackers can spam user creation, escalate to internal resources, or discover registered addresses.
- **Fix:** Require an authenticated admin session before invoking admin APIs, validate inputs server-side, and avoid leaking detailed error messages.

## 5. Notification Plumbing & Layout Regression (High)
- **Location:** `lib/notificationSystem.js`, `app/layout.js`, `components/BottomNavbar.js`
- **Issues:**
  - `useNotifications` is just a local `useState`, so every component gets an isolated notification list; alerts triggered in dashboards never reach the `NotificationContainer` mounted in the root layout.
  - Root layout is marked `'use client'` purely to access `usePathname`, disabling React Server Component streaming. The computed `showBottomBar` flag is unused, so the documented mobile `BottomNavbar` never renders.
- **Impact:** Users never see toast notifications; mobile navigation is missing; layout forfeits server rendering benefits.
- **Fix:** Introduce a `NotificationsProvider` context wrapping the app so all children share the same state, convert the root layout back to a server component (use a small client wrapper for pathname-dependent UI), and actually render `BottomNavbar` based on the route whitelist.

## 6. Attendance Update Overwrites Meal Time (Medium)
- **Location:** `app/api/attendance/route.js`
- **Issue:** When re-confirming attendance the query only selects `id` and `confirmation_status` yet later references `existingAttendance.actual_meal_time`. Because the field is undefined, every re-scan sets `actual_meal_time` to the latest timestamp, losing the original meal clock-in.
- **Impact:** Audit logs and billing data lose the real service time whenever a student is rescanned.
- **Fix:** Include `actual_meal_time` (and any other reused columns) in the initial select before performing the update.

## 7. Scanner Fallback Leaves Auto-Poll Creation Broken (Medium)
- **Location:** `app/admin/qr-scanner/page.js` flow between `/api/attendance-scan` and `/api/attendance`
- **Issue:** Because the new endpoint fails to load (Issue 1), every scan uses the legacy API which does not auto-create polls when missing. The UI and success messaging claim otherwise, so admins cannot create the day’s poll from the scanner anymore.
- **Impact:** Admins must manually create polls before scanning, contradicting the promised workflow.
- **Fix:** After resolving the syntax error, ensure both endpoints share consistent logic (or remove the fallback once parity is guaranteed). Add regression tests around poll auto-creation.
