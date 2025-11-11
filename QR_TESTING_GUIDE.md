# 🧪 QR System - Complete Testing & Troubleshooting Guide

## 🎯 Quick Start Test (2 minutes)

### Test 1: Can you see your QR code?
1. Navigate to `http://localhost:3000/qr`
2. Should see your profile info + blue QR code
3. Expected: ✅ QR code visible

**If not visible:**
- Go to `/qr-debug` first
- Click "Retry Test"
- See what's failing

---

## 📋 Complete Testing Workflow

### Phase 1: User QR Generation (5 minutes)

#### Step 1.1: Test QR Debug Page
```
URL: http://localhost:3000/qr-debug
Steps:
1. Page loads automatically
2. Shows loading message
3. Tests profile fetch
4. Tests QR data generation
5. Tests library loading
```

**Expected Results:**
```
✅ Profile fetched
✅ QR payload created
✅ Library loaded successfully
✅ All tests passed! QR generation should work.
```

**Troubleshooting if failing:**

| Error | Cause | Fix |
|-------|-------|-----|
| Not authenticated | Not logged in | Go to `/login` first |
| Profile not found | API error | Check database, user exists? |
| Library error | Missing dependency | `npm install` and restart |
| Network error | API unreachable | Check dev server running |

#### Step 1.2: Test QR Page Itself
```
URL: http://localhost:3000/qr
Steps:
1. Page loads
2. Shows your name, email, dept
3. Shows blue QR code with logo
4. Shows timestamp
```

**Expected visuals:**
```
┌──────────────────────────────────┐
│ Your Attendance QR               │
├──────────────────────────────────┤
│ [User info card]                │
│ [QR CODE - BLUE + LOGO]          │
│ Generated at: 10:30:45 AM        │
│ [🔄 Refresh QR Code button]     │
└──────────────────────────────────┘
```

**If QR not showing:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Check Network tab for API failures
5. Visit `/qr-debug` to diagnose

#### Step 1.3: Test QR Refresh
```
Steps:
1. Click "🔄 Refresh QR Code" button
2. Page should regenerate QR
3. Timestamp should update
4. Should still show your info
```

**Expected:** QR code changes but user info stays same

---

### Phase 2: Admin QR Scanning (10 minutes)

#### Step 2.1: Access Admin Scanner
```
URL: http://localhost:3000/admin/qr-scanner
Steps:
1. Page loads (admin role only)
2. Shows stats cards (Present/Absent/Pending)
3. Shows "Open QR Scanner" button
4. Shows "Recent Scans" table
```

**Expected visuals:**
```
┌────────────────────────────────────────┐
│ QR Scanner Dashboard                   │
├────────────────────────────────────────┤
│ 📊 Today's Attendance                  │
│ ┌──────────────────────────────────┐  │
│ │ Present: 0   Absent: 0           │  │
│ │ Pending: 0   Rate: --            │  │
│ └──────────────────────────────────┘  │
│                                        │
│ [📱 Open QR Scanner] button            │
│                                        │
│ 📋 Recent Scans (Last 10)             │
│ No records yet...                      │
└────────────────────────────────────────┘
```

**If access denied:**
- Check role in database
- Should have `role = 'admin'`
- User who created account might not be admin

#### Step 2.2: Open QR Scanner Modal
```
Steps:
1. Click "📱 Open QR Scanner" button
2. Modal should open
3. Camera should request permission
4. Click "Allow" when prompted
5. Should see camera feed
```

**Expected:**
- Black camera feed area
- "Scan QR Code" header
- Camera options (if multiple)
- Manual input textarea
- Close button

**If camera not showing:**

| Issue | Solution |
|-------|----------|
| Black area stays | Browser permissions issue |
| No camera found | Check hardware, try different device |
| Permission denied | Allow camera in browser settings |
| Device busy | Close other camera apps |

**How to fix camera permission:**
- Chrome: Settings → Privacy → Camera → Allow localhost:3000
- Firefox: About:preferences → Permissions → Camera → Allow
- Edge: Settings → Privacy → Camera → Allow

#### Step 2.3: Test Manual Input (Easiest for Testing)
```
Steps:
1. Open scanner modal
2. Scroll to "Or paste QR code data manually"
3. Copy this JSON:

{
  "userId": "your-user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "dept": "CSE",
  "timestamp": "2025-10-22T10:30:00Z",
  "date": "2025-10-22",
  "type": "attendance"
}

4. Paste into textarea
5. Click away from textarea
6. Should send to API
7. Should show success message
```

