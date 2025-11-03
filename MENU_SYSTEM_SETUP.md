# Menu Management System - Database Setup

## Required Database Table

Run this SQL in your Supabase SQL Editor to create the menus table:

```sql
-- Create menus table
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX idx_menus_date ON menus(date);

-- Set up RLS policy (optional - currently disabled for easier access)
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Public read policy - everyone can view menus
CREATE POLICY "menus_public_read" ON menus
  FOR SELECT USING (true);

-- Admin write policy - only admins can create/update/delete
CREATE POLICY "menus_admin_write" ON menus
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "menus_admin_update" ON menus
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "menus_admin_delete" ON menus
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
```

## New Pages Created

### Admin Pages
- **`/admin/menu`** - Menu management dashboard where admins can:
  - Create daily menus
  - Edit existing menus
  - Delete menus
  - Add multiple menu items per day
  - Add descriptions for each item

### User Pages
- **`/menu`** - Today's menu display showing:
  - All items for today
  - Item descriptions
  - Dynamic content from admin-created menus

- **`/user/meal-history`** - User meal history showing:
  - All attended meals (dates and details)
  - Portion size (full/half)
  - Statistics (total meals, full/half breakdown)
  - Attended days count

## Updated Components

### ActionCards (`app/user/dashboard/components/ActionCards.js`)
- **Today's Menu** - Now links to `/menu` (was a non-functional div)
- **Meal History** - Now links to `/user/meal-history` (was a non-functional div)
- Added icons (UtensilsCrossed, History) for better UX

### DashboardHeader (`app/admin/dashboard/components/DashboardHeader.js`)
- Added "Menu Management" button to admin navigation
- Desktop and mobile menu support
- Easy access to `/admin/menu`

### PageErrorBoundary (`components/PageErrorBoundary.js`)
- Added `AdminMenuErrorBoundary` for error handling on admin menu page

## API Endpoints

### GET `/api/menu`
Query parameters:
- `action=get-today` - Get today's menu
- `action=get-by-date&date=YYYY-MM-DD` - Get menu for specific date
- `action=get-monthly&year=YYYY&month=MM` - Get all menus for a month
- `action=get-all` - Get all menus

### POST `/api/menu`
Requires admin role. Actions:
- `action=create-menu` with `{date, items, description}` - Create new menu
- `action=update-menu` with `{id, date, items, description}` - Update menu
- `action=delete-menu` with `{id}` - Delete menu

## Menu Item Format

Each menu item should have this structure:
```javascript
{
  name: "Veg Thali",
  description: "Includes dal, rice, roti & sabzi"
}
```

## User Journey

1. User views dashboard → clicks "Today's Menu"
2. User sees menu for today (if admin created one)
3. User clicks "Meal History" to see their past meals
4. Admin can manage menus by clicking "Menu Management" in admin dashboard
5. Admin creates menus for future dates
6. Customers see menus before the day arrives and can plan accordingly

## Next Steps

1. **Run SQL** to create the menus table
2. **Restart dev server** to ensure new pages load
3. **Login as Admin** and navigate to `/admin/menu`
4. **Create a test menu** for today
5. **Logout and login as User** to see the menu

## Features

✅ Admin can create menus in advance
✅ Multiple items per menu day
✅ Item descriptions for better info
✅ Users can view today's menu anytime
✅ Users can see meal history with statistics
✅ Automatic meal counting (full/half portions)
✅ Error boundaries for stability
✅ Loading states for better UX
✅ Fully responsive design (mobile & desktop)
✅ Date formatting for different locales
