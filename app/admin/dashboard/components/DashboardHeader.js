// app/admin/dashboard/components/DashboardHeader.js
'use client';

import { Plus, BarChart3, Package, Menu, X, User, LogOut, UtensilsCrossed, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardHeader({ onCreateUser, onManagePolls, onManageInventory, onLogout, currentUser }) {
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-18">
          {/* Brand Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 tracking-tight truncate">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block leading-tight truncate">
                Canteen Management System
              </p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-150 font-medium text-sm border border-transparent hover:border-blue-200"
            >
              <BarChart3 size={16} className="text-blue-600" />
              <span className="hidden xl:inline">Dashboard</span>
              <span className="xl:hidden">Home</span>
            </button>

            <button
              onClick={onManagePolls}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-all duration-150 font-medium text-sm border border-transparent hover:border-emerald-200"
            >
              <BarChart3 size={16} className="text-emerald-600" />
              <span className="hidden xl:inline">Manage Polls</span>
              <span className="xl:hidden">Polls</span>
            </button>

            <button
              onClick={() => router.push('/admin/billing')}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-purple-700 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all duration-150 font-medium text-sm border border-transparent hover:border-purple-200"
            >
              <Package size={16} className="text-purple-600" />
              <span className="hidden xl:inline">Billing</span>
              <span className="xl:hidden">Bills</span>
            </button>

            <button
              onClick={() => router.push('/admin/menu')}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-150 font-medium text-sm border border-transparent hover:border-red-200"
            >
              <UtensilsCrossed size={16} className="text-red-600" />
              <span className="hidden xl:inline">Menu</span>
              <span className="xl:hidden">Menu</span>
            </button>

            <button
              onClick={() => router.push('/admin/qr-scanner')}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 px-3 py-2 rounded-lg transition-all duration-150 font-medium text-sm border border-transparent hover:border-cyan-200"
            >
              <Smartphone size={16} className="text-cyan-600" />
              <span className="hidden xl:inline">QR Scanner</span>
              <span className="xl:hidden">Scanner</span>
            </button>
            
            {onManageInventory && (
              <button
                onClick={onManageInventory}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-700 hover:bg-orange-50 px-3 py-2 rounded-lg transition-all duration-150 font-medium text-sm border border-transparent hover:border-orange-200"
              >
                <Package size={16} className="text-orange-600" />
                <span className="hidden xl:inline">Inventory & Expenses</span>
                <span className="xl:hidden">Inventory</span>
              </button>
            )}
            
            <button
              onClick={onCreateUser}
              className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-150 font-medium text-sm shadow-sm hover:shadow-md ml-2"
            >
              <Plus size={16} />
              <span className="hidden xl:inline">Create User</span>
              <span className="xl:hidden">Create</span>
            </button>
            
            <div className="w-px h-6 bg-gray-200 mx-3"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">Admin</div>
                <div className="text-xs text-gray-500">{currentUser?.email}</div>
              </div>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-150 font-medium text-sm border border-transparent hover:border-red-200"
              >
                <LogOut size={16} />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex-shrink-0">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2.5 sm:p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X size={24} className="sm:w-5 sm:h-5" />
              ) : (
                <Menu size={24} className="sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-[600px] opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="py-3 space-y-1.5 border-t border-gray-100">
            <button
              onClick={() => {
                router.push('/admin/dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 text-gray-700 hover:text-blue-700 active:bg-blue-100 hover:bg-blue-50 px-4 py-3.5 rounded-lg transition-all duration-150 text-left font-medium border border-transparent hover:border-blue-200 touch-manipulation min-h-[48px]"
            >
              <BarChart3 size={20} className="text-blue-600 flex-shrink-0" />
              <span className="text-base">Dashboard</span>
            </button>


            <button
              onClick={() => {
                onManagePolls();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 text-gray-700 hover:text-emerald-700 active:bg-emerald-100 hover:bg-emerald-50 px-4 py-3.5 rounded-lg transition-all duration-150 text-left font-medium border border-transparent hover:border-emerald-200 touch-manipulation min-h-[48px]"
            >
              <BarChart3 size={20} className="text-emerald-600 flex-shrink-0" />
              <span className="text-base">Manage Polls</span>
            </button>

            <button
              onClick={() => {
                router.push('/admin/billing');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 text-gray-700 hover:text-purple-700 active:bg-purple-100 hover:bg-purple-50 px-4 py-3.5 rounded-lg transition-all duration-150 text-left font-medium border border-transparent hover:border-purple-200 touch-manipulation min-h-[48px]"
            >
              <Package size={20} className="text-purple-600 flex-shrink-0" />
              <span className="text-base">Billing</span>
            </button>

            <button
              onClick={() => {
                router.push('/admin/menu');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 text-gray-700 hover:text-red-700 active:bg-red-100 hover:bg-red-50 px-4 py-3.5 rounded-lg transition-all duration-150 text-left font-medium border border-transparent hover:border-red-200 touch-manipulation min-h-[48px]"
            >
              <UtensilsCrossed size={20} className="text-red-600 flex-shrink-0" />
              <span className="text-base">Menu Management</span>
            </button>

            <button
              onClick={() => {
                router.push('/admin/qr-scanner');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 text-gray-700 hover:text-cyan-700 active:bg-cyan-100 hover:bg-cyan-50 px-4 py-3.5 rounded-lg transition-all duration-150 text-left font-medium border border-transparent hover:border-cyan-200 touch-manipulation min-h-[48px]"
            >
              <Smartphone size={20} className="text-cyan-600 flex-shrink-0" />
              <span className="text-base">QR Scanner</span>
            </button>

            {onManageInventory && (
              <button
                onClick={() => {
                  onManageInventory();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 text-gray-700 hover:text-orange-700 active:bg-orange-100 hover:bg-orange-50 px-4 py-3.5 rounded-lg transition-all duration-150 text-left font-medium border border-transparent hover:border-orange-200 touch-manipulation min-h-[48px]"
              >
                <Package size={20} className="text-orange-600 flex-shrink-0" />
                <span className="text-base">Inventory & Expenses</span>
              </button>
            )}
            
            <button
              onClick={() => {
                onCreateUser();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 px-4 py-3.5 rounded-lg transition-all duration-150 text-left font-medium shadow-sm touch-manipulation min-h-[48px]"
            >
              <Plus size={20} className="flex-shrink-0" />
              <span className="text-base">Create User</span>
            </button>
            
            <div className="pt-2 mt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 text-gray-600 hover:text-red-700 active:bg-red-100 hover:bg-red-50 px-4 py-3.5 rounded-lg transition-all duration-150 text-left font-medium border border-transparent hover:border-red-200 touch-manipulation min-h-[48px]"
              >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="text-base">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}