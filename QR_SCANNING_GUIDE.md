# QR Code Scanning - Testing Guide

## ⚠️ IMPORTANT: Why Your Scan Isn't Working

**You CANNOT scan a QR code displayed on the SAME device you're using to scan!**

### The Problem:
- Your screenshot shows you're at `/admin/qr-scanner` (scanner page)
- But you're trying to scan a QR code shown on the SAME phone screen
- The camera can't see what's on its own screen!

### The Solution:
You need **TWO separate devices** (or one device + one computer screen)

---

## 🎯 Method 1: Two Mobile Devices (RECOMMENDED)

### Device 1 - Student Phone:
1. Login as a student/user
2. Go to: `mycanteen1.vercel.app/user/qr`
3. QR code appears on screen
4. Keep this screen on and visible

### Device 2 - Admin Phone:
1. Login as admin
2. Go to: `mycanteen1.vercel.app/admin/qr-scanner`
3. Click "Open QR Scanner"
4. Allow camera permissions
5. **Point Device 2's camera at Device 1's screen**
6. Watch for:
   - Yellow debug panel showing detection status
   - Success message when scanned
   - Vibration feedback

---

## 💻 Method 2: Computer Screen + Phone (EASIEST FOR TESTING)

### On Your Computer:
1. Open: `mycanteen1.vercel.app/test-qr`
2. A large test QR code will appear
3. Press **F11** to make it fullscreen (bigger = easier to scan)
4. Keep the screen bright

### On Your Phone:
1. Login as admin
2. Go to: `mycanteen1.vercel.app/admin/qr-scanner`
3. Click "Open QR Scanner"
4. Point camera at computer screen
5. Hold steady, 6-12 inches away
6. Watch debug panel for status

---

## 🔍 What the Debug Panel Shows

The **yellow debug panel** below the camera shows real-time scanning status:

- `Scanning... (0s)` → Camera active, no QR detected yet
- `Found: {"userId":"..."...}` → QR code detected, showing first 50 chars
- `Invalid: Missing userId, type` → QR detected but missing required fields
- `Not JSON: abc123...` → QR detected but not JSON format
- ✅ Success → Shows user name and attendance recorded

---

## 🧪 Method 3: Manual Testing (NO CAMERA NEEDED)

If camera isn't working, you can test the logic:

1. Go to: `mycanteen1.vercel.app/admin/qr-scanner`
2. Click "Open QR Scanner"
3. Scroll down to **"Or paste QR code data manually"**
4. Copy this test data:
```json
{"userId":"YOUR_USER_ID_HERE","name":"Test User","email":"test@example.com","dept":"CS","timestamp":"2025-11-04T22:00:00.000Z","date":"2025-11-04","type":"attendance"}
```
5. Replace `YOUR_USER_ID_HERE` with an actual user ID from your database
6. Paste into the text area
7. Click outside the box (blur event triggers scan)

---

## 🎬 Real-World Usage Scenario

### At The Canteen:

**Student Side:**
1. Student opens their phone
2. Goes to app → "My QR Code" page
3. Shows phone to admin

**Admin Side:**
1. Admin has tablet/phone with scanner
2. Opens `/admin/qr-scanner`
3. Clicks "Open QR Scanner"
4. Points camera at student's phone
5. Beep! Attendance recorded
6. Student sees confirmation on their dashboard

---

## 🐛 Debugging Checklist

### Camera Not Opening?
- ✅ Check camera permissions in browser settings
- ✅ Try incognito/private mode
- ✅ Ensure HTTPS (Vercel handles this)
- ✅ Check if another app is using camera

### QR Code Not Detected?
- ✅ Ensure QR is fully visible in green guide lines
- ✅ Hold phone steady, 6-12 inches away
- ✅ Make sure lighting is good (not too dark/bright)
- ✅ Check debug panel - is it showing "Scanning..."?
- ✅ Try different angle or distance
- ✅ Ensure QR code is black/white, not blue/colored

### Debug Panel Not Showing?
- ✅ Check browser console for errors (F12)
- ✅ Ensure latest deployment loaded (hard refresh: Ctrl+Shift+R)
- ✅ Verify you're on the right URL
- ✅ Check if `isReady` state is true

### Still Not Working?
- Use **Manual Input** method as fallback
- Check browser console logs (F12 → Console tab)
- Share console errors for debugging

---

## 📊 Expected QR Code Format

The user's QR code should contain:
```json
{
  "userId": "actual-uuid-from-database",
  "name": "Student Name",
  "email": "student@email.com",
  "dept": "Department",
  "timestamp": "2025-11-04T22:02:00.000Z",
  "date": "2025-11-04",
  "type": "attendance"
}
```

**Required fields:**
- `userId` - Must match a user in `profiles_new` table
- `type` - Must be `"attendance"`

**Optional fields:**
- `name`, `email`, `dept` - For display purposes
- `timestamp`, `date` - For tracking

---

## 🚀 Quick Test Commands

### Test with 2 phones:
```
Phone 1: mycanteen1.vercel.app/user/qr
Phone 2: mycanteen1.vercel.app/admin/qr-scanner
```

### Test with computer + phone:
```
Computer: mycanteen1.vercel.app/test-qr
Phone: mycanteen1.vercel.app/admin/qr-scanner
```

### Manual test:
```
1. Open: /admin/qr-scanner
2. Click: Open QR Scanner
3. Scroll to: "Or paste QR code data manually"
4. Paste valid JSON with userId + type
```

---

## ✅ Success Indicators

When scanning works correctly, you'll see:

1. **Visual:** Green flash on camera view
2. **Haptic:** Phone vibrates (if supported)
3. **Message:** "✓ Attendance recorded for [Name]"
4. **Data:** Recent scans table updates
5. **Dashboard:** User sees "Attendance Confirmed" notification

---

## 📝 Notes

- Debug mode is **enabled** in production for troubleshooting
- Scanner auto-closes 2 seconds after successful scan
- Each QR code can be scanned multiple times (upsert logic)
- Admin can see all scans in the "Recent Attendance" table
- Students see confirmation status on their dashboard

---

**Need help?** Check browser console (F12) for detailed error messages and share them for debugging.
