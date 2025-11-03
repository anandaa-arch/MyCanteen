// Test Signup Functionality
// Open http://localhost:3000/signup and run this in the browser console

async function testSignup() {
  console.log('🧪 Testing Signup Functionality...\n');
  
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!',
    full_name: 'Test User',
    dept: 'Computer Science',
    year: '2025',
    contact_number: '9876543210'
  };
  
  try {
    console.log('📝 Creating test account with:', testUser);
    
    const response = await fetch('/api/create-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Signup successful!');
      console.log('Response:', data);
      console.log('\n📧 Test account created:');
      console.log('   Email:', testUser.email);
      console.log('   Password:', testUser.password);
      console.log('\n👉 You can now login with these credentials at /login');
    } else {
      console.log('❌ Signup failed!');
      console.log('Status:', response.status);
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Auto-run if loaded via script tag
if (typeof window !== 'undefined') {
  console.log('📋 Signup test script loaded. Run: testSignup()');
}
