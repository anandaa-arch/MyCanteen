# 🎯 EXACT SQL TO RUN RIGHT NOW

## Your Current Situation

✅ Steps 1-3 completed (columns added, data migrated)  
⏳ Steps 4-7 remaining (constraint, indexes, verification)

---

## Copy This Exact SQL and Run It

**Go to**: Supabase → SQL Editor → New Query

**Paste this entire block**:

```sql
-- Step 4: Add the new constraint
ALTER TABLE public.poll_responses
ADD CONSTRAINT poll_responses_confirmation_status_check CHECK (
    confirmation_status IN (
        'pending_customer_response',
        'awaiting_admin_confirmation',
        'confirmed_attended',
        'no_show',
        'rejected',
        'cancelled'
    )
);

-- Step 5: Update default value
ALTER TABLE public.poll_responses
ALTER COLUMN confirmation_status SET DEFAULT 'pending_customer_response';

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_poll_responses_attended_at 
ON public.poll_responses(attended_at);

CREATE INDEX IF NOT EXISTS idx_poll_responses_confirmation_status 
ON public.poll_responses(confirmation_status);

-- Step 7: Verify the migration worked
SELECT 
  'Total Records' as check_type, 
  COUNT(*) as count 
FROM public.poll_responses

UNION ALL

SELECT 
  'Status: ' || confirmation_status as check_type,
  COUNT(*) as count
FROM public.poll_responses
GROUP BY confirmation_status
ORDER BY check_type;
```

**Then click**: Run (CTRL+Enter)

---

## What You'll See

### If Successful ✅

```
Results showing:
┌─────────────────────────────────────┬───────┐
│ check_type                          │ count │
├─────────────────────────────────────┼───────┤
│ Status: awaiting_admin_confirmation │   0   │
│ Status: cancelled                   │   0   │
│ Status: confirmed_attended          │   3   │
│ Status: no_show                     │   0   │
│ Status: pending_customer_response   │   X   │
│ Status: rejected                    │   2   │
│ Total Records                       │   5   │
└─────────────────────────────────────┴───────┘
```

**This means**: ✅ Migration successful!

---

## If Something Goes Wrong

### Error: "constraint already exists"
- Don't worry, it's safe. Just run it again.
- The `IF NOT EXISTS` will prevent duplicates.

### Error: "check constraint violated"
- This shouldn't happen, but if it does:
- Some records still have invalid status values
- Run this to check:

```sql
SELECT DISTINCT confirmation_status FROM public.poll_responses;
```

Should only show these 6 values:
- pending_customer_response
- awaiting_admin_confirmation
- confirmed_attended
- no_show
- rejected
- cancelled

---

## Next Steps After This Works

1. ✅ Run the SQL above
2. ✅ See the verification output
3. 👉 Test in your app:
   - Customer submits poll
   - Customer clicks "Mark as Attending Now"
   - Admin sees it in table
   - Admin clicks "Confirm" → Modal opens
   - Admin chooses action
   - Status updates!

---

## 🚀 DO THIS NOW

1. Copy the SQL above
2. Paste in Supabase SQL Editor
3. Click Run
4. Check the results
5. Reply when done! ✅

**This is the final step before testing!**
