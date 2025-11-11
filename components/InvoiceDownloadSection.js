'use client';

import { useState } from 'react';
import { downloadInvoice } from '@/utils/invoiceService';

export default function InvoiceDownloadSection({ userId, userName }) {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleDownload = async () => {
    if (!selectedMonth || !selectedYear) {
      setError('Please select both month and year');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const endDate = `${selectedYear}-${selectedMonth}-${new Date(selectedYear, selectedMonth, 0).getDate()}`;

      await downloadInvoice({
        userId,
        userName,
        startDate,
        endDate,
        month: months.find(m => m.value === selectedMonth)?.label,
        year: selectedYear
      });
    } catch (err) {
      setError('Failed to download invoice. Please try again.');
      console.error('Invoice download error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-lg bg-white">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">📄 Download Invoice</h3>
      
      <div className="space-y-4">
        {/* Year Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Month Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a month...</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            '⬇️ Download Invoice'
          )}
        </button>
      </div>
    </div>
  );
}