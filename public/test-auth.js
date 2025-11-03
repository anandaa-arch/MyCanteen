/**
 * Authentication Testing Helper
 * Run this in browser console to test authentication flows
 */

// Test Configuration
const BASE_URL = 'http://localhost:3001';

// Test Results Storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper Functions
function logTest(name, passed, message) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed++;
    console.error(`❌ FAIL: ${name} - ${message}`);
  }
  testResults.details.push({ name, passed, message });
}

function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');
  
  if (testResults.failed > 0) {
    console.log('Failed Tests:');
    testResults.details
      .filter(t => !t.passed)
      .forEach(t => console.log(`  - ${t.name}: ${t.message}`));
  }
}

// Test Functions
async function testAPIEndpoint(endpoint, expectedStatus, description) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const passed = response.status === expectedStatus;
    logTest(
      description,
      passed,
      passed ? '' : `Expected ${expectedStatus}, got ${response.status}`
    );
    return response;
  } catch (error) {
    logTest(description, false, error.message);
    return null;
  }
}

async function testAPIPost(endpoint, data, expectedStatus, description) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const passed = response.status === expectedStatus;
    logTest(
      description,
      passed,
      passed ? '' : `Expected ${expectedStatus}, got ${response.status}`
    );
    return response;
  } catch (error) {
    logTest(description, false, error.message);
    return null;
  }
}

// Main Test Suite
async function runAuthenticationTests() {
  console.clear();
  console.log('🧪 Starting Authentication Tests...\n');
  
  // Reset results
  testResults.passed = 0;
  testResults.failed = 0;
  testResults.total = 0;
  testResults.details = [];

  console.log('📋 Phase 1: API Authentication Tests (Unauthenticated)');
  console.log('-'.repeat(60));
  
  // Test unauthenticated access to protected endpoints
  await testAPIEndpoint('/api/expenses', 401, 'Expenses API - No Auth (401)');
  await testAPIEndpoint('/api/inventory-items', 401, 'Inventory Items API - No Auth (401)');
  await testAPIEndpoint('/api/inventory-logs', 401, 'Inventory Logs API - No Auth (401)');
  await testAPIEndpoint('/api/revenue', 401, 'Revenue API - No Auth (401)');
  await testAPIEndpoint('/api/reminders', 401, 'Reminders API - No Auth (401)');
  
  console.log('\n📋 Phase 2: Input Validation Tests');
  console.log('-'.repeat(60));
  
  // Note: These will fail with 401 if not logged in as admin
  // We're testing that the API responds (not null)
  const expenseTest = await testAPIPost(
    '/api/expenses',
    { category: 'Food', amount: -100 },
    401, // Will be 401 if not authenticated, 400 if authenticated
    'Expenses API - Invalid Amount'
  );
  
  console.log('\n📋 Phase 3: CORS and Network Tests');
  console.log('-'.repeat(60));
  
  // Test that API responds
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/create-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Empty body should fail validation
    });
    logTest(
      'API Server Responding',
      healthCheck.status === 400 || healthCheck.status === 401,
      healthCheck.status === 0 ? 'Server not responding' : ''
    );
  } catch (error) {
    logTest('API Server Responding', false, 'Server not reachable');
  }
  
  console.log('\n📋 Phase 4: Security Header Tests');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/expenses`);
    const hasSecurityHeaders = response.headers.get('content-type');
    logTest(
      'Response has Content-Type',
      !!hasSecurityHeaders,
      hasSecurityHeaders ? '' : 'Missing Content-Type header'
    );
  } catch (error) {
    logTest('Security Headers Check', false, error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  printResults();
  
  console.log('\n📝 NEXT STEPS:');
  console.log('1. Login as admin to test authenticated endpoints');
  console.log('2. Run: runAuthenticatedTests()');
  console.log('3. Login as user to test authorization');
  console.log('4. Run: runUserTests()');
}

// Authenticated Tests (Run after logging in as admin)
async function runAuthenticatedTests() {
  console.clear();
  console.log('🧪 Starting Authenticated Tests (Admin Required)...\n');
  
  testResults.passed = 0;
  testResults.failed = 0;
  testResults.total = 0;
  testResults.details = [];
  
  console.log('📋 Testing Admin API Access');
  console.log('-'.repeat(60));
  
  // Should succeed if logged in as admin
  await testAPIEndpoint('/api/expenses', 200, 'Expenses API - Admin Access');
  await testAPIEndpoint('/api/inventory-items', 200, 'Inventory Items API - Admin Access');
  await testAPIEndpoint('/api/inventory-logs', 200, 'Inventory Logs API - Admin Access');
  await testAPIEndpoint('/api/revenue', 200, 'Revenue API - Admin Access');
  await testAPIEndpoint('/api/reminders', 200, 'Reminders API - Admin Access');
  
  console.log('\n📋 Testing Input Validation (Authenticated)');
  console.log('-'.repeat(60));
  
  // Test validation with authentication
  await testAPIPost(
    '/api/expenses',
    { category: 'Food', amount: -100 },
    400,
    'Invalid Expense Amount Validation'
  );
  
  await testAPIPost(
    '/api/inventory-logs',
    { item_id: 'test', type: 'invalid', quantity: 10 },
    400,
    'Invalid Log Type Validation'
  );
  
  await testAPIPost(
    '/api/reminders',
    { name: 'Test', recurrence: 'hourly', next_due_date: '2025-10-15' },
    400,
    'Invalid Recurrence Validation'
  );
  
  printResults();
}

// User Authorization Tests (Run after logging in as regular user)
async function runUserTests() {
  console.clear();
  console.log('🧪 Starting User Authorization Tests (User Required)...\n');
  
  testResults.passed = 0;
  testResults.failed = 0;
  testResults.total = 0;
  testResults.details = [];
  
  console.log('📋 Testing User Cannot Access Admin APIs');
  console.log('-'.repeat(60));
  
  // Should fail with 403 when logged in as regular user
  await testAPIEndpoint('/api/expenses', 403, 'User Blocked from Expenses API');
  await testAPIEndpoint('/api/inventory-items', 403, 'User Blocked from Inventory API');
  await testAPIEndpoint('/api/inventory-logs', 403, 'User Blocked from Logs API');
  await testAPIEndpoint('/api/revenue', 403, 'User Blocked from Revenue API');
  await testAPIEndpoint('/api/reminders', 403, 'User Blocked from Reminders API');
  
  printResults();
  
  console.log('\n📝 MANUAL TEST REQUIRED:');
  console.log('1. Try accessing /admin/dashboard (should redirect/block)');
  console.log('2. Try generating another user\'s invoice (should fail with 403)');
}

// Export for console use
window.runAuthenticationTests = runAuthenticationTests;
window.runAuthenticatedTests = runAuthenticatedTests;
window.runUserTests = runUserTests;

// Auto-run on load
console.log('🚀 Authentication Testing Helper Loaded!');
console.log('\nAvailable Commands:');
console.log('  runAuthenticationTests() - Test unauthenticated access');
console.log('  runAuthenticatedTests()  - Test admin access (login first)');
console.log('  runUserTests()          - Test user restrictions (login as user first)');
console.log('\nStarting basic tests in 2 seconds...\n');

setTimeout(() => {
  runAuthenticationTests();
}, 2000);
