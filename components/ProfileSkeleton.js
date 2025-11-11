// Profile Page Skeleton
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse" />
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="animate-pulse space-y-6">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full" />
            </div>

            {/* Form Fields */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            ))}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <div className="h-12 bg-gray-200 rounded flex-1" />
              <div className="h-12 bg-gray-200 rounded flex-1" />
            </div>
          </div>
        </div>

        {/* Invoice Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-12 bg-gray-200 rounded w-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
