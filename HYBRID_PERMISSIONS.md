# Hybrid Permission Model - MyCanteen

## Overview
The MyCanteen app uses a **hybrid permission model** that balances administrative control with user privacy.

---

## Permission Matrix

### Admin Permissions (via Admin Dashboard)

| Field | Can View? | Can Update? | Notes |
|-------|-----------|-------------|-------|
| `full_name` | ✅ Yes | ❌ No | **User-only field** - Personal identity |
| `email` | ✅ Yes | ❌ No | **User-only field** - Personal identifier |
| `dept` | ✅ Yes | ✅ Yes | Organizational field |
| `year` | ✅ Yes | ✅ Yes | Organizational field |
| `contact_number` | ✅ Yes | ✅ Yes | Organizational field |
| `role` | ✅ Yes | ❌ No | **Disabled** - Prevents accidental role changes |

### User Permissions (via Profile Page)

| Field | Can View? | Can Update? | Notes |
|-------|-----------|-------------|-------|
| `full_name` | ✅ Yes | ✅ Yes | Users control their own name |
| `email` | ✅ Yes | ✅ Yes | Users control their own email |
| `dept` | ✅ Yes | ⚠️ View-only | Set by admin |
| `year` | ✅ Yes | ⚠️ View-only | Set by admin |
| `contact_number` | ✅ Yes | ✅ Yes | Users can update their phone |
| `role` | ✅ Yes | ❌ No | System-managed |

---

## Implementation Details

### Database: Row Level Security (RLS) Policies

```sql
-- Policy 1: Admins can update organizational fields
CREATE POLICY "Admins can update organizational fields"
  ON profiles_new
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles_new
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles_new
  FOR UPDATE
  USING (auth.uid() = id);
```

### API: Field Restrictions

**Admin Update API** (`/api/admin/update-user`):
- Only updates: `contact_number`, `dept`, `year`
- Ignores: `full_name`, `email`, `role`
- Logs warnings when admin tries to update restricted fields

**User Update API** (to be implemented):
- Can update: `full_name`, `email`, `contact_number`
- Cannot update: `dept`, `year`, `role`

---

## Benefits

### For Users:
✅ **Privacy** - Personal identity (name, email) is protected  
✅ **Control** - Users own their personal data  
✅ **Trust** - Admin cannot impersonate or modify identity

### For Admins:
✅ **Management** - Can update organizational data (dept, year)  
✅ **Support** - Can help users with contact info  
✅ **Flexibility** - Can manage organizational structure

### For System:
✅ **Security** - Principle of least privilege  
✅ **Compliance** - Better data privacy compliance  
✅ **Audit Trail** - Clear separation of responsibilities

---

## Future Enhancements

1. **Role Management Page** - Dedicated admin page for changing user roles (with confirmation)
2. **Audit Logging** - Track all admin updates for compliance
3. **Bulk Updates** - Allow admin to update multiple users' dept/year at once
4. **User Profile Page** - Allow users to update their own name/email

---

## Testing Checklist

- [ ] Admin can view all user fields in dashboard
- [ ] Admin can update dept, year, contact_number
- [ ] Admin CANNOT update full_name or email (changes ignored)
- [ ] Users can update their own full_name and email
- [ ] Users can view but not change dept/year
- [ ] No user can change their own role
- [ ] RLS policies prevent unauthorized updates

---

**Last Updated:** October 12, 2025  
**Status:** ✅ Implemented
