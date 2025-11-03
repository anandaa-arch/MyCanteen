# 🎯 Complete QR Generation & Attendance System - User Guide

## Overview

The QR-based attendance system works in **3 simple steps**:

1. **User generates QR** → Navigate to `/qr` → See your personal QR code
2. **Admin scans QR** → Go to `/admin/qr-scanner` → Scan student's QR code  
3. **User views attendance** → Go to `/attendance` → See your records

---

## 🚀 Step-by-Step User Workflow

### Step 1️⃣: Generate Your QR Code

**URL:** `http://localhost:3000/qr`

**What you'll see:**
```
┌─────────────────────────────────────────┐
│  Your Attendance QR                     │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │  Your Name                      │   │
│  │  your.email@example.com         │   │
│  │  Department: CSE                │   │
│  │  Date: Oct 22, 2025            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ╔═══════════════════╗          │   │
│  │  ║     QR CODE       ║          │   │
│  │  ║   (Blue + Logo)   ║          │   │
│  │  ║                   ║          │   │
│  │  ╚═══════════════════╝          │   │
│  │  Generated at: 10:30:45 AM      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [🔄 Refresh QR Code]                  │
│                                         │
│  📌 This QR code contains your          │
│     encrypted attendance information.  │
│     Present it to admin for marking.   │
└─────────────────────────────────────────┘
```

**What's encoded in the QR:**
```json
{
  "userId": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "dept": "Computer Science",
  "timestamp": "2025-10-22T10:30:45.123Z",
  "date": "2025-10-22",
  "type": "attendance"
}
```

**Features:**
- ✅ QR code includes your MyCanteen logo
- ✅ Blue colored design for easy identification
- ✅ Contains your encrypted personal data
- ✅ Can refresh anytime to get a new QR
- ✅ Works on phone, tablet, or computer

---

### Step 2️⃣: Admin Scans Your QR

**URL (Admin only):** `http://localhost:3000/admin/qr-scanner`

**Process:**
```
Admin navigates to /admin/qr-scanner
        ↓
Sees dashboard with:
  - Today's statistics (Present/Absent/Pending)
  - "Open QR Scanner" button
  - Recent scans table
        ↓
Clicks "Open QR Scanner" button
        ↓
Camera opens in modal
        ↓
Points camera at student's QR code
        ↓
QR code is scanned & decoded
        ↓
✅ Success message shown
        ↓
Statistics update in real-time
        ↓
Record added to "Recent Scans" table
```

**What the admin sees:**

```
┌──────────────────────────────────────────┐
│  QR Scanner Dashboard                    │
├──────────────────────────────────────────┤
│  📊 Today's Attendance                   │
│  ┌──────────────────────────────────┐   │
│  │ Present: 45  │  Absent: 12       │   │
│  │ Pending: 8   │  Rate: 78.9%      │   │
│  └──────────────────────────────────┘   │
│                                          │
│  [📱 Open QR Scanner]                   │
│                                          │
│  📋 Recent Scans (Last 10)              │
│  ├─ John Doe (10:30 AM)    ✅ Present  │
│  ├─ Jane Smith (10:28 AM)  ✅ Present  │
│  ├─ Bob Wilson (10:25 AM)  ✅ Present  │
│  └─ ...                                  │
└──────────────────────────────────────────┘
```

---

### Step 3️⃣: View Your Attendance History

**URL:** `http://localhost:3000/attendance`

