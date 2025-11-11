# Test Data Quick Reference 📋

## 🚀 Getting Started

### 1. Run the Seeder

```bash
npm run seed
```

### 2. Login with Test Accounts

**Student Account:**
```
Email: student1@test.com
Password: Test@123
```

**Admin Account:**
```
Email: admin@test.com
Password: Test@123
```

---

## 📊 Data Overview

### Test Users (10 total)
- **9 Students** (student1@test.com - student9@test.com)
- **1 Admin** (admin@test.com)
- All passwords: `Test@123`

### Today's Data
- ✅ 3 confirmed attendees
- ⏳ 2 awaiting admin confirmation
- 📝 2 pending customer response
- ❌ 1 no-show
- 🔘 2 no response

### Billing Status (Current Month)
- ✅ **Paid:** 2 users (₹900, ₹750)
- ⚠️ **Partial:** 2 users (₹425 due, ₹540 due)
- ❌ **Pending:** 4 users (₹720-₹1080 due)

### Inventory
- 🍿 **Snacks:** 3 items (180 units)
- 🥤 **Beverages:** 4 items (140 units)
- 🌾 **Raw Materials:** 5 items (580 kg/L)

---

## 🎬 Test Scenarios

### Test Real-Time Poll Updates ⚡
1. Open two browsers (or incognito)
2. Browser 1: Login as **student4@test.com** → Submit poll
3. Browser 2: Login as **admin@test.com** → See instant notification
4. Browser 2: Confirm attendance
5. Browser 1: See instant status update

### Test Payment Flow 💰
1. Login as **admin@test.com**
2. Go to Admin → Billing
3. Find user with pending payment
4. Click "Record Payment"
5. Enter amount and payment method
6. Verify status changes to "paid"

### Test Inventory Update 📦
1. Login as **admin@test.com**
2. Go to Inventory
3. Update stock for "Lays Chips"
4. Add stock: +30 packs
5. Record expense for purchase
6. Verify stock level updated

---

## 🔍 Database Queries

### Check Seeded Data

```sql
-- Count users by role
SELECT role, COUNT(*) FROM profiles_new GROUP BY role;

-- Today's poll responses
SELECT confirmation_status, COUNT(*) 
FROM poll_responses 
WHERE date = CURRENT_DATE 
GROUP BY confirmation_status;

-- Billing summary
SELECT payment_status, COUNT(*), SUM(due_amount) as total_due
FROM monthly_bills
WHERE month = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY payment_status;

-- Inventory by category
SELECT category, COUNT(*), SUM(current_stock)
FROM inventory_items
GROUP BY category;
```

---

## 🧹 Clean Up Test Data

```sql
-- WARNING: This will delete ALL test data!

-- Delete poll responses for test users
DELETE FROM poll_responses 
WHERE user_id IN (
  SELECT id FROM profiles_new WHERE email LIKE '%@test.com'
);

-- Delete bills for test users
DELETE FROM monthly_bills 
WHERE user_id IN (
  SELECT id FROM profiles_new WHERE email LIKE '%@test.com'
);

-- Delete test profiles
DELETE FROM profiles_new WHERE email LIKE '%@test.com';

-- Then manually delete auth users from Supabase Dashboard
-- Go to: Authentication → Users → Delete test users
```

---

## 📞 Support

Issues? Check:
1. Environment variables in `.env.local`
2. Supabase service role key is valid
3. All database tables exist
4. RLS policies allow service role access

For more details, see: `scripts/README.md`
