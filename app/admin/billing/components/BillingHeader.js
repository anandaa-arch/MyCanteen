// app/admin/billing/components/BillingHeader.js
'use client';

import { Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BillingHeader = () => {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-0 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                Billing Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Manage monthly bills and payments
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 lg:gap-3 ml-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-3 lg:px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/polls')}
              className="px-3 lg:px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap"
            >
              Polls
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingHeader;