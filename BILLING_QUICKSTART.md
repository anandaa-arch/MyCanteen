# 🚀 QUICK START: Activate New Billing System

## Step 1: Create Database Table ⚡
**Copy and run this SQL in Supabase:**

1. Open Supabase Dashboard → SQL Editor
2. Open file: `MEAL_PAYMENTS_TABLE.sql`
3. Copy the entire content
4. Paste into SQL Editor
5. Click **Run**

Expected output: "Success. No rows returned"

## Step 2: Verify Table Creation ✅
Run this verification query:
```sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'meal_payments'
ORDER BY ordinal_position;
```

Should return 10 rows (id, poll_response_id, user_id, amount, payment_date, etc.)

## Step 3: Test User Billing Page 🧪
1. Start your dev server: `npm run dev`
2. Login as a student
3. Navigate to: `http://localhost:3001/user/billing`
4. You should see:
   - ✅ Stats cards showing 11 total meals
   - ✅ Table with all 11 meals listed
   - ✅ All meals showing "Unpaid" status (red)
   - ✅ Each meal showing date, type (Full/Half), and amount

## Step 4: Test Payment Recording (Admin Side)
**Note**: Admin payment recording still uses OLD system. For now, manually test:

### Manual Payment Test:
```sql
-- Insert a payment for one of your meals
INSERT INTO meal_payments (
  poll_response_id,  -- Replace with actual poll_response ID from your data
  user_id,           -- Your user ID
  amount,
  payment_method,
  notes
) VALUES (
  'paste-poll-response-id-here',
  'paste-your-user-id-here',
  60.00,
  'cash',
  'Test payment'
);
```

### Get Poll Response IDs:
```sql
SELECT 
  pr.id as poll_response_id,
  pr.date,
  pr.portion_size,
  CASE 
    WHEN pr.portion_size = 'full' THEN 60 
    ELSE 45 
  END as cost
FROM poll_responses pr
WHERE pr.user_id = 'your-user-id-here'
  AND pr.present = true
ORDER BY pr.date DESC
LIMIT 5;
```

## Step 5: Verify Payment Appears 🎉
1. Refresh user billing page
2. The meal you paid for should now show:
   - ✅ Green "Paid" badge
   - ✅ Payment date
   - ✅ Payment method (cash)
3. Stats should update:
   - Total Paid: ₹60.00
   - Outstanding Due: ₹555.00
   - Paid meals: 1 • Unpaid: 10

## Step 6: Test Duplicate Payment Prevention 🛡️
Try inserting a payment for the SAME meal again:
```sql
INSERT INTO meal_payments (
  poll_response_id,  -- Use SAME poll_response_id as before
  user_id,
  amount,
  payment_method
) VALUES (
  'same-poll-response-id',
  'your-user-id',
  60.00,
  'cash'
);
```

**Expected**: Error message "duplicate key value violates unique constraint"
**This proves**: One payment per meal is enforced! ✅

## 🎯 What's Working Now

✅ **User Side**:
- Individual meal listing (not monthly aggregation)
- Clear paid/unpaid status per meal
- Real-time stats updates
- No duplicate payment capability

❌ **Admin Side (Still TODO)**:
- Admin billing page still uses old monthly_bills system
- Need to update admin payment recording to use meal_payments
- Admin should record payments meal-by-meal, not monthly

## 📊 Expected Data for Your Account

Based on your screenshots:
- **Total Meals**: 11
- **Full Meals**: 8 × ₹60 = ₹480
- **Half Meals**: 3 × ₹45 = ₹135
- **Total Billed**: ₹615.00
- **Total Paid**: ₹0.00 (initially)
- **Outstanding Due**: ₹615.00

## 🐛 Troubleshooting

### Issue: No meals showing
**Check**: Do you have poll_responses with present=true?
```sql
SELECT COUNT(*) FROM poll_responses 
WHERE user_id = 'your-user-id' AND present = true;
```

### Issue: Error loading meals
**Check**: meal_payments table exists?
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'meal_payments'
);
```

### Issue: Payment not showing
**Check**: Payment record exists and matches user_id?
```sql
SELECT * FROM meal_payments 
WHERE user_id = 'your-user-id';
```

## 📝 Next Development Steps

1. ✅ **DONE**: User billing page redesign
2. ⏳ **TODO**: Update admin billing page to use meal_payments
3. ⏳ **TODO**: Create admin UI for recording payments meal-by-meal
4. ⏳ **TODO**: Add payment history/receipt generation
5. ⏳ **TODO**: Add export functionality (CSV/PDF)

## 🔗 Important Files

- `MEAL_PAYMENTS_TABLE.sql` - Database schema to run
- `BILLING_REDESIGN_COMPLETE.md` - Full documentation
- `/app/user/billing/page.js` - User billing page (redesigned)
- `/app/admin/billing/*` - Admin side (needs update)

---

**Questions?** Check `BILLING_REDESIGN_COMPLETE.md` for detailed explanation.
