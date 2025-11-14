// app/admin/billing/components/MealDetailsModal.js
'use client';

import { X, Clock, CheckCircle, XCircle } from 'lucide-react';

const formatSlotLabel = (slot) => {
  if (!slot) return '—';
  return slot.charAt(0).toUpperCase() + slot.slice(1);
};

const formatMealType = (portion) => (portion === 'half' ? 'Half Meal' : 'Full Meal');

const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (meal) => {
  const source = meal.attended_at || meal.actual_meal_time || meal.confirmed_at;
  if (!source) return null;
  return new Date(source).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function MealDetailsModal({ showModal, bill, meals, loading, error, onClose }) {
  if (!showModal || !bill) return null;

  const billingPeriodLabel = new Date(bill.year, bill.month - 1, 1).toLocaleDateString('en-US', {
    month: 'long'
  });
  const mealList = meals || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Meal Details</h3>
            <p className="text-sm text-gray-500">
              {bill.user_profile?.full_name || 'Unknown User'} • {billingPeriodLabel} {bill.year}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-gray-500">Loading meal details...</div>
          ) : mealList.length === 0 ? (
            <div className="py-16 text-center text-gray-500">No confirmed meals found for this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Slot</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Meal Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Attendance Time</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mealList.map((meal) => {
                    const timeLabel = formatTime(meal);
                    return (
                      <tr key={meal.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{formatDate(meal.date)}</td>
                        <td className="px-4 py-3 text-gray-600">{formatSlotLabel(meal.meal_slot)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            meal.portion_size === 'full'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {formatMealType(meal.portion_size)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">₹{meal.cost}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {timeLabel ? (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {timeLabel}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {meal.isPaid && meal.payment ? (
                            <div className="text-green-700 text-xs">
                              <div className="inline-flex items-center gap-1 font-semibold">
                                <CheckCircle className="w-3 h-3" /> Paid
                              </div>
                              <div>{new Date(meal.payment.payment_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}</div>
                              <div className="text-gray-500">{meal.payment.payment_method}</div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold">
                              <XCircle className="w-3 h-3" /> Unpaid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
