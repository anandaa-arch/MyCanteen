// Real-time Notification System
import { useEffect, useState, useCallback } from 'react';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { Bell, X, CheckCircle, AlertCircle, Clock, DollarSign } from 'lucide-react';

// Notification Context Hook
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const supabase = useSupabaseClient();

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Auto-remove after 5 seconds if no duration specified
    if (notification.duration !== 'permanent') {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, notification.duration || 5000);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
};

// Notification Display Component
export const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

// Individual Notification Component
const Notification = ({ notification, onClose }) => {
  const getStyles = (type) => {
    const styles = {
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-600',
        Icon: CheckCircle,
      },
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600',
        Icon: AlertCircle,
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600',
        Icon: Clock,
      },
      payment: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        icon: 'text-emerald-600',
        Icon: DollarSign,
      },
    };

    return styles[type] || styles.info;
  };

  const style = getStyles(notification.type);
  const Icon = style.Icon;

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4 shadow-lg animate-slide-in-right flex items-start gap-3`}
    >
      <Icon className={`${style.icon} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1">
        <h4 className={`${style.text} font-semibold text-sm`}>
          {notification.title}
        </h4>
        <p className={`${style.text} text-sm opacity-90`}>
          {notification.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className={`${style.text} opacity-50 hover:opacity-100 transition flex-shrink-0`}
      >
        <X size={18} />
      </button>
    </div>
  );
};

// Real-time Payment Notifications Hook
export const usePaymentNotifications = (userId, onNotification) => {
  const supabase = useSupabaseClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const subscribeToPayments = async () => {
      const channel = supabase
        .channel(`payments_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const transaction = payload.new;
            onNotification({
              type: 'payment',
              title: 'Payment Recorded',
              message: `Payment of ₹${transaction.amount} has been recorded successfully.`,
              duration: 6000,
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const transaction = payload.new;
            onNotification({
              type: 'info',
              title: 'Payment Updated',
              message: `Payment status updated to ${transaction.status}.`,
              duration: 6000,
            });
          }
        )
        .subscribe((status) => {
          setIsSubscribed(status === 'SUBSCRIBED');
          console.log('Payment subscription status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    };

    subscribeToPayments();
  }, [userId, supabase, onNotification]);

  return isSubscribed;
};

// Real-time Poll Notifications Hook
export const usePollNotifications = (userId, onNotification) => {
  const supabase = useSupabaseClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const subscribeToPoll = async () => {
      const today = new Date().toISOString().slice(0, 10);

      const channel = supabase
        .channel(`poll_${userId}_${today}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'poll_responses',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const response = payload.new;
            onNotification({
              type: 'success',
              title: 'Poll Submitted',
              message: `Your attendance poll has been submitted. Attendance: ${
                response.present ? 'Present' : 'Absent'
              }, Portion: ${response.portion_size}.`,
              duration: 6000,
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'poll_responses',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const response = payload.new;
            const confirmationText =
              response.confirmation_status === 'confirmed_attended'
                ? 'confirmed'
                : 'updated';
            onNotification({
              type: 'info',
              title: 'Poll Response Updated',
              message: `Your poll response has been ${confirmationText}.`,
              duration: 6000,
            });
          }
        )
        .subscribe((status) => {
          setIsSubscribed(status === 'SUBSCRIBED');
          console.log('Poll subscription status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    };

    subscribeToPoll();
  }, [userId, supabase, onNotification]);

  return isSubscribed;
};

// Admin Real-time Notifications Hook (for payments and poll updates)
export const useAdminNotifications = (onNotification) => {
  const supabase = useSupabaseClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const subscribeToAdminEvents = async () => {
      const channel = supabase
        .channel('admin_events')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
          },
          (payload) => {
            const transaction = payload.new;
            onNotification({
              type: 'payment',
              title: 'New Payment',
              message: `Payment of ₹${transaction.amount} received from user.`,
              duration: 7000,
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'poll_responses',
          },
          (payload) => {
            const response = payload.new;
            onNotification({
              type: 'info',
              title: 'New Poll Response',
              message: `User submitted poll response for ${response.date}.`,
              duration: 7000,
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bills',
          },
          (payload) => {
            const bill = payload.new;
            onNotification({
              type: 'info',
              title: 'Bill Updated',
              message: `Bill status changed to ${bill.status}.`,
              duration: 7000,
            });
          }
        )
        .subscribe((status) => {
          setIsSubscribed(status === 'SUBSCRIBED');
          console.log('Admin notifications subscription status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    };

    subscribeToAdminEvents();
  }, [supabase, onNotification]);

  return isSubscribed;
};

// Notification Bell Component (shows count of unread notifications)
export const NotificationBell = ({ unreadCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-blue-600 transition"
      title="Notifications"
    >
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

// Notification History Component
export const NotificationHistory = ({ notifications, onClear }) => {
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Bell size={32} className="mx-auto mb-2 opacity-50" />
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">
                {notification.title}
              </h4>
              <p className="text-gray-600 text-sm">{notification.message}</p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={onClear}
        className="w-full mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        Clear All
      </button>
    </div>
  );
};
