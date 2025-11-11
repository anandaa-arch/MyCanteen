# Authentication Flow Testing Plan

**Date:** October 14, 2025  
**Status:** 🧪 TESTING IN PROGRESS  

---

## Testing Overview

This document outlines comprehensive authentication and authorization testing for all secured API endpoints in the MyCanteen application.

---

## Test Categories

1. **Authentication Tests** - Verify login/logout works
2. **Authorization Tests** - Verify role-based access control
3. **API Endpoint Tests** - Verify all secured endpoints
4. **User Flow Tests** - End-to-end user journeys
5. **Edge Case Tests** - Boundary conditions and errors

---

## 1. Authentication Tests

### Test 1.1: User Login Flow ✅
**Objective:** Verify users can log in successfully

**Steps:**
1. Navigate to `/login`
2. Enter valid credentials:
   - Email: (test user email)
   - Password: (test user password)
3. Click "Login"

**Expected Results:**
- ✅ User redirected to `/user/dashboard`
- ✅ Session created
- ✅ Profile loaded from `profiles_new` table
- ✅ User can see their dashboard

**Status:** ⏳ PENDING

---

### Test 1.2: Admin Login Flow ✅
**Objective:** Verify admins can log in successfully

**Steps:**
1. Navigate to `/login`
2. Enter admin credentials:
   - Email: (admin email)
   - Password: (admin password)
3. Click "Login"

**Expected Results:**
- ✅ Admin redirected to `/admin/dashboard`
- ✅ Admin role verified from `profiles_new` table
- ✅ Admin can see admin dashboard

**Status:** ⏳ PENDING

---

### Test 1.3: Invalid Credentials ✅
**Objective:** Verify proper error handling for wrong credentials

**Steps:**
1. Navigate to `/login`
2. Enter invalid credentials
3. Click "Login"

**Expected Results:**
- ❌ Login fails with error message
- ❌ User stays on login page
- ❌ No session created

**Status:** ⏳ PENDING

---

### Test 1.4: User Logout ✅
**Objective:** Verify users can log out properly

**Steps:**
1. Log in as user
2. Click "Logout" button
3. Attempt to access protected page

**Expected Results:**
- ✅ User logged out
- ✅ Session destroyed
- ✅ Redirect to `/login` when accessing protected pages

**Status:** ⏳ PENDING

---

## 2. Authorization Tests (Middleware)

### Test 2.1: Unauthenticated Access to User Routes ✅
**Objective:** Verify unauthenticated users cannot access protected routes

**Test Routes:**
- `/user/dashboard`
- `/user/billing`
- `/profile`
- `/attendance`

**Steps:**
1. Clear browser cookies/session
2. Navigate to each protected route

**Expected Results:**
- ❌ Access denied
- ✅ Redirect to `/login`
- ✅ 401/302 response

**Status:** ⏳ PENDING

---

### Test 2.2: Unauthenticated Access to Admin Routes ✅
**Objective:** Verify unauthenticated users cannot access admin routes

**Test Routes:**
- `/admin/dashboard`
- `/admin/billing`
- `/admin/inventory`
- `/admin/polls`

**Steps:**
1. Clear browser cookies/session
2. Navigate to each admin route

**Expected Results:**
- ❌ Access denied
- ✅ Redirect to `/login`
- ✅ 401/302 response

**Status:** ⏳ PENDING

---

### Test 2.3: User Accessing Admin Routes ✅
**Objective:** Verify regular users cannot access admin pages

**Test Routes:**
- `/admin/dashboard`
- `/admin/billing`
- `/admin/inventory`
- `/admin/create-user`

**Steps:**
1. Log in as regular user
2. Navigate to admin routes

**Expected Results:**
- ❌ Access denied
- ✅ Redirect to `/unauthorized`
- ✅ 403 response

**Status:** ⏳ PENDING

---

