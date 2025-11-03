# MyCanteen Test Data Sets 🧪

This directory contains scripts to populate your MyCanteen development environment with realistic test data.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Test Data Included](#test-data-included)
- [Usage Methods](#usage-methods)
- [Test User Credentials](#test-user-credentials)
- [Data Scenarios](#data-scenarios)

---

## 🎯 Overview

The test data sets provide:
- **10 Test Users** (9 students + 1 admin)
- **Poll Responses** with various confirmation statuses
- **Menu Items** for multiple days
- **Billing Records** (paid, partial, pending)
- **Inventory Items** across multiple categories
- **Expense & Revenue Records**

---

## 🚀 Quick Start

### Method 1: Node.js Script (Recommended)

```bash
# Install dependencies (if not already done)
npm install

# Set up environment variables
# Add these to .env.local:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_KEY=your_service_role_key

# Run the seeder
node scripts/seed-dev-data.js
```

### Method 2: SQL Script

```bash
# 1. Open Supabase Dashboard
# 2. Go to SQL Editor
# 3. Copy contents of seed-test-data.sql
# 4. Replace UUIDs with actual auth user IDs
# 5. Execute the script
```

---

## 📦 Test Data Included

### 👥 Users (10 total)

| Email | Name | Role | Department | Year | Phone |
|-------|------|------|------------|------|-------|
| student1@test.com | Rahul Sharma | user | CS | TE | 9876543210 |
| student2@test.com | Priya Patel | user | IT | SE | 9876543211 |
| student3@test.com | Amit Kumar | user | MECH | BE | 9876543212 |
| student4@test.com | Sneha Desai | user | CIVIL | FE | 9876543213 |
| student5@test.com | Rohan Joshi | user | EXTC | TE | 9876543214 |
| student6@test.com | Anjali Singh | user | CS | SE | 9876543215 |
| student7@test.com | Vikram Mehta | user | IT | BE | 9876543216 |
| student8@test.com | Neha Gupta | user | EE | TE | 9876543217 |
| admin@test.com | Test Admin | admin | - | - | 9999999999 |

**Default Password:** `Test@123` (for all users)

### 📊 Poll Responses

**Today's Polls:**
- 3 users with **confirmed_attended** status
- 2 users with **awaiting_admin_confirmation** status
- 2 users with **pending_customer_response** status
- 1 user with **no_show** status
- 2 users with **no response** (for testing empty state)

**Historical Data:**
- Yesterday's polls (3 users, all confirmed)
- Last week's polls (3 users, mixed portions)

### 🍽️ Menu Items

**Today's Menu:**
```json
[
  { "name": "Paneer Butter Masala", "description": "with rice, roti, dal" },
  { "name": "Veg Biryani", "description": "with raita" },
  { "name": "Chole Bhature", "description": "2 bhature with chole" }
]
```

**Tomorrow's Menu:**
```json
[
  { "name": "Dal Tadka Thali", "description": "rice, roti, dal tadka, sabzi" },
  { "name": "Rajma Chawal", "description": "with salad" },
  { "name": "Pav Bhaji", "description": "2 pav with bhaji" }
]
```

**Yesterday's Menu:** South Indian special items

### 💰 Billing Records

**Current Month:**
- 2 users: **Fully paid** (₹900, ₹750)
- 2 users: **Partial payment** (₹425 due, ₹540 due)
- 4 users: **Pending payment** (₹720-₹1080 due)

**Pricing:**
- Half meal: ₹45
- Full meal: ₹60

### 📦 Inventory Items (12 items)

**Snacks (3 items):**
- Lays Chips (50 packs)
- Parle-G Biscuits (100 packs)
- Samosa (30 pcs)

**Beverages (4 items):**
- Chai/Coffee (made to order)
- Cold Drink (40 bottles)
- Water Bottle (100 bottles)

**Raw Materials (5 items):**
- Rice (200 kg)
- Wheat Flour (150 kg)
- Dal (80 kg)
- Cooking Oil (50 litres)
- Vegetables (100 kg)

### 💸 Expenses (6 records)

| Category | Description | Amount | Vendor |
|----------|-------------|--------|--------|
| pantry | Monthly grocery | ₹15,000 | Super Mart |
| utility | Electricity bill | ₹3,500 | MSEB |
| utility | Water bill | ₹1,200 | Water Dept |
| maintenance | Equipment repair | ₹2,500 | Service Center |
| salary | Cook salary | ₹18,000 | Staff |
| other | Gas cylinder | ₹1,800 | HP Gas |

### 💵 Revenue (4 records)

| Source | Amount | Date | Description |
|--------|--------|------|-------------|
| meal_sales | ₹12,500 | Today | Daily meal sales |
| snack_sales | ₹3,200 | Today | Snacks & beverages |
| meal_sales | ₹11,800 | Yesterday | Daily meal sales |
| snack_sales | ₹2,900 | Yesterday | Snacks & beverages |

---

## 🔐 Test User Credentials

### Login as Student
```
Email: student1@test.com (or student2, student3, etc.)
Password: Test@123
```

**Available Features:**
- ✅ View today's menu
- ✅ Submit poll responses
- ✅ View billing history
- ✅ Check attendance
- ✅ Update profile

### Login as Admin
```
Email: admin@test.com
Password: Test@123
```

**Available Features:**
- ✅ Manage all users
- ✅ View/confirm poll responses
- ✅ Manage billing & payments
- ✅ Create/update menu
- ✅ Manage inventory
- ✅ Track expenses & revenue

---

## 🎬 Data Scenarios

### Scenario 1: Poll Confirmation Flow

1. Login as **student4@test.com**
2. Submit poll: "Yes, Full Portion"
3. Status: **awaiting_admin_confirmation**
4. Login as **admin@test.com**
5. Go to Admin → Polls
6. Confirm student4's attendance
7. Login back as student4
8. See updated status instantly (real-time sync ⚡)

### Scenario 2: Billing & Payment

1. Login as **admin@test.com**
2. Go to Admin → Billing
3. Find **student5** (₹720 pending)
4. Click "Record Payment"
5. Enter amount: ₹720
6. Select payment method: UPI
7. Confirm payment
8. Status changes to **paid** ✅

### Scenario 3: Inventory Management

1. Login as **admin@test.com**
2. Go to Inventory
3. Find "Lays Chips" (50 in stock)
4. Click "Update Stock"
5. Add 30 more packs
6. Stock updates to 80
7. Add expense record for purchase

### Scenario 4: Menu Planning

1. Login as **admin@test.com**
2. Go to Menu Management
3. Create tomorrow's menu:
   - Item 1: Pav Bhaji
   - Item 2: Veg Fried Rice
   - Item 3: Paneer Sandwich
4. Save menu
5. Login as student → see tomorrow's menu

---

## ⚠️ Important Notes

### Before Running Seeder:

1. **Backup your data** (if any exists)
2. **Verify environment variables** in `.env.local`
3. **Ensure you're NOT using production database**
4. **Check Supabase RLS policies** are properly configured

### After Running Seeder:

1. **Verify data** in Supabase Dashboard
2. **Test login** with any test user
3. **Check real-time updates** by opening multiple browser tabs
4. **Test CRUD operations** on each module

### Clean Up Test Data:

```sql
-- Run in Supabase SQL Editor to clean up
DELETE FROM poll_responses WHERE user_id IN (
  SELECT id FROM profiles_new WHERE email LIKE '%@test.com'
);
DELETE FROM monthly_bills WHERE user_id IN (
  SELECT id FROM profiles_new WHERE email LIKE '%@test.com'
);
DELETE FROM profiles_new WHERE email LIKE '%@test.com';
-- Then delete auth users manually from Supabase Auth dashboard
```

---

## 🐛 Troubleshooting

### "Missing environment variables"
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
- Check `.env.local` file exists in project root

### "User already exists"
- Test users already created (this is OK)
- Script will skip existing users and continue

### "Permission denied"
- Check your service role key has admin privileges
- Verify RLS policies allow service role access

### "Real-time not working"
- Enable Realtime in Supabase dashboard
- Check `poll_responses` table has replication enabled
- Verify WebSocket connection in browser console

---

## 📚 Related Documentation

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [MyCanteen CI/CD Setup](.github/workflows/README.md)

---

## 🤝 Contributing

To add more test scenarios:

1. Edit `seed-dev-data.js` with new data
2. Add corresponding SQL in `seed-test-data.sql`
3. Update this README with new scenarios
4. Test thoroughly before committing

---

**Last Updated:** October 2025  
**Maintained By:** MyCanteen Development Team
