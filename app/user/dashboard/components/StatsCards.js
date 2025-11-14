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

const mealSlots = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' }
]

export default function StatsCards({ userStats }) {
  // Get current month and year for display
  const now = new Date()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  const currentMonthYear = `${monthNames[now.getMonth()]} ${now.getFullYear()}`

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Total Bill Card */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Total Bill</h3>
        <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
          ₹{userStats.totalBill}
        </p>
      </div>

      {/* This Month Card */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{currentMonthYear}</h3>
        <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
          {userStats.thisMonthMeals} <span className="text-base sm:text-xl">meals</span>
        </p>
      </div>

      {/* All Time Meals Card */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">All Time</h3>
        <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">
          {userStats.allTimeMeals || 0} <span className="text-base sm:text-xl">meals</span>
        </p>
      </div>

      {/* Today's Status Card */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Today&apos;s Status</h3>
        <div className="mt-3 space-y-3">
          {userStats.todaysPollResponses?.length ? (
            mealSlots.map(({ key, label }) => {
              const response = userStats.todaysPollResponses?.find((resp) => resp.meal_slot === key)
              return (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-sm text-gray-600">
                      {response ? (
                        response.present
                          ? `Attending • ${response.portion_size} portion`
                          : 'Not attending'
                      ) : 'No response yet'}
                    </p>
                  </div>
                  {response && getConfirmationBadge(response.confirmation_status)}
                </div>
              )
            })
          ) : (
            <p className="text-base sm:text-lg font-bold text-yellow-600">No response yet</p>
          )}
        </div>
      </div>
    </div>
  )
}