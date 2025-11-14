# 🍽️ THREE MEAL SLOTS IMPLEMENTATION GUIDE

## 📌 Overview

**Current System**: 1 meal per day (lunch)  
**New System**: 3 meals per day (breakfast, lunch, dinner)

---

## 🎯 What Changes

### **Before:**
- Admin creates 1 poll per day
- User responds once: "Will you attend today?"
- One QR scan per day
- One bill entry per day

### **After:**
- Admin creates 3 polls per day (breakfast, lunch, dinner)
- User responds 3 times: "Will you attend breakfast/lunch/dinner?"
- Three separate QR scans (one per meal slot)
- Three separate bill entries per day

---

## 📋 Step-by-Step Implementation

### **STEP 1: Run Database Migration** ✅

**File**: `MEAL_SLOTS_MIGRATION.sql`

**What it does:**
1. Creates `meal_slot_type` enum: `breakfast`, `lunch`, `dinner`
2. Adds `meal_slot` column to `polls` table
3. Adds `menu_details` column to `polls` (menu description per meal)
4. Adds `meal_time` column to `polls` (expected serving time)
5. Adds `meal_slot` column to `poll_responses`
6. Adds `actual_meal_time` column to `poll_responses` (QR scan time)
7. Updates constraints: one poll per day per meal slot
8. Updates constraints: one response per user per day per meal slot
9. Migrates existing data to 'lunch' slot

**Run in Supabase SQL Editor:**
```sql
-- Copy entire MEAL_SLOTS_MIGRATION.sql content and run
```

---

### **STEP 2: Update Admin Poll Creation UI**

**File**: `/app/admin/attendance/page.js`

**Changes needed:**
- Add meal slot selector (Breakfast/Lunch/Dinner)
- Add menu details textarea
- Add meal time picker
- Allow creating 3 polls per day (one for each slot)
- Show which meal slots already have polls for today

**UI Example:**
```
Create Daily Poll
┌─────────────────────────────────────┐
│ Meal Slot: [Breakfast ▼]           │
│ Menu: [Poha, Tea, Banana]           │
│ Serving Time: [08:00 AM]            │
│ Full Plate: ₹40                     │
│ Half Plate: ₹25                     │
│ [Create Breakfast Poll]             │
└─────────────────────────────────────┘

Today's Polls Status:
✅ Breakfast Created (8:00 AM)
❌ Lunch Not Created
❌ Dinner Not Created
```

---

### **STEP 3: Update User Poll Response Page**

**File**: `/app/page.js` (Landing page)

**Changes needed:**
- Show 3 separate poll cards (breakfast, lunch, dinner)
- Each card shows:
  - Meal slot name & icon
  - Serving time
  - Menu details
  - Full/Half options
  - Independent response buttons
- User can respond to each meal independently

**UI Example:**
```
┌─────────────────────────────────────┐
│ 🌅 Breakfast - 8:00 AM              │
│ Menu: Poha, Tea, Banana             │
│ ○ Full Plate (₹40)  ○ Half (₹25)   │
│ [✓ I'll Attend] [✗ Won't Attend]   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ☀️ Lunch - 1:00 PM                  │
│ Menu: Rice, Dal, Roti, Sabzi        │
│ ○ Full Plate (₹60)  ○ Half (₹45)   │
│ [✓ I'll Attend] [✗ Won't Attend]   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🌙 Dinner - 8:00 PM                 │
│ Menu: Roti, Curry, Rice             │
│ ○ Full Plate (₹50)  ○ Half (₹35)   │
│ [✓ I'll Attend] [✗ Won't Attend]   │
└─────────────────────────────────────┘
```

---

### **STEP 4: Update QR Attendance System**

**Files**: 
- `/app/api/attendance/route.js`
- `/components/QRScanner.js`

**Changes needed:**
- QR code includes meal slot: `user_id:meal_slot:date`
- Admin selects which meal slot they're scanning for
- When scanning, record `actual_meal_time` timestamp
- Attendance page shows all 3 meal slots separately

**QR Scan Flow:**
```
Admin opens QR Scanner
→ Selects meal slot: [Breakfast ▼]
→ Scans user QR code
→ Records attendance for breakfast with timestamp
→ Shows: "User attended Breakfast at 8:15 AM"
```

---

### **STEP 5: Update Billing System**

**Files**:
- `/app/user/billing/page.js`
- `/app/admin/billing/page.js`
- `/app/api/billing/route.js`

**Changes needed:**
- Show meals grouped by slot
- Display breakfast/lunch/dinner separately
- Calculate costs per meal slot
- Payment tracking per meal slot

