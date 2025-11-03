export default function PollModal({ 
  isOpen, 
  onClose, 
  userStats, 
  attendance, 
  setAttendance, 
  mealType, 
  setMealType, 
  pollLoading, 
  pollMessage, 
  onSubmitPoll 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg p-6 z-10">
        <h3 className="text-lg font-semibold mb-4">
          {userStats.todaysPollResponse ? 'Update Today\'s Response' : 'Submit Today\'s Response'}
        </h3>
        
        <div className="space-y-4">
          {/* Attendance Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Will you attend today?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="attendance"
                  value="yes"
                  checked={attendance === 'yes'}
                  onChange={(e) => setAttendance(e.target.value)}
                  disabled={pollLoading}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="attendance"
                  value="no"
                  checked={attendance === 'no'}
                  onChange={(e) => setAttendance(e.target.value)}
                  disabled={pollLoading}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Meal Size Selection - only show if attending */}
          {attendance === 'yes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Size
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mealType"
                    value="full"
                    checked={mealType === 'full'}
                    onChange={(e) => setMealType(e.target.value)}
                    disabled={pollLoading}
                  />
                  <span>Full (₹60)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mealType"
                    value="half"
                    checked={mealType === 'half'}
                    onChange={(e) => setMealType(e.target.value)}
                    disabled={pollLoading}
                  />
                  <span>Half (₹45)</span>
                </label>
              </div>
            </div>
          )}

          {/* Warning for confirmed responses */}
          {userStats.confirmationStatus === 'confirmed' && (
            <div className="bg-orange-100 border border-orange-400 rounded-md p-3">
              <p className="text-sm font-medium text-orange-800">
                ⚠️ Your previous response has already been confirmed by the admin. 
                Updating will require new admin confirmation.
              </p>
            </div>
          )}

          {/* Poll Message */}
          {pollMessage && (
            <div className={`text-sm text-center p-2 rounded ${
              pollMessage.includes('Error') 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {pollMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={pollLoading}
              className="px-4 py-2 rounded border hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmitPoll}
              disabled={pollLoading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {pollLoading ? 'Submitting...' : (userStats.todaysPollResponse ? 'Update Response' : 'Submit Response')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}