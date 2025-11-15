// app/admin/billing/components/MealDetailsModal.js
'use client';

import { Fragment } from 'react';
import { X, Clock, CheckCircle, XCircle } from 'lucide-react';

const formatSlotLabel = (slot) => {
  if (!slot) return '—';
  return slot.charAt(0).toUpperCase() + slot.slice(1);
};

const slotOrder = ['breakfast', 'lunch', 'dinner'];

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
  const groupedMeals = slotOrder.map(slot => {
    const slotMeals = mealList
      .filter(meal => meal.meal_slot === slot)
      .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
    const total = slotMeals.reduce((sum, meal) => sum + (meal.cost || 0), 0);
    return {
      slot,
      label: formatSlotLabel(slot),
      meals: slotMeals,
      total
    };
  });
  const hasMeals = groupedMeals.some(group => group.meals.length > 0);
  const nonEmptyGroups = groupedMeals.filter(group => group.meals.length > 0);

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
          ) : !hasMeals ? (
            <div className="py-16 text-center text-gray-500">No confirmed meals found for this period.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {nonEmptyGroups.map(group => (
                  <div key={group.slot} className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm font-semibold text-gray-700">{group.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{group.meals.length}</p>
                    <p className="text-xs text-gray-500">Meals • ₹{group.total}</p>
                  </div>
                ))}
              </div>

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
                    {nonEmptyGroups.map(group => (
                      <Fragment key={group.slot}>
                        <tr className="bg-gray-100">
                          <td colSpan={6} className="px-4 py-2 text-sm font-semibold text-gray-700">
                            {group.label} • {group.meals.length} meal{group.meals.length > 1 ? 's' : ''} • ₹{group.total}
                          </td>
                        </tr>
                        {group.meals.map((meal) => {
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
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
