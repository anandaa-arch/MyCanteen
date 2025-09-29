// app/admin/billing/components/BillingTable.js
'use client';

import { Receipt, Plus } from 'lucide-react';

const BillingTable = ({ 
  filteredBills, 
  loading, 
  getStatusBadge,
  onAddPayment 
}) => {
  const TableSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <tr key={i}>
        <td colSpan="7" className="px-6 py-4">
          <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
        </td>
      </tr>
    ))
  );

  const EmptyState = () => (
    <tr>
      <td colSpan="7" className="px-6 py-12 text-center">
        <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
        <p className="text-gray-600">Generate bills for this month or adjust your filters.</p>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meals
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <TableSkeleton />
            ) : filteredBills.length === 0 ? (
              <EmptyState />
            ) : (
              filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {bill.profiles_new?.full_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bill.user_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bill.profiles_new?.email}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                          Half: {bill.half_meal_count || 0}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Full: {bill.full_meal_count || 0}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total: {(bill.half_meal_count || 0) + (bill.full_meal_count || 0)} meals
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{(bill.total_amount || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Half: ₹{(bill.half_meal_cost || 0).toFixed(2)} • 
                      Full: ₹{(bill.full_meal_cost || 0).toFixed(2)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      ₹{(bill.paid_amount || 0).toFixed(2)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${
                      bill.due_amount > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ₹{(bill.due_amount || 0).toFixed(2)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(bill.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {bill.status !== 'paid' && (
                      <button
                        onClick={() => onAddPayment(bill)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                        Add Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingTable;