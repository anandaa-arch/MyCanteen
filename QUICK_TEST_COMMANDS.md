# 🧪 Quick Test Commands - Copy & Paste

## 🎯 Load Automated Test Suite
```javascript
const script = document.createElement('script');
script.src = '/test-auth.js';
document.head.appendChild(script);
```

---

## 🔴 Test 1: API Without Auth (Should fail with 401)
```javascript
fetch('http://localhost:3001/api/expenses')
  .then(r => r.json())
  .then(d => console.log('✅ PASS: Got 401' || '❌ FAIL:', d))
```

---

## 🔴 Test 2: All Admin APIs Without Auth
```javascript
const endpoints = ['/api/expenses', '/api/inventory-items', '/api/inventory-logs', '/api/revenue', '/api/reminders'];
Promise.all(endpoints.map(e => 
  fetch('http://localhost:3001' + e).then(r => ({endpoint: e, status: r.status}))
)).then(results => {
  console.table(results);
  const allFail = results.every(r => r.status === 401);
  console.log(allFail ? '✅ ALL PASS - All return 401' : '❌ SOME FAIL - Not all 401');
});
```

---

## 🟡 Test 3: User Blocked from Admin APIs (Login as user first!)
```javascript
const endpoints = ['/api/expenses', '/api/inventory-items', '/api/inventory-logs', '/api/revenue', '/api/reminders'];
Promise.all(endpoints.map(e => 
  fetch('http://localhost:3001' + e).then(r => ({endpoint: e, status: r.status}))
)).then(results => {
  console.table(results);
  const allBlocked = results.every(r => r.status === 403);
  console.log(allBlocked ? '✅ ALL PASS - All return 403' : '❌ SOME FAIL - Not all 403');
});
```

---

## 🟢 Test 4: Admin Access to APIs (Login as admin first!)
```javascript
const endpoints = ['/api/expenses', '/api/inventory-items', '/api/inventory-logs', '/api/revenue', '/api/reminders'];
Promise.all(endpoints.map(e => 
  fetch('http://localhost:3001' + e).then(r => ({endpoint: e, status: r.status}))
)).then(results => {
  console.table(results);
  const allSuccess = results.every(r => r.status === 200);
  console.log(allSuccess ? '✅ ALL PASS - All return 200' : '❌ SOME FAIL - Not all 200');
});
```

---

## 🔴 Test 5: Invalid Amount Validation (Login as admin first!)
```javascript
fetch('http://localhost:3001/api/expenses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ category: 'Test', amount: -100 })
})
  .then(r => r.json())
  .then(d => console.log(d.error?.includes('Invalid') ? '✅ PASS: Rejected negative amount' : '❌ FAIL:', d))
```

---

## 🔴 Test 6: Invalid Log Type (Login as admin first!)
```javascript
fetch('http://localhost:3001/api/inventory-logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ item_id: 'test', type: 'invalid', quantity: 10 })
})
  .then(r => r.json())
  .then(d => console.log(d.error?.includes('Invalid type') ? '✅ PASS: Rejected invalid type' : '❌ FAIL:', d))
```

---

## 🔴 Test 7: Invalid Recurrence (Login as admin first!)
```javascript
fetch('http://localhost:3001/api/reminders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test', recurrence: 'hourly', next_due_date: '2025-10-15' })
})
  .then(r => r.json())
  .then(d => console.log(d.error?.includes('Invalid recurrence') ? '✅ PASS: Rejected invalid recurrence' : '❌ FAIL:', d))
```

---

## 🔴 Test 8: User Cannot Access Other's Invoice (Login as user, replace IDs!)
```javascript
// Replace DIFFERENT_USER_ID with actual different user ID
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
  .then(d => console.log(d.error?.includes('only generate your own') ? '✅ PASS: Blocked cross-user access' : '❌ FAIL:', d))
```

---