**Expected result:**
```
✅ Success message showing:
   "Attendance recorded successfully"
   Student: John Doe
   Status: Confirmed Attended
   Time: [current time]
```

#### Step 2.4: Test with Actual QR Code
```
Steps:
1. Have user open /qr on their phone
2. Show QR code on screen
3. Admin opens /admin/qr-scanner
4. Clicks "📱 Open QR Scanner"
5. Points camera at QR code
6. Waits 3-5 seconds
7. Should beep/notify and show success
```

**Expected:**
```
✅ Success notification shows:
   Student name, email, time recorded
   Modal auto-closes after 2 seconds
   Stats update in real-time
   Record appears in "Recent Scans"
```

**If QR won't scan:**
- Check lighting (needs good light)
- Clean camera lens
- Try from 20-30cm away
- Use manual paste method instead
- Check QR code is fully visible (not rotated)

---

### Phase 3: User Views Attendance (5 minutes)

#### Step 3.1: Check Attendance Page
```
URL: http://localhost:3000/attendance
Steps:
1. Page loads
2. Shows stats (Present/Absent/Rate%)
3. Shows attendance table
4. Table has columns: Date, Status, Time
```

**Expected visuals:**
```
┌──────────────────────────────────┐
│ Your Attendance History          │
├──────────────────────────────────┤
│ 📊 Attendance Statistics         │
│ Present:   1       Absent: 0     │
│ Attendance Rate: 100%            │
│                                  │
│ 📋 Attendance Records            │
│ ┌──────────────────────────────┐ │
│ │ Date │ Status │ Time         │ │
│ ├──────┼────────┼──────────────┤ │
│ │ Today│ ✅ Yes │ 10:30:45 AM │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

#### Step 3.2: Verify Record Details
```
Expected for scanned record:
- Date: Today's date
- Status: ✅ Present or similar
- Time: Exact time when scanned
- Matches QR scan time
```

---

## 🐛 Troubleshooting Matrix

### Problem 1: QR Code Not Visible on /qr

| Symptom | Check | Fix |
|---------|-------|-----|
| Blank page | Logged in? | Go to /login |
| Blank page | API working? | Visit /qr-debug |
| Error message | What error? | See error-specific fixes below |
| Slow load | Network? | Check DevTools Network tab |
| Never loads | Browser bug? | Try Incognito mode |

**Specific error fixes:**

If error says **"Failed to fetch profile"**:
```
1. Check if /api/user/profile exists
2. Verify endpoint returns 200 status
3. Check user is authenticated
4. Try /qr-debug to test API
```

If error says **"Failed to generate QR code"**:
```
1. Check react-qrcode-logo is installed
2. Run: npm install react-qrcode-logo
3. Restart dev server
4. Clear browser cache (Ctrl+Shift+Delete)
```

If error says **"Not authenticated"**:
```
1. Go to /login
2. Enter correct credentials
3. Return to /qr
4. Should work now
```

---

### Problem 2: Scanner Won't Open Camera

| Symptom | Cause | Fix |
|---------|-------|-----|
| Modal opens but black | Camera permission | Allow in browser settings |
| Modal opens but black | Camera off | Turn on webcam |
| Modal opens but black | Browser support | Try Chrome instead |
| "No camera found" | Hardware | Connect webcam, try different device |
| Keeps asking | Permission cleared | Refresh page, allow again |

**Step-by-step camera permission fix:**

For Chrome:
```
1. Click lock icon in address bar
2. Find "Camera"
3. Select "Allow"
4. Refresh page
5. Try scanner again
```

For Firefox:
```
1. Go to about:preferences#privacy
2. Find "Permissions"
3. Find "Camera"
4. Change to "Allow"
5. Refresh page
```

---

### Problem 3: Attendance Not Recorded After Scan

| Symptom | Check | Fix |
|---------|-------|-----|
| Scan successful but no record | Wait 2-3 seconds | Stats might be delayed |
| Scan successful but no record | Refresh page | Page might be stale |
| Scan successful but no record | Check API response | Open DevTools Network tab |
| Scan says failed | API error | Check console for error message |
| Scan says failed | Poll missing | Create a poll first |

**How to check if scan worked:**

1. Open DevTools (F12)
2. Go to Network tab
3. Perform scan
4. Look for POST request to `/api/attendance-scan`
5. Check response:
   - If green 200: ✅ Success (check database)
   - If red 401: Not admin
   - If red 404: Poll not found
   - If red 500: Server error (see details)

---

### Problem 4: Records Not Showing on /attendance

| Symptom | Check | Fix |
|---------|-------|-----|
| No records show | Scanned? | Go back and scan a QR |
| No records show | Correct user? | Make sure logged as correct user |
| No records show | Wait | Attendance shows for past dates too |
| Wrong data | Database issue | Check poll_responses table in Supabase |

---

## 🔧 Manual Testing Commands

### Test 1: Direct API Call (Using curl or Postman)

**Test if /api/attendance-scan works:**
```bash
curl -X POST http://localhost:3000/api/attendance-scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "scannedData": "{\"userId\":\"user-id\",\"name\":\"John\",\"type\":\"attendance\",\"timestamp\":\"2025-10-22T10:30:00Z\",\"date\":\"2025-10-22\",\"email\":\"john@example.com\",\"dept\":\"CSE\"}"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Attendance recorded successfully",
  "data": {
    "attendanceId": "...",
    "userId": "...",
    "userName": "John Doe",
    "status": "confirmed_attended",
    "attendedAt": "2025-10-22T10:30:45Z",
    "isNewRecord": true
  }
}
```

---

### Test 2: Check Database Directly

In Supabase SQL Editor:
```sql
-- Check recent attendance records
SELECT id, user_id, poll_id, confirmation_status, attended_at
FROM poll_responses
WHERE confirmation_status = 'confirmed_attended'
ORDER BY attended_at DESC
LIMIT 10;

