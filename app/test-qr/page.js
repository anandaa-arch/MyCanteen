"use client";

import { QRCode } from "react-qrcode-logo";

export default function TestQRPage() {
  // Test QR data - replace with actual user ID from your database
  const testQRData = JSON.stringify({
    userId: "test-user-123",
    name: "Test Student",
    email: "test@example.com",
    dept: "Computer Science",
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0],
    type: "attendance"
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Test QR Code</h1>
        <p className="text-gray-600 mb-2">Display this on your computer screen</p>
        <p className="text-gray-600">Then scan it with your phone at:</p>
        <p className="text-blue-600 font-bold mt-2">/admin/qr-scanner</p>
      </div>

      {/* Large QR Code for scanning from screen */}
      <div className="bg-white p-12 rounded-2xl shadow-2xl">
        <QRCode
          value={testQRData}
          size={400}
          bgColor="#ffffff"
          fgColor="#000000"
          qrStyle="squares"
          eyeRadius={5}
          quietZone={30}
          ecLevel="H"
        />
      </div>

      <div className="mt-8 max-w-2xl bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <h2 className="font-bold text-yellow-800 mb-3">📱 Testing Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-900">
          <li>Open this page on your <strong>computer</strong></li>
          <li>Make the QR code fullscreen (F11 on most browsers)</li>
          <li>On your <strong>phone</strong>, go to: <code className="bg-yellow-100 px-2 py-1 rounded">mycanteen1.vercel.app/admin/qr-scanner</code></li>
          <li>Click &quot;Open QR Scanner&quot;</li>
          <li>Point your phone camera at this computer screen</li>
          <li>Watch for the debug panel to show detection status</li>
        </ol>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg max-w-2xl">
        <p className="text-xs font-mono text-gray-700 break-all">
          <strong>QR Data:</strong><br/>
          {testQRData}
        </p>
      </div>
    </div>
  );
}
