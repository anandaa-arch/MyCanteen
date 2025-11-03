# Quick Start Guide: Test the New Poll Workflow

## Prerequisites

✅ All code files are already in place
✅ API endpoints created
✅ UI components updated
⏳ **Database schema needs to be updated** (still needed)

---

## Step 1: Update Your Database Schema (REQUIRED)

### Option A: You have existing poll_responses data
```bash
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire contents of: MIGRATION_poll_responses_v2.sql
4. Paste into SQL Editor
5. Click "Run"
6. Wait for completion
```

### Option B: Fresh database (no existing data)
```bash
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire contents of: poll_responses_table.sql
4. Paste into SQL Editor
5. Click "Run"
6. Wait for completion
```

### Verify the migration worked:
```sql
-- Run this query in Supabase SQL Editor
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'poll_responses'
ORDER BY ordinal_position;

-- Should show these new columns:
-- - attended_at (timestamp with time zone)
-- - admin_notes (text)
```

---

## Step 2: Restart Your App

```bash
# Stop the running app (Ctrl + C)
# Then restart:
npm run dev

# Should compile without errors
```

---

## Step 3: Test as Customer

### Login as Customer
1. Go to `http://localhost:3000/login`
2. Login with a customer account (non-admin)

### Create Poll Response
1. Navigate to `/user/dashboard`
2. Look for "Today's Poll Response" section
3. If no response yet, click "Update Response" button
4. Select "Yes, I will attend" and "Full Plate"
5. Click Submit

### Expected Result
- Status shows: "✏️ Pending Response"
- Button appears: "Mark as Attending Now"

### Mark as Attending
1. Click "Mark as Attending Now"
2. Wait for confirmation message

### Expected Result
- Status changes to: "⏳ Awaiting Admin Confirmation"
- Message shows: "You marked as attending. Admin will confirm soon."
- `attended_at` timestamp recorded in database

---

## Step 4: Test as Admin

### Login as Admin
1. Go to `http://localhost:3000/logout` (logout customer)
2. Go to `http://localhost:3000/login`
3. Login with admin account (email: `admin@test.com` or similar)

### View Poll Responses
1. Navigate to `/admin/polls`
2. You should see the customer's response in the table
3. Look for status: "⏳ Awaiting Confirmation" (yellow badge)

### Confirm Attendance
1. Scroll right to "Actions" column
2. Click "Confirm" button
3. Modal opens with three options:
   - ✅ Attended
   - ❌ No Show
   - 🚫 Reject

### Option 1: Confirm Attended (Success Path)
1. Click "✅ Attended" button
2. (Optional) Add notes like "Confirmed in person"
3. Wait for success message

### Expected Result
- Status changes to: "✅ Confirmed Attended" (green badge)
- Row background turns green
- `confirmed_by` set to admin ID
- `confirmed_at` set to current timestamp
- Customer dashboard now shows: "✅ Your attendance has been confirmed!"

### Option 2: Mark No Show (Failed Path)
1. Go back, create another poll response as customer
2. Mark as attended
3. In admin, click "Confirm" button
4. Click "❌ No Show"
5. Add note: "Never appeared at canteen"

### Expected Result
- Status changes to: "❌ No Show" (red badge)
- Customer sees: "❌ Marked as no show - you didn't attend"
- Admin notes saved: "Never appeared at canteen"

### Option 3: Reject (Invalid Response)
1. Create another response as customer
2. Mark as attended
3. In admin, click "Confirm" button
4. Click "🚫 Reject"
5. Add note: "Invalid portion size"

### Expected Result
- Status changes to: "🚫 Rejected" (orange badge)
- Customer sees: "🚫 Your response was rejected by admin"
- Admin notes saved: "Invalid portion size"

---

## Step 5: Test Database Queries

Open Supabase SQL Editor and run these to verify data:

### See all customer responses today
```sql
SELECT 
  id,
  user_id,
  date,
  portion_size,
  confirmation_status,
  attended_at,
  confirmed_by,
  confirmed_at,
  admin_notes
FROM public.poll_responses
WHERE date = CURRENT_DATE
ORDER BY created_at DESC;
```

### See only confirmed responses
```sql
SELECT user_id, date, portion_size, confirmed_at
FROM public.poll_responses
WHERE confirmation_status = 'confirmed_attended'
AND date = CURRENT_DATE;
```

### See no-shows with admin notes
```sql
SELECT user_id, date, admin_notes
FROM public.poll_responses
WHERE confirmation_status = 'no_show'
AND date = CURRENT_DATE;
```

---

## Step 6: Check Browser Console for Errors

### While testing, monitor console for any errors:

```bash
# Open browser developer tools (F12)
# Go to Console tab
# Should show no errors related to:
# - /api/polls/[id]/mark-attended
# - /api/polls/[id]/confirm
```

### Common issues and fixes:

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Not logged in | Login first |
| 403 Forbidden | Not admin (for confirm endpoint) | Use admin account |
| 404 Not Found | Wrong endpoint path | Check URL structure |
| 400 Bad Request | Missing required fields | Check action field |
| 500 Internal Server | Database schema issue | Run migration SQL |

---

## Step 7: Test API Directly (Optional)

### If you want to test API endpoints with Curl/Postman:

#### Get authentication token first
```bash
# Get your session cookie from browser DevTools
# Application → Cookies → Copy the auth token
```

#### Test Mark Attended Endpoint
```bash
curl -X PUT http://localhost:3000/api/polls/{RESPONSE_ID}/mark-attended \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{"action": "mark_attended"}'

# Expected response:
# {
#   "success": true,
#   "message": "Marked as attending - waiting for admin confirmation",
#   "data": { ... poll response data ... }
# }
```

#### Test Confirm Endpoint
```bash
curl -X PUT http://localhost:3000/api/polls/{RESPONSE_ID}/confirm \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{
    "action": "confirm_attended",
    "admin_notes": "Verified in person"
  }'

# Expected response:
# {
#   "success": true,
#   "message": "Poll response confirm attended successfully",
#   "data": { ... updated poll response ... }
# }
```

---

## Troubleshooting

### Customer doesn't see "Mark as Attending Now" button
- ✓ Check if logged in as customer (not admin)
- ✓ Check if poll response exists (create one if missing)
- ✓ Check status is `pending_customer_response`
- ✓ Check if they said "Yes" to attending

### Admin doesn't see "Confirm" button
- ✓ Check if logged in as admin
- ✓ Check customer status is `awaiting_admin_confirmation`
- ✓ Hard refresh page (Ctrl + Shift + R)
- ✓ Check browser console for errors

### Database migration failed
- ✓ Check if you have proper Supabase permissions
- ✓ Try running migration in small chunks
- ✓ Check if table already has the new columns
- ✓ Verify no existing constraints blocking the migration

### Changes not showing up
- ✓ Clear browser cache (Ctrl + Shift + Delete)
- ✓ Restart dev server (npm run dev)
- ✓ Hard refresh page (Ctrl + Shift + R)
- ✓ Check that all files saved properly

---

## Test Checklist

Use this checklist to verify everything works:

### Database Setup
- [ ] Ran migration SQL successfully
- [ ] New columns visible in Supabase (attended_at, admin_notes)
- [ ] New status values working (6 states)

### Customer UI
- [ ] Can create poll response as customer
- [ ] See "Mark as Attending Now" button
- [ ] Click button and status changes
- [ ] See "⏳ Awaiting Admin Confirmation"
- [ ] Can click "Update Response" button
- [ ] Can click "Cancel Response" button

### Admin UI
- [ ] Can see poll responses table
- [ ] Status badges show correct colors
- [ ] Can see "Confirm" button for awaiting responses
- [ ] Modal opens with 3 options
- [ ] Can add admin notes
- [ ] Status updates after confirmation
- [ ] Row color changes based on status

### API Endpoints
- [ ] Mark attended endpoint works (200 response)
- [ ] Confirm endpoint works (200 response)
- [ ] 401 returned if not authenticated
- [ ] 403 returned if not admin (for confirm)
- [ ] Data saves to database correctly

### End-to-End Workflow
- [ ] Customer submits → Status: pending
- [ ] Customer marks attended → Status: awaiting
- [ ] Admin confirms → Status: confirmed
- [ ] Database reflects all changes
- [ ] UI updates in real-time
- [ ] No console errors

---

## Success Criteria

✅ **You'll know it's working when:**

1. Customer can mark themselves as attending with timestamp
2. Admin can see awaiting confirmations with color coding
3. Admin can choose between: Attended, No Show, Reject
4. All changes save to database
5. Status badges update in real-time
6. Admin notes field works
7. Complete audit trail recorded (who, when, why)
8. No errors in console
9. Both UI flows work smoothly
10. Database shows all new columns populated

---

## What to Do Next

After testing successfully:

1. **Update Billing Logic**: Only bill `confirmed_attended` status
2. **Add Email Notifications**: Notify customers when confirmed
3. **Generate Reports**: Dashboard showing confirmed vs no-show
4. **Bulk Actions**: Admin bulk confirm multiple responses
5. **Mobile Friendly**: Test on mobile devices

---

Need help? Check the error messages in browser console or Supabase logs!
