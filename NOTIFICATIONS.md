# Real-time Notifications System Documentation

## Overview
The MyCanteen application now includes a comprehensive real-time notification system using Supabase Realtime subscriptions. This system provides instant notifications for payments, poll responses, and administrative actions.

## Features

### 1. Real-time Payment Notifications
- Automatic notification when a payment is recorded
- Notification when payment status changes
- User-specific payment tracking
- Supports both users and admins

### 2. Real-time Poll Notifications
- Instant notification when poll response is submitted
- Notification when admin confirms attendance
- Real-time synchronization across all users
- Date-specific tracking

### 3. Administrative Notifications
- New payment alerts for admins
- Poll response submission alerts
- Bill status change notifications
- User-friendly, non-intrusive design

## Architecture

### Core Components

#### `lib/notificationSystem.js`
Main notification system with:
- `useNotifications()` - Global notification state management
- `NotificationContainer` - Renders all active notifications
- `usePaymentNotifications()` - Subscribe to payment updates
- `usePollNotifications()` - Subscribe to poll updates
- `useAdminNotifications()` - Subscribe to admin events
- `NotificationBell` - Bell icon with unread count
- `NotificationHistory` - Full notification history

### Hooks

#### `useNotifications()`
Global notification hook for adding/removing notifications.

```javascript
const { notifications, addNotification, removeNotification, clearAll } = useNotifications();

// Add notification
addNotification({
  type: 'success', // 'success', 'error', 'info', 'payment'
  title: 'Payment Recorded',
  message: 'Payment of ₹500 recorded successfully',
  duration: 5000 // Optional, defaults to 5000ms
});
```

#### `usePaymentNotifications(userId, onNotification)`
Real-time subscription to payment events for a specific user.

```javascript
usePaymentNotifications(userId, (notification) => {
  addNotification(notification);
});
```

#### `usePollNotifications(userId, onNotification)`
Real-time subscription to poll events for a specific user.

```javascript
usePollNotifications(userId, (notification) => {
  addNotification(notification);
});
```

#### `useAdminNotifications(onNotification)`
Real-time subscription to all admin-relevant events (no userId required).

```javascript
useAdminNotifications((notification) => {
  addNotification(notification);
});
```

## Notification Types

### Success
- Green notification with checkmark icon
- Used for successful operations (payment recorded, poll submitted)
- Auto-dismisses after 6 seconds

### Error
- Red notification with alert icon
- Used for failed operations or errors
- Auto-dismisses after 6 seconds

### Info
- Blue notification with clock icon
- Used for status updates and information
- Auto-dismisses after 6 seconds

### Payment
- Emerald/green notification with dollar icon
- Used for payment-specific events
- Auto-dismisses after 6 seconds

## Integration Examples

### User Dashboard
```javascript
import { useNotifications, usePaymentNotifications, usePollNotifications } from '@/lib/notificationSystem';

function UserDashboard() {
  const { addNotification } = useNotifications();
  
  usePaymentNotifications(userId, (notification) => {
    addNotification(notification);
  });
  
  usePollNotifications(userId, (notification) => {
    addNotification(notification);
  });
}
```

### Admin Dashboard
```javascript
import { useNotifications, useAdminNotifications } from '@/lib/notificationSystem';

function AdminDashboard() {
  const { addNotification } = useNotifications();
  
  useAdminNotifications((notification) => {
    addNotification(notification);
  });
  
  addNotification({
    type: 'info',
    title: 'Welcome',
    message: 'Dashboard loaded',
    duration: 4000
  });
}
```

## Database Events Tracked

### Payments Table
- **INSERT**: New payment recorded
- **UPDATE**: Payment status changed

### Poll Responses Table
- **INSERT**: New poll response submitted
- **UPDATE**: Poll confirmation status changed

### Bills Table
- **UPDATE**: Bill status changed

## Notification UI

### Notification Container
Automatically renders at the top-right corner of the screen with:
- Smooth slide-in animation
- Auto-dismiss after duration expires
- Manual close button
- Color-coded by type
- Responsive design

### Notification Bell
Shows unread notification count with:
- Badge with count (displays "9+" for 10+)
- Click to open notification history
- Dropdown with full notification list

### Notification History
Displays:
- Full notification messages
- Timestamp for each notification
- Ability to clear all at once
- Scrollable list with max height

## Best Practices

1. **Error Handling**
   - Always include error notifications for failed operations
   - Provide clear, actionable error messages

2. **Duration Management**
   - Keep durations between 4-7 seconds
   - Use `duration: 'permanent'` for critical alerts only
   - Quick operations: 4000ms
   - Important updates: 6000ms
   - Admin alerts: 7000ms

3. **Notification Frequency**
   - Avoid notification spam
   - Group related notifications
   - Use rate limiting for high-frequency events

4. **User Experience**
   - Keep messages concise and clear
   - Use appropriate icons and colors
   - Don't overuse notifications
   - Ensure notifications don't block content

## Supabase Realtime Configuration

The system uses Supabase's `postgres_changes` feature:
- Schema: `public`
- Tables monitored: `transactions`, `poll_responses`, `bills`
- Events: `INSERT`, `UPDATE`
- Filters: User-specific filters for privacy

## Future Enhancements

Planned improvements:
1. Notification persistence in database
2. User notification preferences
3. Email notifications for important events
4. Push notifications for mobile
5. Notification categories/grouping
6. Read/unread status tracking
7. Notification actions (e.g., "Pay Now" button)
8. Sound alerts for critical notifications

## Troubleshooting

### Notifications not appearing
1. Check Supabase realtime is enabled
2. Verify user authentication
3. Check browser console for errors
4. Ensure notification hooks are called after user login

### Duplicate notifications
1. Check subscription cleanup in useEffect
2. Verify hooks are only called once
3. Check for multiple provider instances

### Slow notifications
1. Check network connection
2. Verify Supabase connection
3. Check browser performance
4. Monitor database load

## Configuration Files

- `lib/notificationSystem.js` - Main system
- `components/NotificationSidebar.js` - UI component
- `app/layout.js` - Global setup
- `app/user/dashboard/page.js` - User notifications
- `app/admin/dashboard/page.js` - Admin notifications
- `app/admin/billing/page.js` - Payment notifications
