'use client'

import Link from 'next/link'
import { Receipt, UtensilsCrossed, History, Clock, QrCode } from 'lucide-react'

export default function ActionCards({ userStats, onSubmitResponse }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
      {/* Generate QR Code Card - NEW */}
      <Link 
        href="/user/qr"
        className="bg-purple-50 p-4 sm:p-6 rounded-lg text-center shadow hover:shadow-md active:shadow-lg transition cursor-pointer touch-manipulation"
      >
        <div className="flex justify-center mb-2">
          <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
        </div>
        <h4 className="text-sm sm:text-base lg:text-lg font-bold text-purple-700">My QR Code</h4>
        <p className="text-xs sm:text-sm text-purple-600 mt-1 sm:mt-2 hidden sm:block">Generate your attendance QR</p>
      </Link>

      {/* My Bills Card */}
      <Link 
        href="/user/billing"
        className="bg-indigo-50 p-4 sm:p-6 rounded-lg text-center shadow hover:shadow-md active:shadow-lg transition cursor-pointer touch-manipulation"
      >
        <div className="flex justify-center mb-2">
          <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
        </div>
        <h4 className="text-sm sm:text-base lg:text-lg font-bold text-indigo-700">My Bills</h4>
        <p className="text-xs sm:text-sm text-indigo-600 mt-1 sm:mt-2 hidden sm:block">View your billing history</p>
      </Link>

      {/* Today's Menu Card */}
      <Link 
        href="/menu"
        className="bg-blue-50 p-4 sm:p-6 rounded-lg text-center shadow hover:shadow-md active:shadow-lg transition cursor-pointer touch-manipulation"
      >
        <div className="flex justify-center mb-2">
          <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
        </div>
        <h4 className="text-sm sm:text-base lg:text-lg font-bold text-blue-700">Today&apos;s Menu</h4>
        <p className="text-xs sm:text-sm text-blue-600 mt-1 sm:mt-2 hidden sm:block">View current and upcoming meals</p>
      </Link>

      {/* Meal History Card */}
      <Link 
        href="/user/meal-history"
        className="bg-green-50 p-4 sm:p-6 rounded-lg text-center shadow hover:shadow-md active:shadow-lg transition cursor-pointer touch-manipulation"
      >
        <div className="flex justify-center mb-2">
          <History className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
        </div>
        <h4 className="text-sm sm:text-base lg:text-lg font-bold text-green-700">Meal History</h4>
        <p className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2 hidden sm:block">Check your dining records</p>
      </Link>

      {/* Attendance Card */}
      <Link 
        href="/attendance"
        className="bg-cyan-50 p-4 sm:p-6 rounded-lg text-center shadow hover:shadow-md active:shadow-lg transition cursor-pointer touch-manipulation col-span-2 sm:col-span-1"
      >
        <div className="flex justify-center mb-2">
          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600" />
        </div>
        <h4 className="text-sm sm:text-base lg:text-lg font-bold text-cyan-700">Attendance</h4>
        <p className="text-xs sm:text-sm text-cyan-600 mt-1 sm:mt-2 hidden sm:block">View your attendance records</p>
      </Link>
    </div>
  )
}