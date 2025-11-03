'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader, X } from 'lucide-react';

export default function QRScanner({ onScan, onClose, enabled = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [scannedCode, setScannedCode] = useState(null);

  // Get available video devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          // Prefer back camera if available
          const backCamera = videoDevices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear')
          );
          setSelectedDeviceId(backCamera?.deviceId || videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error getting devices:', err);
        setError('Failed to access camera devices');
      }
    };

    getDevices();
  }, []);

  // Start video stream
  useEffect(() => {
    if (!enabled || !selectedDeviceId) return;

    const startStream = async () => {
      try {
        setScanning(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          startScanning();
        }
      } catch (err) {
        console.error('Camera error:', err);
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permission.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera device found.');
        } else {
          setError('Failed to access camera: ' + err.message);
        }
        setScanning(false);
      }
    };

    startStream();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [enabled, selectedDeviceId]);

  const startScanning = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    const scan = async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple QR code detection - look for dark patterns
        // For production, use a library like jsQR
        try {
          // Decode the image - requires jsQR library
          const code = await decodeQRCode(imageData);
          if (code && code !== scannedCode) {
            setScannedCode(code);
            await onScan(code);
          }
        } catch (err) {
          // Continue scanning
        }
      }
      requestAnimationFrame(scan);
    };

    requestAnimationFrame(scan);
  };

  const decodeQRCode = async (imageData) => {
    // This requires the jsQR library to be installed
    // For now, return null as a placeholder
    // The actual implementation would use jsQR.default() from 'jsqr'
    return null;
  };

  const handleManualInput = (text) => {
    try {
      const data = JSON.parse(text);
      if (data.userId && data.type === 'attendance') {
        onScan(text);
      } else {
        setError('Invalid QR code data format');
      }
    } catch {
      setError('Invalid QR code format');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Camera Selection */}
          {devices.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Camera Device
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {devices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${devices.indexOf(device) + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Video Stream */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-square">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-green-500 rounded-lg" 
                     style={{
                       backgroundImage: 'linear-gradient(45deg, transparent 30%, rgba(34, 197, 94, 0.1) 50%, transparent 70%)',
                       backgroundSize: '100% 100%',
                       animation: 'scan 2s infinite'
                     }}>
                </div>
                <style>{`
                  @keyframes scan {
                    0%, 100% { transform: translateY(-100%); }
                    50% { transform: translateY(0); }
                  }
                `}</style>
              </div>
            )}

            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Loader size={32} className="text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Manual Input Option */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Or paste QR code data manually:
            </label>
            <textarea
              placeholder='{"userId":"...","type":"attendance"...}'
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleManualInput(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              rows="2"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Close
          </button>
          <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
            {devices.length === 0 && 'No camera found'}
          </div>
        </div>
      </div>
    </div>
  );
}
