# 🔧 Troubleshooting: Constraint Violation Error

## ❌ Error You Got:
```
ERROR: 23514: check constraint "poll_responses_confirmation_status_check" 
of relation "poll_responses" is violated by some row
```

## 🤔 Why It Happened:
Your table has old data with status values like `'pending'` or `'confirmed'` that don't match the NEW constraint which only allows:
- `pending_customer_response`
- `awaiting_admin_confirmation`
- `confirmed_attended`
- `no_show`
- `rejected`
- `cancelled`

The migration tried to ADD the new constraint WITHOUT converting the old data first. **Bad order!**

---

## ✅ Solution: Use FIXED_MIGRATION.sql (All Steps)

This script does things in the RIGHT order:

```
1. Add new columns ✅
2. DROP old constraint (remove it first!) ✅
3. Convert old data to new status values ✅
4. NOW add new constraint (data is valid!) ✅
5. Update defaults ✅
6. Create indexes ✅
7. Verify ✅
```

### Method A: Run All at Once (Recommended)
1. Go to Supabase SQL Editor
2. Copy **ALL** SQL from: `FIXED_MIGRATION.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Should show success with status counts at bottom

### Method B: If You Already Ran Steps 1-3
If you already ran FIXED_MIGRATION.sql once and it partially worked:

1. Go to Supabase SQL Editor
2. Copy ALL SQL from: `REMAINING_STEPS.sql` ← NEW FILE!
3. Paste into SQL Editor
4. Click **Run**
5. You should see at the bottom:
   ```
   check_type                          | count
   Status: confirmed_attended          | 3
   Status: rejected                    | 2
   Status: pending_customer_response   | X
   Total Records                       | 5
   ```

That means it worked! ✅

---

## 🔍 If It Still Fails

Run this to see what old status values are causing issues:

```sql
SELECT DISTINCT confirmation_status, COUNT(*)
FROM public.poll_responses
GROUP BY confirmation_status;
```

If you see values OTHER than the 6 new ones, that's the problem.

---

## ✨ After FIXED_MIGRATION.sql Works

Run `SIMPLE_VERIFICATION.sql` to confirm everything:
- New columns exist
- All statuses are valid
- Indexes created
- Sample record looks good

---

## 📝 Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Constraint violation | Old data doesn't match new constraint | Run FIXED_MIGRATION.sql |
| Check if columns exist | Migration incomplete | Run SIMPLE_VERIFICATION.sql |
| Ambiguous column error | Query writing issue | Use simplified queries in SIMPLE_VERIFICATION.sql |

**Current Status**: 
- ❌ Database migration FAILED (constraint error)
- ✅ Code is ready (API + UI components)
- 👉 **NEXT**: Run FIXED_MIGRATION.sql

Go ahead! Run it now! 🚀