**Billing Display Example:**
```
Your Meals
┌────────────────────────────────────────────────┐
│ Nov 14, 2025                                   │
│ ├─ 🌅 Breakfast (8:15 AM) - ₹40 - ✓ Paid     │
│ ├─ ☀️ Lunch (1:20 PM) - ₹60 - ✗ Unpaid       │
│ └─ 🌙 Dinner - No attendance                  │
│                                                │
│ Nov 13, 2025                                   │
│ ├─ 🌅 Breakfast (8:05 AM) - ₹25 - ✓ Paid     │
│ ├─ ☀️ Lunch (1:15 PM) - ₹45 - ✓ Paid         │
│ └─ 🌙 Dinner (8:30 PM) - ₹50 - ✗ Unpaid      │
└────────────────────────────────────────────────┘
```

---

### **STEP 6: Update Attendance Reports**

**Files**:
- `/app/admin/attendance/page.js`
- `/app/user/dashboard/page.js`

**Changes needed:**
- Show meal slot breakdown in stats
- Attendance rate per meal slot
- Revenue per meal slot
- Time tracking per meal

**Stats Example:**
```
Today's Attendance (Nov 14, 2025)
┌─────────────────────────────────────┐
│ 🌅 Breakfast:  45/60 users (75%)   │
│ ☀️ Lunch:      52/60 users (87%)   │
│ 🌙 Dinner:     38/60 users (63%)   │
│ Total Revenue: ₹6,450               │
└─────────────────────────────────────┘
```

---

## 🗃️ Database Schema Changes

### **polls table:**
```sql
- meal_slot: enum (breakfast, lunch, dinner)
- menu_details: text
- meal_time: time
```

### **poll_responses table:**
```sql
- meal_slot: enum (breakfast, lunch, dinner)
- actual_meal_time: timestamptz
```

### **Constraints:**
- **Old**: One poll per day
- **New**: One poll per day **per meal slot**

- **Old**: One response per user per day
- **New**: One response per user per day **per meal slot**

---

## 💰 Pricing Structure Example

```javascript
const mealPricing = {
  breakfast: {
    full: 40,
    half: 25
  },
  lunch: {
    full: 60,
    half: 45
  },
  dinner: {
    full: 50,
    half: 35
  }
};
```

---

## 📊 Impact on Existing Features

### **1. Dashboard Stats**
- Show total across all 3 meal slots
- OR show breakdown per slot

### **2. Attendance History**
- Group by date, then by meal slot
- Show time for each meal attended

### **3. Billing**
- Calculate per meal slot
- Total = breakfast + lunch + dinner

### **4. QR Scanning**
- Need to specify which meal slot
- Can scan same user 3 times per day (different slots)

### **5. Notifications**
- Send 3 separate reminders per day
- "Breakfast poll is closing soon!"
- "Lunch poll is now open!"

---

## ⚠️ Important Notes

1. **Backward Compatibility**: All existing records will be migrated to 'lunch' slot
2. **Admin Training**: Admins need to create 3 polls daily now instead of 1
3. **User Education**: Users can respond to each meal independently
4. **QR Codes**: May need to regenerate user QR codes with meal slot info
5. **Reports**: All reports need meal slot filtering

---

## 🧪 Testing Checklist

After implementation:
- [ ] Run SQL migration successfully
- [ ] Admin can create breakfast poll
- [ ] Admin can create lunch poll
- [ ] Admin can create dinner poll
- [ ] User sees all 3 polls on landing page
- [ ] User can respond to breakfast independently
- [ ] User can respond to lunch independently
- [ ] User can respond to dinner independently
- [ ] QR scanner records correct meal slot
- [ ] QR scanner records actual meal time
- [ ] Billing shows meals separated by slot
- [ ] Billing shows correct prices per slot
- [ ] Attendance reports show meal slot breakdown
- [ ] Stats calculate correctly for all 3 slots
- [ ] Existing data still accessible (migrated to lunch)

---

## 🚀 Deployment Steps

1. **Backup database** before running migration
2. Run `MEAL_SLOTS_MIGRATION.sql` in Supabase
3. Deploy frontend changes (admin + user pages)
4. Deploy API changes (attendance + billing)
5. Test thoroughly with sample data
6. Train admins on new 3-poll system
7. Notify users about new meal slot system

---

## 📝 Future Enhancements

- **Dynamic meal slots**: Allow custom meal slots beyond breakfast/lunch/dinner
- **Meal slot scheduling**: Auto-create polls at specific times
- **Menu planning**: Week-ahead menu scheduling
- **Dietary preferences**: Per meal slot dietary options
- **Meal slot analytics**: Popular meal times, patterns

---

**Status**: SQL migration ready. Frontend/API changes needed.  
**Estimated implementation time**: 2-3 days for full feature  
**Priority**: HIGH (addresses core user experience issue)
