'use client'

import Link from 'next/link'
import { Receipt, UtensilsCrossed, History, Clock, QrCode } from 'lucide-react'

export default function ActionCards({ userStats, onSubmitResponse }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {/* Generate QR Code Card - NEW */}
      <Link 
        href="/user/qr"
        className="bg-purple-50 p-6 rounded-lg text-center shadow hover:shadow-md transition cursor-pointer"
      >
        <div className="flex justify-center mb-2">
          <QrCode className="w-8 h-8 text-purple-600" />
        </div>
        <h4 className="text-lg font-bold text-purple-700">My QR Code</h4>
        <p className="text-sm text-purple-600 mt-2">Generate your attendance QR</p>
      </Link>

      {/* My Bills Card */}
      <Link 
        href="/user/billing"
        className="bg-indigo-50 p-6 rounded-lg text-center shadow hover:shadow-md transition cursor-pointer"
      >
        <div className="flex justify-center mb-2">
          <Receipt className="w-8 h-8 text-indigo-600" />
        </div>
        <h4 className="text-lg font-bold text-indigo-700">My Bills</h4>
        <p className="text-sm text-indigo-600 mt-2">View your billing history</p>
      </Link>

      {/* Today's Menu Card */}
      <Link 
        href="/menu"
        className="bg-blue-50 p-6 rounded-lg text-center shadow hover:shadow-md transition cursor-pointer"
      >
        <div className="flex justify-center mb-2">
          <UtensilsCrossed className="w-8 h-8 text-blue-600" />
        </div>
        <h4 className="text-lg font-bold text-blue-700">Today&apos;s Menu</h4>
        <p className="text-sm text-blue-600 mt-2">View current and upcoming meals</p>
      </Link>

      {/* Meal History Card */}
      <Link 
        href="/user/meal-history"
        className="bg-green-50 p-6 rounded-lg text-center shadow hover:shadow-md transition cursor-pointer"
      >
        <div className="flex justify-center mb-2">
          <History className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="text-lg font-bold text-green-700">Meal History</h4>
        <p className="text-sm text-green-600 mt-2">Check your dining records</p>
      </Link>

      {/* Attendance Card */}
      <Link 
        href="/attendance"
        className="bg-cyan-50 p-6 rounded-lg text-center shadow hover:shadow-md transition cursor-pointer"
      >
        <div className="flex justify-center mb-2">
          <Clock className="w-8 h-8 text-cyan-600" />
        </div>
        <h4 className="text-lg font-bold text-cyan-700">Attendance</h4>
        <p className="text-sm text-cyan-600 mt-2">View your attendance records</p>
      </Link>
    </div>
  )
}