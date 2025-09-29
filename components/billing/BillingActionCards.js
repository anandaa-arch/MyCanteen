// components/billing/BillingActionCards.js
'use client';

import { Receipt, Calculator, IndianRupee, AlertCircle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Admin Billing Cards
export const AdminBillingCards = ({ currentMonth, currentYear, billingStats }) => {
  const router = useRouter();

  const handleGenerateBills = () => {
    router.push('/admin/billing');
  };

  const handleViewBilling = () => {
    router.push('/admin/billing');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        onClick={handleGenerateBills}
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Generate Monthly Bills</h3>
            <p className="text-blue-100 text-sm mb-3">
              Create bills for {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
            </p>
            {billingStats && (
              <div className="text-sm text-blue-200">
                Last month: {billingStats.totalBills || 0} bills generated
              </div>
            )}
          </div>
          <Calculator className="w-8 h-8 text-blue-200" />
        </div>
        <div className="mt-4">
          <span className="text-xs bg-blue-400 bg-opacity-50 px-2 py-1 rounded-full">
            Click to manage billing
          </span>
        </div>
      </div>

      <div 
        onClick={handleViewBilling}
        className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">View All Bills</h3>
            <p className="text-green-100 text-sm mb-3">
              Track payments and outstanding dues
            </p>
            {billingStats && (
              <div className="text-sm text-green-200">
                Total due: ₹{(billingStats.totalDue || 0).toFixed(2)}
              </div>
            )}
          </div>
          <Receipt className="w-8 h-8 text-green-200" />
        </div>
        <div className="mt-4">
          <span className="text-xs bg-green-400 bg-opacity-50 px-2 py-1 rounded-full">
            Billing dashboard
          </span>
        </div>
      </div>
    </div>
  );
};

// User Billing Cards
export const UserBillingCards = ({ totalDue = 0, lastBillAmount = 0, totalPaid = 0 }) => {
  const router = useRouter();

  const handleViewBills = () => {
    router.push('/user/billing');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        onClick={handleViewBills}
        className={`${
          totalDue > 0 
            ? 'bg-gradient-to-r from-red-500 to-red-600' 
            : 'bg-gradient-to-r from-green-500 to-green-600'
        } rounded-lg p-6 text-white cursor-pointer hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-lg`}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">Outstanding Due</h3>
            <p className="text-2xl font-bold">₹{totalDue.toFixed(2)}</p>
          </div>
          {totalDue > 0 ? (
            <AlertCircle className="w-8 h-8 text-red-200" />
          ) : (
            <Receipt className="w-8 h-8 text-green-200" />
          )}
        </div>
        <div className="text-sm opacity-90">
          {totalDue > 0 ? 'Payment pending' : 'All bills cleared'}
        </div>
      </div>

      <div 
        onClick={handleViewBills}
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">Last Bill</h3>
            <p className="text-2xl font-bold">₹{lastBillAmount.toFixed(2)}</p>
          </div>
          <IndianRupee className="w-8 h-8 text-blue-200" />
        </div>
        <div className="text-sm opacity-90">
          Recent billing amount
        </div>
      </div>

      <div 
        onClick={handleViewBills}
        className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">Total Paid</h3>
            <p className="text-2xl font-bold">₹{totalPaid.toFixed(2)}</p>
          </div>
          <Receipt className="w-8 h-8 text-purple-200" />
        </div>
        <div className="text-sm opacity-90">
          Total payments made
        </div>
      </div>
    </div>
  );
};

// Billing Summary Card for Stats
export const BillingSummaryCard = ({ 
  totalUsers = 0, 
  totalRevenue = 0, 
  pendingDues = 0, 
  isAdmin = true,
  collectionRate = 0
}) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isAdmin ? 'Billing Overview' : 'My Billing Summary'}
        </h3>
        <Receipt className="w-6 h-6 text-gray-600" />
      </div>
      
      <div className="space-y-4">
        {isAdmin && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Users Billed:</span>
            <span className="font-semibold text-gray-900">{totalUsers}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {isAdmin ? 'Total Revenue:' : 'Total Paid:'}
          </span>
          <span className="font-semibold text-green-600">₹{totalRevenue.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {isAdmin ? 'Pending Dues:' : 'Outstanding Due:'}
          </span>
          <span className={`font-semibold ${pendingDues > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ₹{pendingDues.toFixed(2)}
          </span>
        </div>

        {isAdmin && collectionRate > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Collection Rate:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-600">{collectionRate.toFixed(1)}%</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        )}
        
        {pendingDues > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">
                {isAdmin ? 'Some users have pending dues' : 'You have outstanding dues'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Billing Stats for Dashboard
export const QuickBillingStats = ({ stats, isAdmin = false }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(isAdmin ? '/admin/billing' : '/user/billing');
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              {isAdmin ? 'Billing Status' : 'My Bills'}
            </h4>
            <p className="text-xs text-gray-500">
              {isAdmin ? 'Overview of all bills' : 'Payment status'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            ₹{(stats?.totalAmount || stats?.totalDue || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            {isAdmin ? 'Total Revenue' : 'Outstanding'}
          </div>
        </div>
      </div>
    </div>
  );
};