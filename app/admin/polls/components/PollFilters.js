// components/polls/PollFilters.js
import { Calendar, Filter, Clock } from 'lucide-react';

export default function PollFilters({ 
  selectedDate, 
  onDateChange, 
  filterStatus, 
  onFilterChange,
  lastRefresh 
}) {
  const filterOptions = [
    { value: 'all', label: 'All Users', count: 'all' },
    { value: 'pending', label: 'Pending Confirmation', count: 'pending' },
    { value: 'confirmed', label: 'Confirmed', count: 'confirmed' },
    { value: 'no-response', label: 'No Response', count: 'no-response' },
    { value: 'attending', label: 'Attending', count: 'attending' }
  ];

  const getDateOptions = () => {
    const options = [];
    const today = new Date();
    
    // Add today and previous 7 days
    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().slice(0, 10);
      
      let label;
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Yesterday';
      else {
        label = date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      options.push({ value: dateString, label });
    }
    
    return options;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Date:</label>
            </div>
            <select
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {getDateOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Filter:</label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    filterStatus === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Last Refresh Time */}
        {lastRefresh && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={14} />
              <span>Last refreshed: {lastRefresh.toLocaleTimeString()}</span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-600 font-medium">Real-time updates active</span>
              </span>
            </div>
          </div>
        )}

        {/* Active Filter Display */}
        {filterStatus !== 'all' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filter:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filterOptions.find(f => f.value === filterStatus)?.label}
              </span>
              <button
                onClick={() => onFilterChange('all')}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear filter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}