### Test 2.4: Admin Accessing User Routes ✅
**Objective:** Verify admins CAN access user pages (they're also users)

**Test Routes:**
- `/user/dashboard`
- `/user/billing`
- `/profile`

**Steps:**
1. Log in as admin
2. Navigate to user routes

**Expected Results:**
- ✅ Access granted
- ✅ Pages load correctly

**Status:** ⏳ PENDING

---

## 3. API Endpoint Authorization Tests

### Test 3.1: `/api/expenses` - GET/POST ✅

#### Test 3.1.1: Unauthenticated Access
**Request:**
```bash
curl http://localhost:3001/api/expenses
```

**Expected Response:**
```json
{
  "error": "Unauthorized - Please login"
}
```
**Expected Status:** 401

---

#### Test 3.1.2: Regular User Access
**Request:**
```bash
curl http://localhost:3001/api/expenses \
  -H "Cookie: <user_session>"
```

**Expected Response:**
```json
{
  "error": "Forbidden - Admin access required"
}
```
**Expected Status:** 403

---

#### Test 3.1.3: Admin Access (Success)
**Request:**
```bash
curl http://localhost:3001/api/expenses \
  -H "Cookie: <admin_session>"
```

**Expected Response:**
```json
[
  { "id": 1, "category": "Food", "amount": 1000, ... }
]
```
**Expected Status:** 200

---

#### Test 3.1.4: Admin POST with Invalid Data
**Request:**
```bash
curl -X POST http://localhost:3001/api/expenses \
  -H "Cookie: <admin_session>" \
  -H "Content-Type: application/json" \
  -d '{"category":"Food","amount":-100}'
```

**Expected Response:**
```json
{
  "error": "Invalid amount"
}
```
**Expected Status:** 400

---

### Test 3.2: `/api/inventory-items` - GET/POST ✅

#### Test 3.2.1: Unauthenticated Access
**Expected Status:** 401

#### Test 3.2.2: Regular User Access
**Expected Status:** 403

#### Test 3.2.3: Admin Access
**Expected Status:** 200

#### Test 3.2.4: Invalid Input Validation
**Request:**
```json
{
  "name": "",
  "category": "Food",
  "unit_price": -50
}
```
**Expected Status:** 400

---

### Test 3.3: `/api/inventory-logs` - GET/POST ✅

#### Test 3.3.1: Invalid Type Validation
**Request:**
```json
{
  "item_id": "uuid",
  "type": "invalid_type",
  "quantity": 10
}
```
**Expected Response:**
```json
{
  "error": "Invalid type. Must be 'in' or 'out'"
}
```
**Expected Status:** 400

---

### Test 3.4: `/api/revenue` - GET/POST ✅

#### Test 3.4.1: Stock Availability Check
**Request:**
```json
{
  "item_id": "uuid",
  "quantity": 1000,
  "unit_price": 50
}
```
**Expected Response:**
```json
{
  "error": "Insufficient stock. Available: 10"
}
```
**Expected Status:** 400

---

### Test 3.5: `/api/reminders` - GET/POST ✅

#### Test 3.5.1: Invalid Recurrence
**Request:**
```json
{
  "name": "Test Reminder",
  "recurrence": "hourly",
  "next_due_date": "2025-10-15"
}
```
**Expected Response:**
```json
{
  "error": "Invalid recurrence. Must be one of: daily, weekly, monthly, yearly"
}
```
**Expected Status:** 400

---

### Test 3.6: `/api/invoice` - POST ✅

#### Test 3.6.1: User Accessing Own Invoice
**Request:**
```bash
curl -X POST http://localhost:3001/api/invoice \
  -H "Cookie: <user_session>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<own_user_id>","userName":"Test","startDate":"2025-10-01","endDate":"2025-10-14"}'
```
**Expected Status:** 200 (PDF download)

---

#### Test 3.6.2: User Accessing Another User's Invoice
**Request:**
```bash
curl -X POST http://localhost:3001/api/invoice \
  -H "Cookie: <user_session>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<different_user_id>","userName":"Other","startDate":"2025-10-01","endDate":"2025-10-14"}'
```
**Expected Response:**
```json
{
  "error": "Forbidden - You can only generate your own invoices"
}
```
**Expected Status:** 403

---

#### Test 3.6.3: Admin Accessing Any User's Invoice
**Request:**
```bash
curl -X POST http://localhost:3001/api/invoice \
  -H "Cookie: <admin_session>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<any_user_id>","userName":"Any User","startDate":"2025-10-01","endDate":"2025-10-14"}'
```
**Expected Status:** 200 (PDF download)

---

## 4. End-to-End User Flows

### Test 4.1: Complete User Journey ✅

**Scenario:** Regular user logs in and uses the system

**Steps:**
1. Navigate to `/login`
2. Log in with user credentials
3. Verify redirect to `/user/dashboard`
4. Navigate to `/user/billing`
5. Try to access `/admin/dashboard` (should fail)
6. Generate own invoice
7. Try to generate another user's invoice (should fail)
8. Log out
9. Verify redirect to `/login`

**Expected Results:**
- ✅ All user operations succeed
- ❌ All admin operations fail with 403
- ✅ Proper redirects throughout

**Status:** ⏳ PENDING

---

### Test 4.2: Complete Admin Journey ✅

**Scenario:** Admin logs in and uses the system

**Steps:**
1. Navigate to `/login`
2. Log in with admin credentials
3. Verify redirect to `/admin/dashboard`
4. Access `/admin/billing`
5. Create expense via `/api/expenses`
6. Add inventory item via `/api/inventory-items`
7. Generate any user's invoice
8. Access user pages (should work)
9. Log out

**Expected Results:**
- ✅ All admin operations succeed
- ✅ All user operations succeed (admins can access user pages)
- ✅ Proper data creation and retrieval

**Status:** ⏳ PENDING

---

## 5. Edge Cases & Security Tests

### Test 5.1: Session Timeout ✅
**Objective:** Verify expired sessions are handled

**Steps:**
1. Log in
2. Wait for session to expire (or manually expire)
3. Try to access protected route

**Expected Results:**
- ❌ Session invalid
- ✅ Redirect to `/login`

**Status:** ⏳ PENDING

---

### Test 5.2: Concurrent Logins ✅
**Objective:** Verify multiple sessions handling

**Steps:**
1. Log in on Browser A
2. Log in same user on Browser B
3. Perform operations on both

**Expected Results:**
- ✅ Both sessions work independently
- ✅ No conflicts

**Status:** ⏳ PENDING

---

### Test 5.3: SQL Injection Attempts ✅
**Objective:** Verify Supabase protects against SQL injection

**Test Cases:**
```javascript
// Test malicious inputs
email: "' OR '1'='1"
password: "'; DROP TABLE users; --"
category: "'; DELETE FROM expenses; --"
```

**Expected Results:**
- ✅ All attempts safely handled
- ✅ No SQL execution
- ✅ Parameterized queries protect

**Status:** ⏳ PENDING

---

### Test 5.4: XSS Attempts ✅
**Objective:** Verify XSS protection

**Test Cases:**
```javascript
name: "<script>alert('XSS')</script>"
description: "<img src=x onerror='alert(1)'>"
```

**Expected Results:**
- ✅ Scripts not executed
- ✅ Input sanitized/escaped

**Status:** ⏳ PENDING

---

### Test 5.5: CSRF Protection ✅
**Objective:** Verify cross-site request protection

**Steps:**
1. Create malicious form on external site
2. Submit to MyCanteen API
3. Verify rejection

**Expected Results:**
- ❌ Request rejected
- ✅ Same-origin policy enforced

**Status:** ⏳ PENDING

---

## 6. Performance Tests

### Test 6.1: Authentication Performance ✅
**Objective:** Measure auth overhead

**Metrics:**
- Time to verify authentication: <50ms
- Time to check role: <50ms
- Total overhead: <100ms per request

**Status:** ⏳ PENDING

---

### Test 6.2: Load Testing ✅
**Objective:** Test under high load

**Test:**
- 100 concurrent users
- Mixed admin/user operations
- Sustained load for 5 minutes

**Expected Results:**
- ✅ No authentication failures
- ✅ Consistent response times
- ✅ No session conflicts

**Status:** ⏳ PENDING

---

## Testing Tools

### Manual Testing Tools:
1. **Browser DevTools** - Network tab for request inspection
2. **Postman** - API endpoint testing
3. **cURL** - Command-line API testing

### Automated Testing (Future):
1. **Jest** - Unit tests
2. **Playwright** - E2E tests
3. **k6** - Load testing

---

## Test Execution Commands

### Start Development Server:
```bash
npm run dev
```

### Test with cURL (Examples):

#### Test Unauthenticated Access:
```bash
curl -v http://localhost:3001/api/expenses
```

#### Test with Session Cookie:
```bash
# First login to get session cookie
curl -v -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Then use the session cookie
curl -v http://localhost:3001/api/expenses \
  -H "Cookie: <cookie_from_login>"
```

---

## Test Results Template

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | User Login Flow | ⏳ | |
| 1.2 | Admin Login Flow | ⏳ | |
| 1.3 | Invalid Credentials | ⏳ | |
| 2.1 | Unauth User Routes | ⏳ | |
| 2.2 | Unauth Admin Routes | ⏳ | |
| 2.3 | User Access Admin | ⏳ | |
| 3.1 | Expenses API Auth | ⏳ | |
| 3.2 | Inventory Items Auth | ⏳ | |
| 3.3 | Inventory Logs Auth | ⏳ | |
| 3.4 | Revenue API Auth | ⏳ | |
| 3.5 | Reminders API Auth | ⏳ | |
| 3.6 | Invoice API Auth | ⏳ | |
| 4.1 | User E2E Journey | ⏳ | |
| 4.2 | Admin E2E Journey | ⏳ | |
| 5.1 | Session Timeout | ⏳ | |
| 5.2 | SQL Injection | ⏳ | |
| 5.3 | XSS Protection | ⏳ | |

---

## Critical Paths to Test

### Priority 1 (Critical):
- ✅ Login/Logout functionality
- ✅ Admin role verification
- ✅ API endpoint authentication
- ✅ User cannot access admin features

### Priority 2 (High):
- ✅ Input validation
- ✅ Invoice authorization
- ✅ Error handling

### Priority 3 (Medium):
- ✅ Session management
- ✅ Performance under load
- ✅ Edge cases

---

## Known Issues & Notes

1. **Session Cookie Name:** Check Supabase auth cookie name
2. **CORS:** Ensure CORS configured for testing
3. **Database State:** Use test data, don't affect production

---

## Test Environment Setup

### Prerequisites:
- [x] Development server running on port 3001
- [ ] Test users created (1 admin, 2 regular users)
- [ ] Test data populated
- [ ] Browser with DevTools
- [ ] Postman/cURL installed

### Test Users Needed:
1. **Admin User:**
   - Email: admin@mycanteen.com
   - Role: admin

2. **Regular User 1:**
   - Email: user1@mycanteen.com
   - Role: user

3. **Regular User 2:**
   - Email: user2@mycanteen.com
   - Role: user

---

## Next Steps

1. ⏳ Start development server
2. ⏳ Create test users if not exists
3. ⏳ Run manual tests systematically
4. ⏳ Document results
5. ⏳ Fix any issues found
6. ⏳ Re-test after fixes
7. ✅ Mark ready for production

---

**Testing Started:** October 14, 2025  
**Testing Status:** 🧪 IN PROGRESS  
**Completion:** 0% (0/20 tests completed)

---

*Update this document as tests are completed.*
