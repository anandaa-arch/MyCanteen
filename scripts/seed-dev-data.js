/**
 * MyCanteen Development Data Seeder
 * 
 * This script creates realistic test data for development
 * Run with: node scripts/seed-dev-data.js
 * 
 * Prerequisites:
 * 1. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local
 * 2. Ensure all database tables are created
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
console.log('🔍 Looking for .env.local at:', envPath);

if (fs.existsSync(envPath)) {
  console.log('✅ Found .env.local file');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
        console.log(`   Loaded: ${key}`);
      }
    }
  });
} else {
  console.error('❌ .env.local file not found at:', envPath);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Try both possible names for service key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('\n💡 Check your .env.local file at:', envPath);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test data configurations
const TEST_USERS = [
  { email: 'student1@test.com', fullName: 'Rahul Sharma', phone: '9876543210', role: 'user', dept: 'CS', year: 'TE' },
  { email: 'student2@test.com', fullName: 'Priya Patel', phone: '9876543211', role: 'user', dept: 'IT', year: 'SE' },
  { email: 'student3@test.com', fullName: 'Amit Kumar', phone: '9876543212', role: 'user', dept: 'MECH', year: 'BE' },
  { email: 'student4@test.com', fullName: 'Sneha Desai', phone: '9876543213', role: 'user', dept: 'CIVIL', year: 'FE' },
  { email: 'student5@test.com', fullName: 'Rohan Joshi', phone: '9876543214', role: 'user', dept: 'EXTC', year: 'TE' },
  { email: 'student6@test.com', fullName: 'Anjali Singh', phone: '9876543215', role: 'user', dept: 'CS', year: 'SE' },
  { email: 'student7@test.com', fullName: 'Vikram Mehta', phone: '9876543216', role: 'user', dept: 'IT', year: 'BE' },
  { email: 'student8@test.com', fullName: 'Neha Gupta', phone: '9876543217', role: 'user', dept: 'EE', year: 'TE' },
  { email: 'admin@test.com', fullName: 'Test Admin', phone: '9999999999', role: 'admin', dept: null, year: null },
];

const MENU_ITEMS = {
  day1: [
    { name: 'Paneer Butter Masala', description: 'with rice, roti, dal' },
    { name: 'Veg Biryani', description: 'with raita' },
    { name: 'Chole Bhature', description: '2 bhature with chole' },
  ],
  day2: [
    { name: 'Dal Tadka Thali', description: 'rice, roti, dal tadka, sabzi' },
    { name: 'Rajma Chawal', description: 'with salad' },
    { name: 'Pav Bhaji', description: '2 pav with bhaji' },
  ],
  day3: [
    { name: 'Veg Pulao', description: 'with raita and papad' },
    { name: 'Aloo Paratha', description: '2 parathas with curd' },
    { name: 'Sambar Rice', description: 'with vada' },
  ],
};

const INVENTORY_ITEMS = [
  { name: 'Lays Chips', category: 'Snacks', unit: 'pack', unitPrice: 10, sellingPrice: 15, stock: 50, supplier: 'PepsiCo' },
  { name: 'Parle-G Biscuits', category: 'Snacks', unit: 'pack', unitPrice: 5, sellingPrice: 8, stock: 100, supplier: 'Parle' },
  { name: 'Samosa', category: 'Snacks', unit: 'pcs', unitPrice: 8, sellingPrice: 12, stock: 30, supplier: 'Local Vendor' },
  { name: 'Chai (Tea)', category: 'Beverages', unit: 'cup', unitPrice: 5, sellingPrice: 10, stock: 0, supplier: 'Tea Stall' },
  { name: 'Coffee', category: 'Beverages', unit: 'cup', unitPrice: 8, sellingPrice: 15, stock: 0, supplier: 'Nescafe' },
  { name: 'Cold Drink', category: 'Beverages', unit: 'bottle', unitPrice: 20, sellingPrice: 30, stock: 40, supplier: 'Coca-Cola' },
  { name: 'Water Bottle', category: 'Beverages', unit: 'bottle', unitPrice: 10, sellingPrice: 15, stock: 100, supplier: 'Bisleri' },
  { name: 'Rice', category: 'Raw Materials', unit: 'kg', unitPrice: 45, sellingPrice: null, stock: 200, supplier: 'Grain Market' },
  { name: 'Wheat Flour', category: 'Raw Materials', unit: 'kg', unitPrice: 35, sellingPrice: null, stock: 150, supplier: 'Grain Market' },
  { name: 'Dal (Lentils)', category: 'Raw Materials', unit: 'kg', unitPrice: 80, sellingPrice: null, stock: 80, supplier: 'Grain Market' },
  { name: 'Cooking Oil', category: 'Raw Materials', unit: 'litre', unitPrice: 120, sellingPrice: null, stock: 50, supplier: 'Super Mart' },
  { name: 'Vegetables', category: 'Raw Materials', unit: 'kg', unitPrice: 30, sellingPrice: null, stock: 100, supplier: 'Vegetable Market' },
];

// Helper functions
const getToday = () => new Date().toISOString().split('T')[0];
const getDate = (daysOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();

async function seedUsers() {
  console.log('\n📝 Creating test users...');
  
  const results = [];
  
  for (const user of TEST_USERS) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'Test@123', // Default password for all test users
        email_confirm: true,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ⚠️  ${user.email} - already exists`);
          continue;
        }
        throw authError;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles_new')
        .insert({
          id: authData.user.id,
          email: user.email,
          full_name: user.fullName,
          contact_number: user.phone,
          role: user.role,
          dept: user.dept,
          year: user.year,
        });

      if (profileError && !profileError.message.includes('duplicate')) {
        throw profileError;
      }

      results.push({ email: user.email, userId: authData.user.id });
      console.log(`   ✅ ${user.email} - created (password: Test@123)`);
    } catch (error) {
      console.error(`   ❌ ${user.email} - ${error.message}`);
    }
  }

  return results;
}

async function seedMenu() {
  console.log('\n🍽️  Creating menu data...');

  const menus = [
    { date: getDate(-1), items: MENU_ITEMS.day3, description: 'South Indian special' },
    { date: getToday(), items: MENU_ITEMS.day1, description: 'Special lunch menu' },
    { date: getDate(1), items: MENU_ITEMS.day2, description: 'Regular menu' },
  ];

  for (const menu of menus) {
    const { error } = await supabase
      .from('menu')
      .upsert({
        date: menu.date,
        items: menu.items,
        description: menu.description,
      });

    if (error) {
      console.error(`   ❌ ${menu.date} - ${error.message}`);
    } else {
      console.log(`   ✅ Menu created for ${menu.date}`);
    }
  }
}

async function seedPollResponses(userIds) {
  console.log('\n📊 Creating poll responses...');

  if (userIds.length < 5) {
    console.log('   ⚠️  Need at least 5 users, skipping...');
    return;
  }

  const statuses = [
    'confirmed_attended',
    'confirmed_attended',
    'awaiting_admin_confirmation',
    'pending_customer_response',
    'no_show',
  ];

  const portions = ['full', 'full', 'half', 'full', 'full'];

  const responses = [];

  // Today's responses
  for (let i = 0; i < Math.min(5, userIds.length); i++) {
    responses.push({
      user_id: userIds[i],
      date: getToday(),
      present: i < 4, // First 4 are present
      portion_size: portions[i],
      confirmation_status: statuses[i],
    });
  }

  // Yesterday's responses (all confirmed)
  for (let i = 0; i < Math.min(3, userIds.length); i++) {
    responses.push({
      user_id: userIds[i],
      date: getDate(-1),
      present: true,
      portion_size: 'full',
      confirmation_status: 'confirmed_attended',
    });
  }

  const { error } = await supabase
    .from('poll_responses')
    .upsert(responses, { onConflict: 'user_id,date' });

  if (error) {
    console.error(`   ❌ ${error.message}`);
  } else {
    console.log(`   ✅ Created ${responses.length} poll responses`);
  }
}

async function seedBilling(userIds) {
  console.log('\n💰 Creating billing data...');

  if (userIds.length < 5) {
    console.log('   ⚠️  Need at least 5 users, skipping...');
    return;
  }

  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  const bills = [
    // Paid bills
    { userId: userIds[0], halfMeals: 0, fullMeals: 15, status: 'paid', paidAmount: 900 },
    { userId: userIds[1], halfMeals: 10, fullMeals: 5, status: 'paid', paidAmount: 750 },
    // Partial payment
    { userId: userIds[2], halfMeals: 5, fullMeals: 10, status: 'partial', paidAmount: 400 },
    // Pending
    { userId: userIds[3], halfMeals: 12, fullMeals: 3, status: 'pending', paidAmount: 0 },
    { userId: userIds[4], halfMeals: 0, fullMeals: 18, status: 'pending', paidAmount: 0 },
  ];

  for (const bill of bills) {
    const halfCost = bill.halfMeals * 45; // ₹45 per half meal
    const fullCost = bill.fullMeals * 60; // ₹60 per full meal
    const totalAmount = halfCost + fullCost;
    const dueAmount = totalAmount - bill.paidAmount;

    const { error } = await supabase
      .from('monthly_bills')
      .upsert({
        user_id: bill.userId,
        month: currentMonth,
        year: currentYear,
        half_meal_count: bill.halfMeals,
        full_meal_count: bill.fullMeals,
        half_meal_cost: halfCost,
        full_meal_cost: fullCost,
        total_amount: totalAmount,
        paid_amount: bill.paidAmount,
        due_amount: dueAmount,
        payment_status: bill.status,
      }, { onConflict: 'user_id,month,year' });

    if (error) {
      console.error(`   ❌ ${error.message}`);
    } else {
      console.log(`   ✅ Created bill for user (${bill.status})`);
    }
  }
}

async function seedInventory() {
  console.log('\n📦 Creating inventory items...');

  for (const item of INVENTORY_ITEMS) {
    const { error } = await supabase
      .from('inventory_items')
      .upsert({
        name: item.name,
        category: item.category,
        unit: item.unit,
        unit_price: item.unitPrice,
        selling_price: item.sellingPrice,
        current_stock: item.stock,
        supplier: item.supplier,
      }, { onConflict: 'name' });

    if (error) {
      console.error(`   ❌ ${item.name} - ${error.message}`);
    } else {
      console.log(`   ✅ ${item.name}`);
    }
  }
}

async function seedExpenses() {
  console.log('\n💸 Creating expense records...');

  const expenses = [
    { category: 'pantry', description: 'Monthly grocery purchase', amount: 15000, vendor: 'Super Mart', daysAgo: 5 },
    { category: 'utility', description: 'Electricity bill', amount: 3500, vendor: 'MSEB', daysAgo: 3 },
    { category: 'utility', description: 'Water bill', amount: 1200, vendor: 'Water Department', daysAgo: 7 },
    { category: 'maintenance', description: 'Kitchen equipment repair', amount: 2500, vendor: 'Service Center', daysAgo: 10 },
    { category: 'salary', description: 'Cook salary', amount: 18000, vendor: 'Staff', daysAgo: 1 },
    { category: 'other', description: 'Gas cylinder refill', amount: 1800, vendor: 'HP Gas', daysAgo: 8 },
  ];

  for (const expense of expenses) {
    const { error } = await supabase
      .from('expenses')
      .insert({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        vendor: expense.vendor,
        incurred_on: getDate(-expense.daysAgo),
      });

    if (error) {
      console.error(`   ❌ ${expense.description} - ${error.message}`);
    } else {
      console.log(`   ✅ ${expense.description}`);
    }
  }
}

async function seedRevenue() {
  console.log('\n💵 Creating revenue records...');

  const revenues = [
    { source: 'meal_sales', amount: 12500, date: getToday(), description: 'Daily meal sales' },
    { source: 'snack_sales', amount: 3200, date: getToday(), description: 'Snacks and beverages' },
    { source: 'meal_sales', amount: 11800, date: getDate(-1), description: 'Daily meal sales' },
    { source: 'snack_sales', amount: 2900, date: getDate(-1), description: 'Snacks and beverages' },
  ];

  for (const revenue of revenues) {
    const { error } = await supabase
      .from('revenue')
      .insert(revenue);

    if (error && !error.message.includes('duplicate')) {
      console.error(`   ❌ ${revenue.description} - ${error.message}`);
    } else {
      console.log(`   ✅ ${revenue.description} - ₹${revenue.amount}`);
    }
  }
}

async function main() {
  console.log('🚀 MyCanteen Development Data Seeder\n');
  console.log('This will create test data in your Supabase database.');
  console.log('⚠️  Make sure you are NOT using production database!\n');

  try {
    // Seed users first (we need their IDs)
    const createdUsers = await seedUsers();
    const userIds = createdUsers.map(u => u.userId);

    // Seed other data
    await seedMenu();
    await seedPollResponses(userIds);
    await seedBilling(userIds);
    await seedInventory();
    await seedExpenses();
    await seedRevenue();

    console.log('\n✅ Test data seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   • Users created: ${createdUsers.length}`);
    console.log(`   • Default password: Test@123`);
    console.log(`   • Menu items: 3 days`);
    console.log(`   • Poll responses: ${Math.min(8, userIds.length)}`);
    console.log(`   • Billing records: ${Math.min(5, userIds.length)}`);
    console.log(`   • Inventory items: ${INVENTORY_ITEMS.length}`);
    console.log(`   • Expense records: 6`);
    console.log(`   • Revenue records: 4\n`);

    console.log('🔐 Test User Credentials:');
    console.log('   Email: student1@test.com (or any student#@test.com)');
    console.log('   Password: Test@123\n');
    console.log('   Admin: admin@test.com / Test@123\n');

  } catch (error) {
    console.error('\n❌ Error during seeding:', error.message);
    process.exit(1);
  }
}

// Run the seeder
main();
