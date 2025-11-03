const getConfirmationBadge = (status) => {
  if (!status) return null
  
  const badges = {
    'pending_customer_response': { color: 'bg-gray-100 text-gray-800', text: '✏️ Pending Response' },
    'awaiting_admin_confirmation': { color: 'bg-yellow-100 text-yellow-800', text: '⏳ Awaiting Confirmation' },
    'confirmed_attended': { color: 'bg-green-100 text-green-800', text: '✅ Confirmed' },
    'no_show': { color: 'bg-red-100 text-red-800', text: '❌ No Show' },
    'rejected': { color: 'bg-orange-100 text-orange-800', text: '🚫 Rejected' },
    'cancelled': { color: 'bg-gray-100 text-gray-800', text: '📵 Cancelled' },
    // Legacy status values for backward compatibility
    'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Confirmation' },
    'confirmed': { color: 'bg-green-100 text-green-800', text: 'Confirmed' }
  }
  
  const badge = badges[status]
  
  // Return null if status not found instead of crashing
  if (!badge) return null
  
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
      {badge.text}
    </span>
  )
}

export default function StatsCards({ userStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Bill Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Total Bill</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">
          ₹{userStats.totalBill}
        </p>
      </div>

      {/* This Month Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">
          {userStats.thisMonthMeals} meals
        </p>
      </div>

      {/* Today's Status Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Status</h3>
        <div className="mt-2">
          {userStats.todaysPollResponse ? (
            <div>
              <p className="text-lg font-bold text-blue-600">
                {userStats.todaysPollResponse.present ? 'Attending' : 'Not Attending'}
              </p>
              {getConfirmationBadge(userStats.confirmationStatus)}
            </div>
          ) : (
            <p className="text-lg font-bold text-yellow-600">No response yet</p>
          )}
        </div>
      </div>
    </div>
  )
}