# Authentication Testing - Quick Test Script

## Prerequisites Check
- [ ] Server running on http://localhost:3001
- [ ] At least 1 admin user in database
- [ ] At least 1 regular user in database

---

## Manual Testing Guide

### 1. Test Middleware Protection

#### Test 1A: Access Protected Page Without Login
1. Open **Incognito/Private Browser Window**
2. Navigate to: `http://localhost:3001/user/dashboard`
3. **Expected:** Redirect to `/login`
4. **Result:** _______

#### Test 1B: Access Admin Page Without Login
1. In same incognito window
2. Navigate to: `http://localhost:3001/admin/dashboard`
3. **Expected:** Redirect to `/login`
4. **Result:** _______

---

### 2. Test User Login Flow

#### Test 2A: Login as Regular User
1. Navigate to: `http://localhost:3001/login`
2. Enter **regular user credentials**
3. Click Login
4. **Expected:** Redirect to `/user/dashboard`
5. **Result:** _______

#### Test 2B: User Tries to Access Admin Page
1. While logged in as user
2. Navigate to: `http://localhost:3001/admin/dashboard`
3. **Expected:** Redirect to `/unauthorized` or blocked
4. **Result:** _______

---

### 3. Test Admin Login Flow

#### Test 3A: Login as Admin
1. Open **new incognito window**
2. Navigate to: `http://localhost:3001/login`
3. Enter **admin credentials**
4. Click Login
5. **Expected:** Redirect to `/admin/dashboard`
6. **Result:** _______

#### Test 3B: Admin Can Access User Pages
1. While logged in as admin
2. Navigate to: `http://localhost:3001/user/dashboard`
3. **Expected:** Page loads successfully
4. **Result:** _______

---

### 4. Test API Endpoint Protection

#### Test 4A: API Without Authentication
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Run this code:
```javascript
fetch('http://localhost:3001/api/expenses')
  .then(r => r.json())
  .then(d => console.log('Response:', d))
  .catch(e => console.error('Error:', e))
```
4. **Expected:** `{"error":"Unauthorized - Please login"}`
5. **Result:** _______

#### Test 4B: API as Regular User
1. **Login as regular user first**
2. Open DevTools Console
3. Run:
```javascript
fetch('http://localhost:3001/api/expenses')
  .then(r => r.json())
  .then(d => console.log('Response:', d))
  .catch(e => console.error('Error:', e))
```
4. **Expected:** `{"error":"Forbidden - Admin access required"}`
5. **Result:** _______

#### Test 4C: API as Admin
1. **Login as admin first**
2. Open DevTools Console
3. Run:
```javascript
fetch('http://localhost:3001/api/expenses')
  .then(r => r.json())
  .then(d => console.log('Response:', d))
  .catch(e => console.error('Error:', e))
```
4. **Expected:** Array of expenses or empty array `[]`
5. **Result:** _______

---

### 5. Test Invoice Authorization

#### Test 5A: User Generate Own Invoice
1. **Login as regular user**
2. Get your user ID from profile or database
3. Open DevTools Console
4. Run (replace USER_ID with actual ID):
```javascript
fetch('http://localhost:3001/api/invoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID',
    userName: 'Your Name',
    startDate: '2025-10-01',
    endDate: '2025-10-14'
  })
})
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => console.log('Response:', d))
  .catch(e => console.error('Error:', e))
```
5. **Expected:** Status 200 or PDF download
6. **Result:** _______

#### Test 5B: User Try Another User's Invoice
1. **Still logged in as regular user**
2. Open DevTools Console
3. Run (use DIFFERENT user ID):
```javascript
fetch('http://localhost:3001/api/invoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'DIFFERENT_USER_ID',
    userName: 'Other User',
    startDate: '2025-10-01',
    endDate: '2025-10-14'
  })
})
  .then(r => r.json())
  .then(d => console.log('Response:', d))
  .catch(e => console.error('Error:', e))
```
4. **Expected:** `{"error":"Forbidden - You can only generate your own invoices"}`
5. **Result:** _______

---

### 6. Test Input Validation

#### Test 6A: Invalid Expense Amount
1. **Login as admin**
2. Open DevTools Console
3. Run:
```javascript
fetch('http://localhost:3001/api/expenses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: 'Food',
    amount: -100,
    description: 'Test'
  })
})
  .then(r => r.json())
  .then(d => console.log('Response:', d))
```
4. **Expected:** `{"error":"Invalid amount"}`
5. **Result:** _______

#### Test 6B: Invalid Inventory Log Type
1. **Still logged in as admin**
2. Run:
```javascript
fetch('http://localhost:3001/api/inventory-logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    item_id: 'test-id',
    type: 'invalid',
    quantity: 10
  })
})
  .then(r => r.json())
  .then(d => console.log('Response:', d))
```
3. **Expected:** `{"error":"Invalid type. Must be \"in\" or \"out\""}`
4. **Result:** _______

---

### 7. Test Logout

#### Test 7A: User Logout
1. **While logged in**
2. Click Logout button
3. **Expected:** Redirect to `/login`
4. Try to access: `http://localhost:3001/user/dashboard`
5. **Expected:** Redirect to `/login` again
6. **Result:** _______

---

## Quick Test Summary

| Test | Description | Expected | Result | Status |
|------|-------------|----------|--------|--------|
| 1A | Unauth user page | Redirect /login | | ⏳ |
| 1B | Unauth admin page | Redirect /login | | ⏳ |
| 2A | User login | Redirect /user/dashboard | | ⏳ |
| 2B | User→Admin | Blocked | | ⏳ |
| 3A | Admin login | Redirect /admin/dashboard | | ⏳ |
| 3B | Admin→User | Success | | ⏳ |
| 4A | API no auth | 401 error | | ⏳ |
| 4B | API as user | 403 error | | ⏳ |
| 4C | API as admin | Success | | ⏳ |
| 5A | Own invoice | Success | | ⏳ |
| 5B | Other invoice | 403 error | | ⏳ |
| 6A | Invalid amount | 400 error | | ⏳ |
| 6B | Invalid type | 400 error | | ⏳ |
| 7A | Logout | Redirect /login | | ⏳ |

---

## Notes & Issues

**Test User Credentials:**
- Admin: _________________
- User 1: _________________
- User 2: _________________

**Issues Found:**
1. _________________
2. _________________
3. _________________

**Fixes Needed:**
1. _________________
2. _________________
3. _________________

---

## Test Completion

- [ ] All middleware tests pass
- [ ] All API auth tests pass
- [ ] All validation tests pass
- [ ] All authorization tests pass
- [ ] No security vulnerabilities found

**Overall Status:** ⏳ PENDING  
**Ready for Production:** ❌ NO / ✅ YES

---

**Tested By:** _________________  
**Date:** October 14, 2025  
**Time:** _________________
