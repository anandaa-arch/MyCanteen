'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, X } from 'lucide-react';

export default function FastQRScanner({ onScan, onClose, enabled = true }) {
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState('');
  const [debugMsg, setDebugMsg] = useState('Initializing...');
  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let html5QrCode = null;

    const startScanner = async () => {
      try {
        setDebugMsg('Loading scanner...');
        
        // Dynamically import html5-qrcode only on client side
        const { Html5Qrcode } = await import('html5-qrcode');
        
        setDebugMsg('Starting camera...');
        
        // Create scanner instance
        html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;
        // Configuration for fast scanning
        const config = {
          fps: 10, // Scan 10 frames per second
          qrbox: { width: 250, height: 250 }, // Scanning box size
          aspectRatio: 1.0,
        };

        // Success callback
        const onScanSuccess = (decodedText, decodedResult) => {
          // Prevent multiple scans of same code
          if (hasScannedRef.current || decodedText === lastScan) {
            return;
          }

          console.log('📱 QR Code detected:', decodedText);
          setDebugMsg(`Found QR! Processing...`);

          try {
            // Parse the QR data
            const qrData = JSON.parse(decodedText);
            
            if (qrData.userId && qrData.type === 'attendance') {
              setDebugMsg(`✅ Valid! Submitting attendance...`);
              hasScannedRef.current = true;
              setLastScan(decodedText);
              
              // Vibrate
              if (navigator.vibrate) {
                navigator.vibrate(200);
              }

              // Stop scanning
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                  setIsScanning(false);
                  onScan(decodedText);
                }).catch(err => {
                  console.error('Stop error:', err);
                  onScan(decodedText);
                });
              } else {
                onScan(decodedText);
              }
            } else {
              setDebugMsg(`❌ Invalid QR: Missing userId or type`);
              console.warn('Invalid QR format:', qrData);
            }
          } catch (e) {
            setDebugMsg(`❌ Not a valid attendance QR`);
            console.error('Parse error:', e);
          }
        };

        // Error callback (mostly ignored to avoid spam)
        const onScanError = (errorMessage) => {
          // Ignore common scanning errors
        };

        // Start scanning
        await html5QrCode.start(
          { facingMode: "environment" }, // Use back camera
          config,
          onScanSuccess,
          onScanError
        );

        setIsScanning(true);
        setDebugMsg('📷 Scanning... Point at QR code');
        console.log('✅ QR Scanner started');

      } catch (err) {
        console.error('Scanner start error:', err);
        setError(`Camera error: ${err.message || 'Failed to start camera'}`);
        setDebugMsg(`❌ Error: ${err.message}`);
      }
    };

    startScanner();

    // Cleanup
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => {
          console.log('Cleanup error (ignored):', err);
        });
      }
    };
  }, [enabled, onScan, lastScan]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        onClose();
      }).catch(() => {
        onClose();
      });
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera size={24} />
            <h2 className="text-xl font-bold">Scan QR Code</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
          {error ? (
            <div className="text-center p-6 bg-red-50 border-2 border-red-200 rounded-xl max-w-sm">
              <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
              <p className="text-red-800 font-semibold mb-2">Camera Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : (
            <div className="w-full">
              {/* QR Reader Container */}
              <div 
                id="qr-reader" 
                className="rounded-xl overflow-hidden border-4 border-green-500 shadow-xl"
                style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
              />

              {/* Debug Info */}
              <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
                <p className="text-sm font-mono text-yellow-900">{debugMsg}</p>
              </div>

              {/* Instructions */}
              <div className="mt-4 text-center text-sm text-gray-600">
                <p className="mb-2">📱 Hold phone steady</p>
                <p>🎯 Align QR code within the green box</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {isScanning ? '🟢 Scanning active' : '🔴 Camera stopped'}
          </div>
          <button
            onClick={handleClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
