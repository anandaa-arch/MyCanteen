// components/inventory/ExpenseForm.js - Clean Professional Design
'use client'
import { useState } from 'react';
import { Plus, DollarSign, Calendar, User, FileText, Tag } from 'lucide-react';

export default function ExpenseForm({ onAdded }) {
  const [formData, setFormData] = useState({
    category: 'pantry',
    description: '',
    amount: '',
    vendor: '',
    incurred_on: new Date().toISOString().slice(0, 10)
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setFormData({
          category: 'pantry',
          description: '',
          amount: '',
          vendor: '',
          incurred_on: new Date().toISOString().slice(0, 10)
        });
        // Call the callback to refresh parent component
        if (onAdded) {
          onAdded(data);
        }
        alert('✅ Expense added successfully!');
      } else {
        alert(data.error || 'Failed to add expense');
      }
    } catch (error) {
      alert('Error adding expense');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCategoryIcon = () => {
    switch(formData.category) {
      case 'pantry': return <Tag size={16} className="text-emerald-600" />;
      case 'utility': return <Tag size={16} className="text-blue-600" />;
      case 'maintenance': return <Tag size={16} className="text-orange-600" />;
      case 'salary': return <Tag size={16} className="text-purple-600" />;
      case 'rent': return <Tag size={16} className="text-red-600" />;
      default: return <Tag size={16} className="text-gray-600" />;
    }
  };

  const getCategoryColor = () => {
    switch(formData.category) {
      case 'pantry': return 'from-emerald-600 to-emerald-700';
      case 'utility': return 'from-blue-600 to-blue-700';
      case 'maintenance': return 'from-orange-600 to-orange-700';
      case 'salary': return 'from-purple-600 to-purple-700';
      case 'rent': return 'from-red-600 to-red-700';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl mb-8 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor()} rounded-lg flex items-center justify-center shadow-sm`}>
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
              Add New Expense
            </h3>
            <p className="text-sm text-gray-500 leading-tight">
              Track and manage your operational expenses
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                {getCategoryIcon()}
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 bg-white text-gray-900"
              >
                <option value="pantry">Pantry</option>
                <option value="utility">Utility</option>
                <option value="maintenance">Maintenance</option>
                <option value="salary">Salary</option>
                <option value="rent">Rent</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Vendor */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="text-emerald-600" />
                Vendor/Supplier
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-150 placeholder-gray-400"
                placeholder="Enter vendor name"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="text-blue-600" />
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 placeholder-gray-400"
                placeholder="0.00"
              />
            </div>

            {/* Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="text-purple-600" />
                Date
              </label>
              <input
                type="date"
                name="incurred_on"
                value={formData.incurred_on}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-150"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="text-gray-600" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-150 placeholder-gray-400 resize-none"
              placeholder="Enter expense description or additional notes..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg transition-all duration-150 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding Expense...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}