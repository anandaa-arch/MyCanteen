# QR Scanner & Attendance - Quick Reference Guide

## 🚀 Quick Start

### For Users
1. Go to `/qr` → See your QR code → Share with admin
2. Go to `/attendance` → View your attendance history

### For Admins
1. Go to `/admin/qr-scanner` → Click "Open QR Scanner"
2. Scan student's QR code → See success message
3. Check "Recent Attendance" table below

## 📍 URLs

| Page | URL | Access | Purpose |
|------|-----|--------|---------|
| Generate QR | `/qr` | Users | Create attendance QR code |
| Scan QR | `/admin/qr-scanner` | Admins | Record attendance |
| View History | `/attendance` | Users | See attendance records |

## 🎨 Navigation

### Admin Dashboard Header
```
[Dashboard] [Polls] [Billing] [Menu] [QR Scanner] [Inventory] [+ Create]
                                         ↑ NEW
```

### User Dashboard
```
Cards: [Bills] [Menu] [Meal History] [Attendance] [Poll]
                                       ↑ NEW
```

### Mobile Bottom Navbar
```
[Dashboard] [QR] [Attendance] [Poll] [Profile]
                      ↑ NEW
```

## 📊 What Each Page Shows

### `/qr` - Generate QR Code
```
┌─────────────────────────────┐
│  Your Attendance QR Code    │
│                             │
│  ┌──────────┐               │
│  │  QR CODE │  John Doe     │
│  │          │  john@email   │
│  │ (LOGO)   │  CSE Dept     │
│  └──────────┘  Today's Date │
│                             │
│  [🔄 Refresh QR Code]       │
└─────────────────────────────┘
```

### `/admin/qr-scanner` - Admin Scanner
```
┌─────────────────────────────────────────┐
│         QR Scanner Dashboard             │
├──────────┬──────────┬────────────────────┤
│ Present  │ Pending  │ Total Responses    │
│   45 ✓   │   12 ⏳   │   57 👥           │
├──────────┴──────────┴────────────────────┤
│  [📱 Open QR Scanner]                    │
├──────────────────────────────────────────┤
│ ✅ John Doe - john@email - 10:30 AM     │
│ ✅ Jane Smith - jane@email - 10:35 AM   │
│ ✅ Bob Johnson - bob@email - 10:40 AM   │
└──────────────────────────────────────────┘
```

### `/attendance` - View History
```
┌─────────────────────────────────────────┐
│      Attendance History                  │
├──────────┬──────────┬────────────────────┤
│ Present  │ Absent   │ Rate               │
│   35 ✓   │   2 ✗    │ 94.6% 📈          │
├──────────┴──────────┴────────────────────┤
│ Date      │ Poll     │ Status   │ Time   │
├───────────┼──────────┼──────────┼────────┤
│ 10/22/25  │ Lunch    │ ✓ Present│ 10:30 │
│ 10/21/25  │ Lunch    │ ✓ Present│ 10:25 │
│ 10/20/25  │ Dinner   │ ✗ Absent │ -     │
└───────────┴──────────┴──────────┴────────┘
```

## 🔄 Attendance Flow

```
START
  ↓
USER GENERATES QR (/qr)
  ├─ Shows QR code with user info
  └─ Can refresh anytime
  ↓
ADMIN SCANS (/admin/qr-scanner)
  ├─ Opens camera
  ├─ Scans student's QR
  ├─ API validates & records
  └─ Shows success message
  ↓
RECORDS ATTENDANCE
  ├─ Creates poll_response record
  ├─ Sets confirmation_status = 'confirmed_attended'
  ├─ Records attended_at timestamp
  └─ Updates recent scans table
  ↓
USER VIEWS HISTORY (/attendance)
  ├─ Sees attendance record
  ├─ Checks statistics
  └─ Verifies status = Present ✓
  ↓
END
```

## 🛠️ Key Features

### QR Scanner Component
- ✅ Real-time camera streaming
- ✅ Multiple camera selection (front/back)
- ✅ Manual QR data paste option
- ✅ Permission request handling
- ✅ Visual scanning feedback
- ✅ Error recovery

### Admin Dashboard
- ✅ Real-time attendance stats
- ✅ Live scanner modal
- ✅ Recent scans table
- ✅ Auto-refresh after scan
- ✅ Success/error notifications
- ✅ Admin-only access

### Attendance Page
- ✅ Attendance rate calculation
- ✅ Present/absent breakdown
- ✅ Detailed records table
- ✅ Time-based sorting
- ✅ Status color coding
- ✅ Responsive design