## 🟢 Test 9: Admin Can Access Any Invoice (Login as admin, use any user ID!)
```javascript
// Replace ANY_USER_ID with any valid user ID
fetch('http://localhost:3001/api/invoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'ANY_USER_ID',
    userName: 'Any User',
    startDate: '2025-10-01',
    endDate: '2025-10-14'
  })
})
  .then(r => console.log('Status:', r.status, r.status === 200 ? '✅ PASS: Admin can access' : '❌ FAIL: Blocked'))
```

---

## 📊 Complete Test Suite (Run all at once!)
```javascript
async function runAllTests() {
  console.clear();
  console.log('🧪 Running Complete Test Suite...\n');
  
  const results = { passed: 0, failed: 0 };
  
  // Test 1: Unauthenticated APIs
  console.log('📋 Test 1: API Authentication...');
  const endpoints = ['/api/expenses', '/api/inventory-items', '/api/inventory-logs', '/api/revenue', '/api/reminders'];
  const authTests = await Promise.all(endpoints.map(e => 
    fetch('http://localhost:3001' + e).then(r => r.status)
  ));
  const allFail = authTests.every(s => s === 401 || s === 403);
  console.log(allFail ? '✅ PASS' : '❌ FAIL');
  allFail ? results.passed++ : results.failed++;
  
  // Test 2: Invalid input
  console.log('\n📋 Test 2: Input Validation...');
  const validationTest = await fetch('http://localhost:3001/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'Test', amount: -100 })
  }).then(r => r.status);
  const validationPass = validationTest === 400 || validationTest === 401;
  console.log(validationPass ? '✅ PASS' : '❌ FAIL');
  validationPass ? results.passed++ : results.failed++;
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${results.passed + results.failed} | Passed: ${results.passed} | Failed: ${results.failed}`);
  console.log('='.repeat(50));
}

runAllTests();
```

---

## 🎯 Quick Status Check
```javascript
// Check what user you're logged in as
fetch('http://localhost:3001/api/expenses')
  .then(r => r.json())
  .then(d => {
    if (d.error?.includes('Unauthorized')) console.log('🔴 Not logged in');
    else if (d.error?.includes('Forbidden')) console.log('🟡 Logged in as USER');
    else if (Array.isArray(d) || d.length >= 0) console.log('🟢 Logged in as ADMIN');
    else console.log('❓ Unknown status:', d);
  })
```

---

## 📝 Get Current User Info
```javascript
// Check authentication status
fetch('http://localhost:3001/api/admin/update-user', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'test', updateData: {} })
})
  .then(r => r.json())
  .then(d => {
    if (d.error?.includes('Unauthorized')) console.log('🔴 Not authenticated');
    else if (d.error?.includes('Insufficient permissions')) console.log('🟡 USER role');
    else console.log('🟢 ADMIN role');
  })
```

---

## 🎨 Pretty Results Table
```javascript
function testAPI(endpoint, expectedStatus, description) {
  return fetch('http://localhost:3001' + endpoint)
    .then(r => ({
      endpoint,
      description,
      expected: expectedStatus,
      actual: r.status,
      pass: r.status === expectedStatus ? '✅' : '❌'
    }));
}

Promise.all([
  testAPI('/api/expenses', 401, 'Expenses - No Auth'),
  testAPI('/api/inventory-items', 401, 'Inventory - No Auth'),
  testAPI('/api/revenue', 401, 'Revenue - No Auth'),
  testAPI('/api/reminders', 401, 'Reminders - No Auth')
]).then(results => {
  console.table(results);
  const allPass = results.every(r => r.pass === '✅');
  console.log(allPass ? '\n✅ ALL TESTS PASSED!' : '\n❌ SOME TESTS FAILED');
});
```

---

**HOW TO USE:**
1. Open browser to http://localhost:3001
2. Press F12 to open DevTools
3. Go to Console tab
4. Copy & paste any command above
5. Press Enter
6. Check results!

**Color Legend:**
- 🔴 Should fail (testing security)
- 🟡 Should block users (testing authorization)
- 🟢 Should succeed (testing admin access)