**What you'll see:**
```
┌────────────────────────────────────────────────┐
│  Your Attendance History                       │
├────────────────────────────────────────────────┤
│  📊 Attendance Statistics                      │
│  ┌──────────────────────────────────────────┐ │
│  │ Present:   45       Absent:    12        │ │
│  │ Attendance Rate: 78.9%                   │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  📋 Attendance Records                        │
│  ┌──────────────────────────────────────────┐ │
│  │ Date        │ Status  │ Time              │ │
│  ├─────────────┼─────────┼──────────────────┤ │
│  │ Oct 22      │ ✅ Present │ 10:30 AM     │ │
│  │ Oct 21      │ ✅ Present │ 10:28 AM     │ │
│  │ Oct 20      │ ❌ Absent  │ --           │ │
│  │ Oct 19      │ ✅ Present │ 10:25 AM     │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Problem 1: QR Code Not Showing on `/qr` Page

**Symptoms:**
- Page is blank
- Loading spinner never stops
- Error message appears

**Solutions:**
1. **Check if you're logged in:**
   - Go to `/login`
   - Enter your credentials
   - Come back to `/qr`

2. **Check profile data:**
   - Visit `/qr-debug` (debug page)
   - Click "Retry Test"
   - Look at user profile section
   - Check for errors

3. **Check API response:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Refresh `/qr` page
   - Look for `/api/user/profile` request
   - Check status (should be 200, not 401/404)

4. **Clear cache:**
   - Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear all browsing data
   - Refresh page

---

### Problem 2: Scanner Won't Open Camera

**Symptoms:**
- "Open QR Scanner" button doesn't work
- Camera permission denied
- Blank black area where camera should be

**Solutions:**
1. **Check permissions:**
   - Browser must have camera permission
   - Check browser settings → Permissions
   - Allow camera for localhost:3000

2. **Try different browser:**
   - Chrome/Chromium (best support)
   - Firefox
   - Edge (on Windows)

3. **Check camera hardware:**
   - Is webcam connected?
   - Is webcam in use by another app?
   - Try testing camera in other apps

4. **Manual input fallback:**
   - If camera fails, paste QR data manually
   - Click "Paste QR Code Data"
   - Paste the JSON data

---

### Problem 3: Attendance Record Not Showing

**Symptoms:**
- Scanned QR but no record in attendance page
- Statistics not updating

**Solutions:**
1. **Wait a moment:**
   - Sometimes takes 1-2 seconds to update
   - Refresh attendance page

2. **Check if record was created:**
   - Go to `/qr-debug`
   - Test again
   - Check console for errors

3. **Verify admin scanned correctly:**
   - Check admin dashboard
   - Look in "Recent Scans" table
   - Should show success message

4. **Check timestamps:**
   - Make sure date/time on device is correct
   - QR includes timestamp
   - Record should match date

---

## 📱 Navigation Links

### For Students/Users:
- **Generate QR:** http://localhost:3000/qr
- **View Attendance:** http://localhost:3000/attendance
- **Debug QR:** http://localhost:3000/qr-debug

### For Admins:
- **Scan QR:** http://localhost:3000/admin/qr-scanner
- **Admin Dashboard:** http://localhost:3000/admin/dashboard

---

## 🔐 Security Details

**What's encrypted in QR:**
- User ID (not sensitive)
- User name
- Email
- Department
- Timestamp
- Date

**What's NOT in QR:**
- Password
- Personal phone number
- Personal address
- Payment information

**How it works:**
1. QR code is just encoded JSON (not encrypted)
2. Visible to anyone who scans it
3. Server validates the data
4. Only admins can record attendance
5. Timestamps prevent duplicate scans

---

## 💡 Pro Tips

### For Users:
✅ Generate QR at home before coming to canteen  
✅ Keep QR code visible on your phone  
✅ Refresh QR if it doesn't scan (after ~1 hour)  
✅ Check attendance page after scanning  

### For Admins:
✅ Use tablet/iPad for scanning (easier to hold)  
✅ Ensure good lighting for QR scanning  
✅ Keep camera lens clean  
✅ Scan from 20-30 cm distance  
✅ Check "Recent Scans" to confirm  

---

## 🎓 How It All Works Together

```
User Flow:
┌─────────────────────────────────────────────┐
│ User opens /qr page                         │
├─────────────────────────────────────────────┤
│ 1. Fetches profile from /api/user/profile  │
│ 2. Creates JSON with user data             │
│ 3. Encodes JSON into visual QR code        │
│ 4. Shows QR + user info on screen          │
│ 5. User can refresh anytime               │
└─────────────────────────────────────────────┘
        ↓ (User shows to Admin)