-- Check today's poll
SELECT id, poll_date, title, status
FROM polls
WHERE poll_date = CURRENT_DATE;

-- Check user exists
SELECT id, full_name, email, role
FROM profiles_new
WHERE id = 'YOUR_USER_ID';
```

---

## ✅ Complete Testing Checklist

```
🧪 QR Generation Tests
☐ Can access /qr page
☐ QR code is visible and colored blue
☐ User info displays correctly (name, email, dept)
☐ QR contains correct JSON payload
☐ Can refresh QR code
☐ Timestamp updates on refresh

📱 Scanner Tests
☐ Can access /admin/qr-scanner as admin
☐ Dashboard stats show initially
☐ Can open QR Scanner modal
☐ Camera opens and shows video (or permission requested)
☐ Can select different camera (if multiple)
☐ Can manually paste QR JSON data
☐ Manual paste triggers scan successfully

✅ Attendance Recording Tests
☐ Scanning updates stats in real-time
☐ "Recent Scans" table shows new record
☐ Success message appears
☐ Modal closes automatically after scan
☐ Can scan multiple QR codes in sequence
☐ Same user can be scanned twice (updates record)

👁️ Viewing Results Tests
☐ User can access /attendance page
☐ Statistics show correct numbers
☐ Attendance table shows records
☐ Date and time match scan time
☐ Status shows as "Present" or similar
☐ Can see all historical records

🔄 Refresh/Update Tests
☐ Refreshing admin page shows latest records
☐ Refreshing user page shows new scans
☐ Stats update correctly after multiple scans
☐ No duplicate records for same scan

🚨 Error Handling Tests
☐ Invalid QR data shows error
☐ Missing user shows error
☐ Non-admin can't access scanner
☐ Camera permission denied handled gracefully
☐ Network errors show proper message
```

---

## 📞 Debug Commands

### For Developers

**Check logs:**
```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for messages starting with:
   - "✅" = Success
   - "❌" = Error  
   - "🔍" = Info
```

**Check network requests:**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (scan, load, etc.)
4. Look for new requests
5. Check status and response
```

**Test API endpoints:**
```
Browser console:
fetch('/api/user/profile').then(r => r.json()).then(d => console.log(d))

fetch('/api/attendance-scan', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({scannedData: '{"userId":"test","type":"attendance"}'})
}).then(r => r.json()).then(d => console.log(d))
```

---

## 🎯 Success Criteria

You know everything is working when:

✅ QR is visible on `/qr`  
✅ QR contains your JSON data  
✅ Admin can scan QR from `/admin/qr-scanner`  
✅ Stats update immediately after scan  
✅ Recent scans table shows new record  
✅ You can see attendance on `/attendance`  
✅ Timestamps match  
✅ Can scan multiple times  

**If all these pass:** 🎉 System is ready for production!

---

## 📚 Key URLs for Testing

| Purpose | URL | Expected |
|---------|-----|----------|
| Generate QR | /qr | See blue QR + user info |
| Debug QR | /qr-debug | Test results |
| Admin Scan | /admin/qr-scanner | Scanner dashboard |
| View Records | /attendance | History table |
| Login | /login | Authentication |
| Dashboard (User) | /user/dashboard | Main menu |
| Dashboard (Admin) | /admin/dashboard | Admin menu |

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing
