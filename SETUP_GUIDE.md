# 📋 Complete Setup Guide: Two-Step Poll Confirmation

## Current Status

✅ **Code**: All done (API endpoints + UI components)  
❌ **Database**: Migration failed (constraint error)  
⏳ **Next Action**: Run corrected migration script

---

## 🚀 Quick Start (3 Steps)

### Step 1: Fix the Database
1. Open Supabase → SQL Editor
2. Copy ALL SQL from: **`FIXED_MIGRATION.sql`**
3. Paste and Run
4. Look for output showing status counts (means it worked)

### Step 2: Verify Migration
1. Copy ALL SQL from: **`SIMPLE_VERIFICATION.sql`**
2. Paste and Run
3. Should see your columns and statuses

### Step 3: Test in Your App
1. Customer logs in, submits poll
2. Customer sees "Mark as Attending Now" button
3. Admin sees "⏳ Awaiting Confirmation" status
4. Admin clicks "Confirm" → Modal appears
5. Admin chooses action → Done!

---

## 📁 Files Created

### Database Migration
```
❌ RUN_THIS_IN_SUPABASE.sql (old, had issues)
✅ FIXED_MIGRATION.sql (use this instead!)
✅ SIMPLE_VERIFICATION.sql (verify it worked)
✅ TROUBLESHOOTING_GUIDE.md (help if issues)
```

### API Endpoints
```
✅ /app/api/polls/[id]/mark-attended/route.js
✅ /app/api/polls/[id]/confirm/route.js
```

### UI Components (Updated)
```
✅ /app/admin/polls/components/PollResponseTable.js
✅ /app/user/dashboard/components/TodaysPollStatus.js
```

### Documentation
```
📖 IMPLEMENTATION_COMPLETE_SUMMARY.md
📖 BEFORE_AFTER_COMPARISON.md
📖 PART1_SCHEMA_UPDATE_GUIDE.md
```

---

## 🔄 Workflow After Setup

### Customer Journey
```
1. Submits poll: "I will attend, Full Plate"
   Status: ✏️ pending_customer_response

2. At lunch time, clicks "Mark as Attending Now"
   Status: ⏳ awaiting_admin_confirmation
   attended_at: (timestamp recorded)

3. Admin verifies and confirms
   Status: ✅ confirmed_attended
   confirmed_by: (admin name)
   confirmed_at: (timestamp)

4. Billing system generates invoice
   Only bills confirmed_attended statuses
```

### Admin Dashboard Actions
```
- See table with all poll responses
- Filter by status
- Click "Confirm" for awaiting confirmations
- Modal opens with 3 buttons:
  ✅ Confirm Attended
  ❌ No Show  
  🚫 Reject
- Add optional notes
- Status updates immediately
```

---

## 📊 New Database Schema

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References auth.users |
| `date` | DATE | Poll date |
| `present` | BOOLEAN | (deprecated) |
| `portion_size` | TEXT | 'full' or 'half' |
| **`attended_at`** | TIMESTAMPTZ | When customer marked attending |
| `confirmation_status` | TEXT | 6 possible states |
| `confirmed_by` | UUID | Which admin confirmed |
| `confirmed_at` | TIMESTAMPTZ | When admin confirmed |
| **`admin_notes`** | TEXT | Admin explanation |
| `created_at` | TIMESTAMPTZ | Record created |
| `updated_at` | TIMESTAMPTZ | Last update |

### 6 Status Values
```
pending_customer_response      → Waiting for customer to respond
awaiting_admin_confirmation   → Waiting for admin to verify
confirmed_attended            → ✅ Confirmed they ate
no_show                       → ❌ Said yes but didn't come
rejected                      → 🚫 Admin rejected
cancelled                     → 📵 Customer cancelled
```

---

## 🧪 Testing the Complete Flow

### Test 1: Customer Marks Attending
```bash
curl -X PUT http://localhost:3000/api/polls/{id}/mark-attended \
  -H "Content-Type: application/json" \
  -d '{"action": "mark_attended"}'

# Response: Status changes to awaiting_admin_confirmation
```

### Test 2: Admin Confirms
```bash
curl -X PUT http://localhost:3000/api/polls/{id}/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "action": "confirm_attended",
    "admin_notes": "Verified in person"
  }'

# Response: Status changes to confirmed_attended
```

### Test 3: Check in Supabase
```sql
SELECT id, user_id, confirmation_status, attended_at, confirmed_by, admin_notes
FROM public.poll_responses
WHERE user_id = '{customer_id}'
ORDER BY date DESC LIMIT 1;

-- Should show: attended_at and confirmed_by populated
```

---

## ❓ Troubleshooting

### "Column does not exist" error
→ Migration hasn't run yet. Run `FIXED_MIGRATION.sql`

### "Constraint violated" error
→ Old data incompatible. Run `FIXED_MIGRATION.sql` (it fixes this)

### "Ambiguous column" error
→ Use `SIMPLE_VERIFICATION.sql` instead

### "Mark as Attending" button not showing
→ Check if customer is logged in and has a poll response

### Admin "Confirm" button not working
→ Check admin user has `role = 'admin'` in profiles_new table

---

## ✅ Checklist Before Going Live

- [ ] Run `FIXED_MIGRATION.sql` in Supabase
- [ ] Run `SIMPLE_VERIFICATION.sql` to confirm
- [ ] Test customer marking as attended
- [ ] Test admin confirmation with modal
- [ ] Verify statuses update in database
- [ ] Check billing only charges confirmed_attended
- [ ] Test all 3 admin actions (Attended, No Show, Reject)
- [ ] Verify admin notes are saved
- [ ] Check audit trail (confirmed_by, confirmed_at timestamps)

---

## 🎯 Success Indicators

✅ When it's working, you'll see:
1. Customer dashboard shows "Mark as Attending Now" button
2. Admin table shows "⏳ Awaiting Confirmation" status
3. Admin clicks "Confirm" → Modal appears
4. Modal has 3 action buttons + notes field
5. After action → Status updates + color changes
6. Database has timestamps and admin info
7. Billing system only bills confirmed attendees

---

## 📞 Quick Reference

| Need | File |
|------|------|
| Fix database | `FIXED_MIGRATION.sql` |
| Verify database | `SIMPLE_VERIFICATION.sql` |
| Help with errors | `TROUBLESHOOTING_GUIDE.md` |
| How it works | `IMPLEMENTATION_COMPLETE_SUMMARY.md` |
| What changed | `BEFORE_AFTER_COMPARISON.md` |

---

## 🚀 Next Action

**RIGHT NOW:**
1. Go to Supabase SQL Editor
2. Copy from: `FIXED_MIGRATION.sql`
3. Paste and Run
4. When done, come back and test!

You're almost there! 🎉
