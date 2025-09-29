// app/user/billing/components/BillingHeader.js
'use client';

import { Receipt, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BillingHeader = ({ userProfile }) => {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/user/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <Receipt className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">My Bills</h1>
              <p className="text-sm text-gray-500">View your billing history and payments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{userProfile?.full_name}</div>
              <div className="text-xs text-gray-500">{userProfile?.user_id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingHeader;