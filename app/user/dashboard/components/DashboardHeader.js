// app/user/dashboard/components/DashboardHeader.js
'use client'

import { LogOut, Home, Receipt, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DashboardHeader = ({ onLogout, currentUser, userProfile }) => {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo and title */}
          <div className="flex items-center gap-4">
            <Home className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">My Dashboard</h1>
              <p className="text-sm text-gray-500">Canteen Management System</p>
            </div>
          </div>

          {/* Center section - Navigation */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => router.push('/user/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/poll')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200"
            >
              Today&apos;s Poll
            </button>
            <button
              onClick={() => router.push('/user/billing')}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200"
            >
              <Receipt size={16} />
              My Bills
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200"
            >
              Profile
            </button>
          </div>

          {/* Right section - User info and logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {userProfile?.full_name || 'User'}
                </div>
                <div className="text-xs text-gray-500">
                  {userProfile?.user_id || currentUser?.email}
                </div>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
