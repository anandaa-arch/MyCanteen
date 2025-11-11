// Notification Sidebar Component
'use client';

import { useState } from 'react';
import { Bell, X, ChevronDown } from 'lucide-react';
import { NotificationBell, NotificationHistory } from '@/lib/notificationSystem';

export default function NotificationSidebar({ notifications, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.length;

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <NotificationBell 
          unreadCount={unreadCount}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-gray-700" />
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              <NotificationHistory 
                notifications={notifications}
                onClear={() => {
                  onClear();
                  setIsOpen(false);
                }}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
