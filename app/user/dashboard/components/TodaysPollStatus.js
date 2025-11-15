import { Clock, Check, X, AlertCircle } from 'lucide-react';

const getStatusBadge = (status) => {
  if (!status) return null;

  const statusConfig = {
    pending_customer_response: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: '✏️ Pending Your Response' },
    awaiting_admin_confirmation: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: '⏳ Awaiting Admin Confirmation' },
    confirmed_attended: { color: 'bg-green-100 text-green-800', icon: Check, label: '✅ Confirmed' },
    no_show: { color: 'bg-red-100 text-red-800', icon: X, label: '❌ No Show' },
    rejected: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: '🚫 Rejected' },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: X, label: '📵 Cancelled' }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Not Submitted' };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

const mealSlots = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅', booking: 'Book: 5-9 AM', serving: 'Serving: 7:30-9 AM' },
  { key: 'lunch', label: 'Lunch', icon: '☀️', booking: 'Book: 9 AM-2 PM', serving: 'Serving: 12-2 PM' },
  { key: 'dinner', label: 'Dinner', icon: '🌙', booking: 'Book: 2-10 PM', serving: 'Serving: 7:30-10 PM' }
];

const describeAttendanceChoice = (response) => {
  if (!response) {
    return { label: 'No response yet', showPortion: false };
  }

  if (response.confirmation_status === 'cancelled' || response.present === false) {
    return { label: 'Not attending', showPortion: false };
  }

  if (response.confirmation_status === 'no_show') {
    return { label: 'Marked as No Show', showPortion: false };
  }

  return {
    label: 'Attending',
    showPortion: true
  };
};

export default function TodaysPollStatus({ userStats, onUpdateResponse }) {
  const responsesBySlot = (userStats.todaysPollResponses || []).reduce((acc, resp) => {
    acc[resp.meal_slot] = resp;
    return acc;
  }, {});

  return (
    <div className="mb-8 bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Meal Slots</h3>
        <p className="text-sm text-gray-600">Track your responses for breakfast, lunch, and dinner.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mealSlots.map((slot) => {
          const response = responsesBySlot[slot.key];
          const status = response ? (response.confirmation_status || 'pending_customer_response') : null;
          const attendanceCopy = describeAttendanceChoice(response);

          return (
            <div key={slot.key} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>{slot.icon}</span>
                  <div>
                    <p className="text-base font-semibold text-gray-900">{slot.label}</p>
                    <p className="text-xs text-gray-500">{slot.booking}</p>
                    <p className="text-xs text-gray-500">{slot.serving}</p>
                  </div>
                </div>
                {getStatusBadge(status)}
              </div>

              <div className="text-sm text-gray-700 min-h-[48px]">
                {response ? (
                  <>
                    <p>{attendanceCopy.label}</p>
                    {attendanceCopy.showPortion && (
                      <p className="text-xs text-gray-600">Portion: {response.portion_size}</p>
                    )}
                  </>
                ) : (
                  <p>No response yet</p>
                )}
              </div>

              <button
                onClick={() => onUpdateResponse(slot.key)}
                className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                {response ? 'Update Response' : 'Submit Response'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}