Admin Scanning Flow:
┌─────────────────────────────────────────────┐
│ Admin opens /admin/qr-scanner page          │
├─────────────────────────────────────────────┤
│ 1. Shows dashboard with statistics         │
│ 2. Clicks "Open QR Scanner"                │
│ 3. Camera opens in modal                   │
│ 4. Admin points camera at QR               │
│ 5. QR decoded → JSON extracted            │
│ 6. Validates data (user exists, etc)       │
│ 7. Sends to /api/attendance (POST)         │
│ 8. Database records attendance             │
│ 9. Success message shown                   │
│ 10. Stats update in real-time              │
└─────────────────────────────────────────────┘
        ↓ (Record created in database)
User Viewing Results:
┌─────────────────────────────────────────────┐
│ User opens /attendance page                 │
├─────────────────────────────────────────────┤
│ 1. Fetches records from /api/attendance    │
│ 2. Shows stats (Present/Absent/Rate)       │
│ 3. Shows table with all records            │
│ 4. Auto-updates when new record added      │
│ 5. User can see full history               │
└─────────────────────────────────────────────┘
```

---

## 📞 Quick Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| User QR Generation | `/qr` | User generates & displays QR |
| QR Scanner Component | `components/QRScanner.js` | Camera modal for scanning |
| Admin Scanner | `/admin/qr-scanner` | Admin dashboard & scanning UI |
| Attendance API | `/api/attendance` | POST to record, GET to fetch |
| User Attendance | `/attendance` | View attendance history |
| Debug Page | `/qr-debug` | Test QR generation |

---

## ✅ Checklist Before Using

- [ ] I'm logged in to the app
- [ ] Camera is connected (if using scanner)
- [ ] Browser has camera permission enabled
- [ ] My device date/time is correct
- [ ] I can see my profile in `/qr-debug`
- [ ] QR code is visible on `/qr` page

---

## 🆘 Emergency Contacts

If something isn't working:

1. **Check Debug Page:** `/qr-debug` - Shows what's happening
2. **Check Console:** F12 → Console → Look for red errors
3. **Check Network:** F12 → Network → Look for failed requests
4. **Restart:** Close browser, clear cache, reopen
5. **Ask Admin:** They can manually add attendance records

---

## 🎉 Success Criteria

You know the system is working when:

✅ You see your QR code on `/qr`  
✅ You can show QR to admin  
✅ Admin scans and sees success message  
✅ Your attendance appears on `/attendance`  
✅ Statistics show you as "Present"  
✅ You can see timestamp of scan  

**Everything working?** Awesome! 🚀 Your attendance is now being tracked!

---

## 📚 System Architecture

```
MyCanteen Attendance System
├── User Side
│   ├── /qr page
│   │   ├── Fetches user profile
│   │   ├── Generates QR code
│   │   └── Shows to admin
│   │
│   ├── /attendance page
│   │   ├── Fetches attendance records
│   │   ├── Shows statistics
│   │   └── Displays history table
│   │
│   └── /qr-debug page
│       ├── Tests QR generation
│       ├── Checks API calls
│       └── Shows errors
│
├── Admin Side
│   └── /admin/qr-scanner
│       ├── Shows dashboard
│       ├── Opens camera
│       ├── Scans QR code
│       ├── Sends to API
│       └── Updates stats in real-time
│
└── Backend
    ├── /api/user/profile
    │   └── Fetches user data
    │
    ├── /api/attendance
    │   ├── POST: Records scan
    │   └── GET: Fetches records
    │
    └── Database
        ├── profiles_new table
        ├── poll_responses table
        └── Timestamps & validation
```

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0  
**Status:** ✅ Complete and Ready to Use

