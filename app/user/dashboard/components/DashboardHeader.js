// app/user/dashboard/components/DashboardHeader.js
'use client'

import { LogOut, Home, Receipt, User, Menu, X, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const DashboardHeader = ({ onLogout, currentUser, userProfile }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left section - Logo and title */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Home className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">My Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Canteen Management System</p>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center space-x-1 mx-4">
            <button
              onClick={() => router.push('/user/dashboard')}
              className="px-3 xl:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/poll')}
              className="px-3 xl:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              Poll
            </button>
            <button
              onClick={() => router.push('/user/qr')}
              className="inline-flex items-center gap-2 px-3 xl:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              <QrCode size={16} />
              <span className="hidden xl:inline">QR Code</span>
            </button>
            <button
              onClick={() => router.push('/user/billing')}
              className="inline-flex items-center gap-2 px-3 xl:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              <Receipt size={16} />
              <span className="hidden xl:inline">Bills</span>
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-3 xl:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              Profile
            </button>
          </nav>

          {/* Desktop User info and logout - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {userProfile?.full_name || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-[120px]">
                  {userProfile?.user_id || currentUser?.email}
                </div>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <LogOut size={16} />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden transition-all duration-200 ease-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="py-4 space-y-2 border-t border-gray-100">
            {/* User Info on Mobile */}
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-lg mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {userProfile?.full_name || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {userProfile?.user_id || currentUser?.email}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                router.push('/user/dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-150 text-left font-medium touch-manipulation"
            >
              <Home size={18} className="flex-shrink-0" />
              Dashboard
            </button>

            <button
              onClick={() => {
                router.push('/poll');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-150 text-left font-medium touch-manipulation"
            >
              <Receipt size={18} className="flex-shrink-0" />
              Today&apos;s Poll
            </button>

            <button
              onClick={() => {
                router.push('/user/qr');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-150 text-left font-medium touch-manipulation"
            >
              <QrCode size={18} className="flex-shrink-0" />
              My QR Code
            </button>

            <button
              onClick={() => {
                router.push('/user/billing');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-150 text-left font-medium touch-manipulation"
            >
              <Receipt size={18} className="flex-shrink-0" />
              My Bills
            </button>

            <button
              onClick={() => {
                router.push('/profile');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-150 text-left font-medium touch-manipulation"
            >
              <User size={18} className="flex-shrink-0" />
              Profile
            </button>

            <div className="pt-3 mt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 text-gray-600 hover:text-red-700 hover:bg-red-50 px-4 py-3 rounded-lg transition-all duration-150 text-left font-medium touch-manipulation"
              >
                <LogOut size={18} className="flex-shrink-0" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
