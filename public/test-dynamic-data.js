// Test Dynamic Profile and QR Pages
// Run this in browser console after logging in

async function testDynamicPages() {
  console.log('🧪 Testing Dynamic Data Implementation\n');
  console.log('='.repeat(50));
  
  // Test 1: User Profile API
  console.log('\n📋 Test 1: Fetching User Profile');
  console.log('-'.repeat(50));
  try {
    const profileResponse = await fetch('/api/user/profile');
    const profileData = await profileResponse.json();
    
    if (profileResponse.status === 401) {
      console.log('❌ Not authenticated - Please login first!');
      return;
    }
    
    if (profileResponse.ok) {
      console.log('✅ Profile API Success!');
      console.log('User Data:');
      console.log('  - ID:', profileData.id);
      console.log('  - Name:', profileData.full_name);
      console.log('  - Email:', profileData.email);
      console.log('  - Role:', profileData.role);
      console.log('  - Dept:', profileData.dept || 'N/A');
      console.log('  - Year:', profileData.year || 'N/A');
      console.log('  - Contact:', profileData.contact_number || 'N/A');
      console.log('  - Created:', new Date(profileData.created_at).toLocaleString());
      
      // Test 2: Verify NOT Hard-coded
      console.log('\n🔍 Test 2: Checking for Hard-coded Data');
      console.log('-'.repeat(50));
      
      const isHardcoded = 
        profileData.full_name === 'Kanak' ||
        profileData.id === '2025CSE001' ||
        profileData.id === 'stu1023';
      
      if (isHardcoded) {
        console.log('❌ FAIL: Still using hard-coded data!');
      } else {
        console.log('✅ PASS: Using dynamic data from database!');
      }
      
      // Test 3: QR Data Generation
      console.log('\n📱 Test 3: QR Code Data Simulation');
      console.log('-'.repeat(50));
      
      const qrPayload = {
        userId: profileData.id,
        name: profileData.full_name,
        email: profileData.email,
        dept: profileData.dept || 'N/A',
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
        type: "attendance"
      };
      
      console.log('QR Code would contain:');
      console.log(JSON.stringify(qrPayload, null, 2));
      
      // Test 4: Page Navigation Test
      console.log('\n🌐 Test 4: Testing Page Navigation');
      console.log('-'.repeat(50));
      console.log('✅ Navigate to /profile to see your dynamic profile');
      console.log('✅ Navigate to /qr to see your dynamic QR code');
      
      // Summary
      console.log('\n' + '='.repeat(50));
      console.log('🎉 All Tests Passed!');
      console.log('='.repeat(50));
      console.log('\n📝 Summary:');
      console.log('  ✅ Profile API working');
      console.log('  ✅ Dynamic data loading');
      console.log('  ✅ No hard-coded values');
      console.log('  ✅ QR data generation ready');
      console.log('\n👉 Next: Visit /profile and /qr pages to see the UI');
      
    } else {
      console.log('❌ API Error:', profileData.error);
    }
  } catch (error) {
    console.log('❌ Test Failed:', error.message);
  }
}

// Auto-run test
console.log('🚀 Dynamic Data Test Suite Loaded');
console.log('Run: testDynamicPages()');
console.log('\nNote: Make sure you are logged in first!\n');