## 📱 API Endpoints

### POST `/api/attendance`
Record a scanned QR code

```json
Request:
{
  "scannedData": {
    "userId": "550e8400...",
    "type": "attendance",
    "name": "John Doe",
    "timestamp": "2025-10-22T10:30:00Z"
  }
}

Response (Success):
{
  "success": true,
  "message": "Attendance recorded successfully",
  "data": {
    "userName": "John Doe",
    "status": "confirmed_attended",
    "attendedAt": "2025-10-22T10:30:45Z"
  }
}

Errors:
401 - Not logged in
403 - Not an admin
404 - User not found
400 - Invalid QR data
```

### GET `/api/attendance?pollId=...&limit=50`
Fetch attendance records

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "record-id",
      "user_id": "user-id",
      "confirmation_status": "confirmed_attended",
      "attended_at": "2025-10-22T10:30:45Z",
      "profiles_new": {
        "full_name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "count": 45
}
```

## 🔐 Security

| Feature | Status |
|---------|--------|
| Authentication Required | ✅ Yes |
| Admin-Only Scanner | ✅ Yes |
| Role-Based Access | ✅ Enforced |
| QR Validation | ✅ Yes |
| User Isolation | ✅ Own records only |

## 📋 File Structure

```
MyCanteen/
├── components/
│   ├── QRScanner.js                    ← NEW: QR scanner modal
│   ├── BottomNavbar.js                 ← UPDATED: Added attendance link
│   └── ActionCards.js                  ← UPDATED: Added attendance card
├── app/
│   ├── attendance/
│   │   └── page.js                     ← UPDATED: Full implementation
│   ├── qr/
│   │   └── page.js                     ← EXISTING: QR generation
│   ├── admin/
│   │   ├── qr-scanner/
│   │   │   └── page.js                 ← NEW: Admin scanner
│   │   └── dashboard/
│   │       ├── page.js
│   │       └── components/
│   │           ├── DashboardHeader.js  ← UPDATED: Added scanner button
│   │           └── ...
│   └── api/
│       └── attendance/
│           └── route.js                ← NEW: Attendance API
├── QR_SCANNER_DOCUMENTATION.md         ← NEW: Full docs
└── QR_SCANNER_SETUP.md                 ← NEW: Setup guide
```

## 🧪 Testing Commands

### Test Scan Recording
```bash
curl -X POST "http://localhost:3000/api/attendance" \
  -H "Content-Type: application/json" \
  -d '{
    "scannedData": {
      "userId": "user-uuid",
      "type": "attendance"
    }
  }'
```

### Test Fetch Records
```bash
curl -X GET "http://localhost:3000/api/attendance?pollId=poll-uuid"
```

## ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Camera won't open | Check browser permissions, try different browser |
| QR won't scan | Ensure good lighting, try manual paste |
| Attendance not recording | Check admin role, verify poll exists for today |
| Stats not updating | Refresh page, check browser console |
| Access denied | Log in again, verify user/admin role |

## 📚 Status Badges

| Status | Meaning | Color |
|--------|---------|-------|
| ✅ Present | Scanned and confirmed | 🟢 Green |
| ❌ Absent | Marked not attending | 🔴 Red |
| ⏳ Pending | Awaiting confirmation | 🟡 Yellow |

## 🎯 Next Steps

1. **Test User Flow**: Generate QR, scan it, view history
2. **Test Admin Flow**: Open scanner, scan codes, check stats
3. **Test Navigation**: Click all new links in dashboard/navbar
4. **Test Errors**: Try invalid QR, non-existent user, missing poll
5. **Check Mobile**: Test on mobile devices for responsiveness

## 📞 Quick Reference

**Generate QR Code:**
- Navigate to `/qr`
- Login as any user
- See QR code with your info

**Scan Attendance:**
- Navigate to `/admin/qr-scanner` (admin only)
- Click "Open QR Scanner"
- Allow camera permission
- Scan student's QR code
- See success message

**View Attendance:**
- Navigate to `/attendance`
- See your attendance records
- Check statistics

## 🔗 Related Pages

- QR Generation: `/qr` (existing, still works)
- Polls: `/poll` (existing, still works)
- Menu: `/menu` (existing, still works)
- Billing: `/user/billing` (existing, still works)

---

**Status:** ✅ Ready to Use  
**Last Updated:** October 22, 2025  
**Version:** 1.0.0
