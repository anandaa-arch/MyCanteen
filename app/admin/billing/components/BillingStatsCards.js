// app/admin/billing/components/BillingStatsCards.js
'use client';

import { Users, Calculator, DollarSign, IndianRupee } from 'lucide-react';

const BillingStatsCards = ({ totalStats }) => {
  const statsConfig = [
    {
      title: 'Total Bills',
      value: totalStats.totalBills,
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      format: (val) => val
    },
    {
      title: 'Total Amount',
      value: totalStats.totalAmount,
      icon: IndianRupee,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      format: (val) => `₹${val.toFixed(2)}`
    },
    {
      title: 'Total Paid',
      value: totalStats.totalPaid,
      icon: DollarSign,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      format: (val) => `₹${val.toFixed(2)}`
    },
    {
      title: 'Total Due',
      value: totalStats.totalDue,
      icon: Calculator,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      format: (val) => `₹${val.toFixed(2)}`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
      {statsConfig.map(({ title, value, icon: Icon, iconColor, bgColor, format }) => (
        <div key={title} className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${bgColor} flex-shrink-0`}>
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">{format(value)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BillingStatsCards;