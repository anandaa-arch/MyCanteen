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
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full h-full md:h-auto md:max-w-md md:rounded-lg shadow-lg p-6 sm:p-8 z-10 overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-semibold mb-6">
          {userStats.todaysPollResponse ? 'Update Today&apos;s Response' : 'Submit Today&apos;s Response'}
        </h3>
        
        <div className="space-y-6">
          {/* Attendance Selection */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-3">
              Will you attend today?
            </label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition touch-manipulation hover:bg-gray-50 active:bg-gray-100 flex-1"
                     style={{
                       borderColor: attendance === 'yes' ? '#3b82f6' : '#d1d5db',
                       backgroundColor: attendance === 'yes' ? '#eff6ff' : 'white'
                     }}>
                <input
                  type="radio"
                  name="attendance"
                  value="yes"
                  checked={attendance === 'yes'}
                  onChange={(e) => setAttendance(e.target.value)}
                  disabled={pollLoading}
                  className="w-5 h-5"
                />
                <span className="text-base font-medium">Yes, I&apos;ll attend</span>
              </label>
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition touch-manipulation hover:bg-gray-50 active:bg-gray-100 flex-1"
                     style={{
                       borderColor: attendance === 'no' ? '#ef4444' : '#d1d5db',
                       backgroundColor: attendance === 'no' ? '#fef2f2' : 'white'
                     }}>
                <input
                  type="radio"
                  name="attendance"
                  value="no"
                  checked={attendance === 'no'}
                  onChange={(e) => setAttendance(e.target.value)}
                  disabled={pollLoading}
                  className="w-5 h-5"
                />
                <span className="text-base font-medium">No</span>
              </label>
            </div>
          </div>

          {/* Meal Size Selection - only show if attending */}
          {attendance === 'yes' && (
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Meal Size
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition touch-manipulation hover:bg-gray-50 active:bg-gray-100 flex-1"
                       style={{
                         borderColor: mealType === 'full' ? '#10b981' : '#d1d5db',
                         backgroundColor: mealType === 'full' ? '#f0fdf4' : 'white'
                       }}>
                  <input
                    type="radio"
                    name="mealType"
                    value="full"
                    checked={mealType === 'full'}
                    onChange={(e) => setMealType(e.target.value)}
                    disabled={pollLoading}
                    className="w-5 h-5"
                  />
                  <span className="text-base font-medium">Full (₹60)</span>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition touch-manipulation hover:bg-gray-50 active:bg-gray-100 flex-1"
                       style={{
                         borderColor: mealType === 'half' ? '#10b981' : '#d1d5db',
                         backgroundColor: mealType === 'half' ? '#f0fdf4' : 'white'
                       }}>
                  <input
                    type="radio"
                    name="mealType"
                    value="half"
                    checked={mealType === 'half'}
                    onChange={(e) => setMealType(e.target.value)}
                    disabled={pollLoading}
                    className="w-5 h-5"
                  />
                  <span className="text-base font-medium">Half (₹45)</span>
                </label>
              </div>
            </div>
          )}

          {/* Warning for confirmed responses */}
          {userStats.confirmationStatus === 'confirmed' && (
            <div className="bg-orange-100 border border-orange-400 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-800">
                ⚠️ Your previous response has already been confirmed by the admin. 
                Updating will require new admin confirmation.
              </p>
            </div>
          )}

          {/* Poll Message */}
          {pollMessage && (
            <div className={`text-sm sm:text-base text-center p-3 sm:p-4 rounded-lg font-medium ${
              pollMessage.includes('Error') 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {pollMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 md:mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={pollLoading}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 font-medium transition touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={onSubmitPoll}
              disabled={pollLoading}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 font-medium transition shadow-md hover:shadow-lg touch-manipulation"
            >
              {pollLoading ? 'Submitting...' : (userStats.todaysPollResponse ? 'Update Response' : 'Submit Response')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}