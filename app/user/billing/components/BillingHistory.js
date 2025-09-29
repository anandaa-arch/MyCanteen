// app/user/billing/components/BillingHistory.js
'use client';

import { useState } from 'react';
import { 
  Receipt, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const BillingHistory = ({ bills, getStatusBadge, months }) => {
  const [expandedBill, setExpandedBill] = useState(null);

  const toggleExpand = (billId) => {
    setExpandedBill(expandedBill === billId ? null : billId);
  };

  const EmptyState = () => (
    <div className="p-12 text-center">
      <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
      <p className="text-gray-600">Your billing history will appear here once bills are generated.</p>
    </div>
  );

  if (bills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
          <p className="text-sm text-gray-500 mt-1">Your monthly bills and payment history</p>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
        <p className="text-sm text-gray-500 mt-1">Your monthly bills and payment history</p>
      </div>

      <div className="divide-y divide-gray-200">
        {bills.map((bill) => (
          <div key={bill.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(bill.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {months[bill.month - 1]} {bill.year}
                    </span>
                  </div>
                  {getStatusBadge(bill.status)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Meals:</span>
                    <div className="font-medium">
                      {(bill.half_meal_count || 0) + (bill.full_meal_count || 0)} total
                    </div>
                    <div className="text-xs text-gray-500">
                      {bill.half_meal_count || 0} half • {bill.full_meal_count || 0} full
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Total Amount:</span>
                    <div className="font-semibold text-gray-900">₹{(bill.total_amount || 0).toFixed(2)}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Paid:</span>
                    <div className="font-semibold text-green-600">₹{(bill.paid_amount || 0).toFixed(2)}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Due:</span>
                    <div className={`font-semibold ${
                      bill.due_amount > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ₹{(bill.due_amount || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ml-4 flex items-center gap-2">
                <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  {expandedBill === bill.id ? 'Hide Details' : 'View Details'}
                </span>
                {expandedBill === bill.id ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedBill === bill.id && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meal Breakdown */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Meal Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Half Meals ({bill.half_meal_count || 0} × ₹45)</span>
                        <span className="font-medium">₹{(bill.half_meal_cost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Full Meals ({bill.full_meal_count || 0} × ₹60)</span>
                        <span className="font-medium">₹{(bill.full_meal_cost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                        <span>Total Amount</span>
                        <span>₹{(bill.total_amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment History */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Payment History</h4>
                    {bill.payment_records && bill.payment_records.length > 0 ? (
                      <div className="space-y-2">
                        {bill.payment_records.map((payment, index) => (
                          <div key={index} className="text-sm border border-gray-200 rounded p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">₹{payment.amount}</div>
                                <div className="text-gray-500 text-xs">
                                  {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
                                </div>
                                {payment.notes && (
                                  <div className="text-gray-600 text-xs mt-1">{payment.notes}</div>
                                )}
                              </div>
                              <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No payments recorded yet</div>
                    )}
                  </div>
                </div>

                {bill.due_amount > 0 && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-semibold text-red-800">Outstanding Amount</div>
                        <div className="text-sm text-red-700">
                          Please pay ₹{bill.due_amount.toFixed(2)} to clear your dues for {months[bill.month - 1]} {bill.year}.
                          Contact the admin to make your payment.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingHistory;