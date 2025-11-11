# 📺 Visual Reference: What You'll See

## Customer Dashboard (After They Submit Poll)

### Status 1: Just Submitted (Pending)
```
┌─────────────────────────────────────────┐
│        TODAY'S POLL RESPONSE            │
├─────────────────────────────────────────┤
│                                         │
│  Attending • full portion               │
│                                         │
│  Status Badge: [✏️ Pending Response]   │
│                                         │
│  [Mark as Attending Now] [Update] [⊗]  │
│                                         │
└─────────────────────────────────────────┘
```

### Status 2: Marked as Attending (Awaiting Admin)
```
┌─────────────────────────────────────────┐
│        TODAY'S POLL RESPONSE            │
├─────────────────────────────────────────┤
│                                         │
│  Attending • full portion               │
│                                         │
│  Status Badge: [⏳ Awaiting Admin...]  │
│                                         │
│  Message: "You marked as attending.    │
│            Admin will confirm soon."    │
│                                         │
│  [Update] [Cancel Response]             │
│                                         │
└─────────────────────────────────────────┘
```

### Status 3: Confirmed by Admin
```
┌─────────────────────────────────────────┐
│        TODAY'S POLL RESPONSE            │
├─────────────────────────────────────────┤
│                                         │
│  Attending • full portion               │
│                                         │
│  Status Badge: [✅ Confirmed Attended] │
│                                         │
│  Message: "Your attendance has been    │
│            confirmed!"                  │
│                                         │
│  [Update Response]                      │
│                                         │
└─────────────────────────────────────────┘
```

---

## Admin Dashboard (Poll Management)

### Table View
```
┌──────────────────────────────────────────────────────────────────────┐
│ POLL MANAGEMENT                                                      │
│ Manage daily meal attendance and confirmations        admin@test.com  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Date: [Today ▼]    Filter: [All Users▼][Pending...▼][Confirmed▼]  │
│                                                                      │
├────┬───────────────┬──────────┬──────────┬────────┬────────────────┤
│ USER│ CONTACT      │ STATUS   │ RESPONSE │PORTION │ ACTIONS        │
├────┼───────────────┼──────────┼──────────┼────────┼────────────────┤
│👤  │ Anand         │⏳ Await  │[Present] │Full ▶  │[Confirm]       │
│    │ 9162... @... │ Confirm │   ◀Present◀       │                │
├────┼───────────────┼──────────┼──────────┼────────┼────────────────┤
│👤  │ Test User     │✅ Conf   │[Present] │Full ▶  │✅ Confirmed    │
│    │ 9162... @... │ Attended│   ◀Present◀       │                │
├────┼───────────────┼──────────┼──────────┼────────┼────────────────┤
│👤  │ kundan        │❌ No     │[Absent ] │Full ▶  │❌ No Show      │
│    │ 7058... @... │ Show     │   ◀Absent◀        │                │
├────┼───────────────┼──────────┼──────────┼────────┼────────────────┤
│👤  │ New Test User │📵 Cancel │[Present] │Full ▶  │- - - - - - - -│
│    │ 9876... @... │ led      │   ◀Present◀       │                │
└────┴───────────────┴──────────┴──────────┴────────┴────────────────┘
```

### Admin Clicks "Confirm" Button → Modal Opens
```
╔════════════════════════════════════════╗
║  Confirm Attendance - Anand            ║
╠════════════════════════════════════════╣
║                                        ║
║  Choose an action to confirm or reject:║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ Optional: Add notes               │ ║
║  │ "Took half meal instead"          │ ║
║  │ "Didn't show up with reason"      │ ║
║  │ "Verified in person at counter"   │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  [✅ Attended] [❌ No Show] [🚫 Reject]║
║                                        ║
║                    [Cancel]            ║
║                                        ║
╚════════════════════════════════════════╝
```

### After Admin Confirms
```
Table Row Updates:

BEFORE:
│👤  │ Anand         │⏳ Await  │[Present] │Full ▶  │[Confirm]       │
│    │ 9162... @... │ Confirm │         │        │                │

AFTER (status = confirmed_attended):
│👤  │ Anand         │✅ Conf   │[Present] │Full ▶  │✅ Confirmed    │
│    │ 9162... @... │ Attended│         │        │                │

Row color changes to GREEN background ✅
Status shows: confirmed_attended
Database fields populated:
  - confirmed_by: admin_uuid
  - confirmed_at: 2025-10-17 13:30:00
  - admin_notes: "Verified in person"
```

---

## Database View (What Gets Stored)

### Before (Old System)
```
id     | user_id          | date       | confirmation_status
───────┼──────────────────┼────────────┼──────────────────
abc123 | user_uuid_1      | 2025-10-17 | pending
def456 | user_uuid_2      | 2025-10-17 | confirmed
ghi789 | user_uuid_3      | 2025-10-17 | rejected
```

### After (New System - 2-Step Verification)
```
id     | user_id          | date       | confirmation_status      | attended_at              | confirmed_by | confirmed_at             | admin_notes
───────┼──────────────────┼────────────┼──────────────────────────┼──────────────────────────┼──────────────┼──────────────────────────┼────────────────
abc123 | user_uuid_1      | 2025-10-17 | confirmed_attended       | 2025-10-17 12:30:00     | admin_id     | 2025-10-17 12:35:00      | Verified in person
def456 | user_uuid_2      | 2025-10-17 | no_show                  | 2025-10-17 12:32:00     | admin_id     | 2025-10-17 12:40:00      | Didn't come to counter
ghi789 | user_uuid_3      | 2025-10-17 | awaiting_admin_confir... | 2025-10-17 12:29:00     | NULL         | NULL                     | NULL
```

---

## API Response Examples

### Customer Marks as Attended (Success)
```json
{
  "success": true,
  "message": "Marked as attending - waiting for admin confirmation",
  "data": {
    "id": "abc123",
    "confirmation_status": "awaiting_admin_confirmation",
    "attended_at": "2025-10-17T12:30:00.000Z",
    "updated_at": "2025-10-17T12:30:00.000Z"
  }
}
```

### Admin Confirms Attendance (Success)
```json
{
  "success": true,
  "message": "Poll response confirm attended successfully",
  "data": {
    "id": "abc123",
    "confirmation_status": "confirmed_attended",
    "confirmed_by": "admin_uuid",
    "confirmed_at": "2025-10-17T12:35:00.000Z",
    "admin_notes": "Verified in person at lunch counter",
    "updated_at": "2025-10-17T12:35:00.000Z"
  }
}
```

### Admin Marks No Show (Success)
```json
{
  "success": true,
  "message": "Poll response no show successfully",
  "data": {
    "id": "abc123",
    "confirmation_status": "no_show",
    "confirmed_by": "admin_uuid",
    "confirmed_at": "2025-10-17T12:40:00.000Z",
    "admin_notes": "Said yes but never came to counter",
    "updated_at": "2025-10-17T12:40:00.000Z"
  }
}
```

---

## Status Badge Colors & Icons

```
pending_customer_response
  ✏️  Gray badge
  "✏️ Pending Your Response"

awaiting_admin_confirmation
  ⏳  Yellow badge
  "⏳ Awaiting Admin Confirmation"

confirmed_attended
  ✅  Green badge
  "✅ Confirmed"

no_show
  ❌  Red badge
  "❌ No Show"

rejected
  🚫  Orange badge
  "🚫 Rejected"

cancelled
  📵  Gray badge
  "📵 Cancelled"
```

---

## Complete Flow Animation

```
TIME: 12:00 PM
┌─ Customer opens app, submits poll
└─ Status: ✏️ Pending (no button shown)

TIME: 12:20 PM
┌─ Customer comes near canteen
└─ Dashboard shows: [Mark as Attending Now] button

TIME: 12:25 PM (Customer clicks button)
┌─ Status changes to: ⏳ Awaiting Admin
└─ Message shows: "Admin will confirm soon"

TIME: 12:30 PM (Admin opens admin/polls)
┌─ Admin sees table
├─ Sees customer name with ⏳ status
└─ [Confirm] button available

TIME: 12:32 PM (Admin clicks Confirm)
┌─ Modal opens
├─ Admin sees 3 options: Attended / No Show / Reject
├─ Admin adds optional notes
└─ Admin clicks "Confirm Attended"

TIME: 12:32 PM (Immediate Update)
┌─ Row color changes to GREEN
├─ Status shows: ✅ Confirmed
├─ Database updated with:
│  └─ confirmed_by, confirmed_at, admin_notes
└─ Customer dashboard shows: "✅ Confirmed!"

TIME: 2:00 PM (Billing)
┌─ Billing system runs
├─ Queries: WHERE confirmation_status = 'confirmed_attended'
├─ Finds: Anand (confirmed) + others
└─ Generates: Bills only for confirmed attendees ✅
```

---

This is what you're building! 🎉
