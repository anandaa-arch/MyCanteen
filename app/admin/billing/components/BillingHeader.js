// app/admin/billing/components/BillingHeader.js
'use client';

import { Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BillingHeader = () => {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Receipt className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Billing Management</h1>
              <p className="text-sm text-gray-500">Manage monthly bills and payments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/polls')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
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