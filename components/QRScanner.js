'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, X, Smartphone } from 'lucide-react';
import jsQR from 'jsqr';

export default function QRScanner({ onScan, onClose, enabled = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanningRef = useRef(false);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [scannedCode, setScannedCode] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [debugInfo, setDebugInfo] = useState('');

  // Request camera permissions first
  const requestCameraPermission = async () => {
    try {
      // Request permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      return true;
    } catch (err) {
      console.error('Permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('📷 Camera access denied. Please enable camera permissions in your browser settings.');
        setPermissionStatus('denied');
      } else if (err.name === 'NotFoundError') {
        setError('📱 No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setError('📷 Camera is already in use by another application.');
      } else {
        setError(`❌ Camera error: ${err.message}`);
      }
      return false;
    }
  };

  // Get available video devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permission first
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        // Now enumerate devices
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
        
        console.log('📹 Available cameras:', videoDevices.length, videoDevices);
        
        setDevices(videoDevices);
        
        if (videoDevices.length > 0) {
          // Prefer back camera on mobile
          const backCamera = videoDevices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          
          const selectedDevice = backCamera || videoDevices[videoDevices.length - 1];
          console.log('📷 Selected camera:', selectedDevice.label);
          setSelectedDeviceId(selectedDevice.deviceId);
        } else {
          setError('No camera devices found on this device.');
        }
      } catch (err) {
        console.error('Error getting devices:', err);
        setError('Failed to access camera devices: ' + err.message);
      }
    };

    getDevices();
  }, []);

  // Start video stream
  useEffect(() => {
    if (!enabled || !selectedDeviceId || permissionStatus !== 'granted') return;

    let stream = null;

    const startStream = async () => {
      try {
        setError('');
        console.log('🎥 Starting camera stream with device:', selectedDeviceId);
        
        // Mobile-optimized constraints
        const constraints = {
          video: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            aspectRatio: { ideal: 16/9 }
          },
          audio: false
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            console.log('✅ Video ready:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            setIsReady(true);
            videoRef.current.play().then(() => {
              startScanning();
            }).catch(err => {
              console.error('Play error:', err);
              setError('Failed to start video playback: ' + err.message);
            });
          };
        }
      } catch (err) {
        console.error('Camera error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('📷 Camera access denied. Please enable camera permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('📱 No camera device found.');
        } else if (err.name === 'NotReadableError') {
          setError('📷 Camera is already in use by another app. Please close other apps using the camera.');
        } else if (err.name === 'OverconstrainedError') {
          setError('📷 Camera settings not supported. Trying fallback...');
          // Try with simpler constraints
          fallbackStream();
        } else {
          setError('Failed to access camera: ' + err.message);
        }
        setIsReady(false);
      }
    };

    const fallbackStream = async () => {
      try {
        const simpleConstraints = {
          video: { facingMode: 'environment' },
          audio: false
        };
        
        stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsReady(true);
            videoRef.current.play().then(() => startScanning());
          };
        }
      } catch (err) {
        setError('Camera fallback also failed: ' + err.message);
      }
    };

    startStream();

    return () => {
      scanningRef.current = false;
      const currentVideo = videoRef.current;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Camera stream stopped');
        });
      }
      if (currentVideo?.srcObject) {
        currentVideo.srcObject.getTracks().forEach(track => track.stop());
        currentVideo.srcObject = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, selectedDeviceId, permissionStatus]);

  const startScanning = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) {
      console.error('Canvas or video ref missing');
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    scanningRef.current = true;
    
    console.log('🔍 Starting QR code scanning...');
    
    let frameCount = 0;
    
    const scan = () => {
      if (!scanningRef.current) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Try multiple inversion attempts for better detection
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth', // Try both normal and inverted colors
        });
        
        if (code && code.data) {
          // Only process if it's different from last scanned code
          if (code.data !== scannedCode) {
            console.log('✅ QR Code detected:', code.data);
            setDebugInfo(`Found: ${code.data.substring(0, 50)}... Processing...`);
            
            // Validate the QR code format
            try {
              const qrData = JSON.parse(code.data);
              console.log('📋 Parsed QR data:', qrData);
              
              if (qrData.userId && qrData.type === 'attendance') {
                console.log('✅ Valid attendance QR code! Submitting...');
                setDebugInfo(`✅ Valid QR! Submitting attendance...`);
                setScannedCode(code.data);
                scanningRef.current = false;
                
                // Vibrate on success (mobile only)
                if (navigator.vibrate) {
                  navigator.vibrate(200);
                }
                
                // Flash success indicator
                const successFlash = document.createElement('div');
                successFlash.style.cssText = 'position:fixed;inset:0;background:rgba(34,197,94,0.3);pointer-events:none;z-index:9999;';
                document.body.appendChild(successFlash);
                setTimeout(() => successFlash.remove(), 200);
                
                // Call onScan with the data
                onScan(code.data);
                return;
              } else {
                // Invalid format, continue scanning
                frameCount++;
                const missing = [];
                if (!qrData.userId) missing.push('userId');
                if (!qrData.type) missing.push('type');
                else if (qrData.type !== 'attendance') missing.push(`type="${qrData.type}" (need "attendance")`);
                
                setDebugInfo(`❌ Invalid: Missing ${missing.join(', ')}`);
                
                console.log('⚠️ QR code found but invalid format. Missing:', missing, 'Data:', qrData);
              }
            } catch (e) {
              // Not a valid JSON, might be a different QR code
              frameCount++;
              setDebugInfo(`❌ Not JSON: ${code.data.substring(0, 30)}...`);
              
              console.log('⚠️ QR code found but not JSON:', code.data.substring(0, 100), 'Error:', e.message);
              
              // Try to use it anyway if it looks like it might be valid
              if (code.data.includes('userId') && code.data.includes('attendance')) {
                console.log('🔧 Attempting to use malformed JSON...');
                setDebugInfo(`⚡ Trying malformed data...`);
                onScan(code.data);
                setScannedCode(code.data);
                scanningRef.current = false;
                return;
              }
            }
          }
        } else {
          // No code detected, continue scanning
          frameCount++;
          if (frameCount % 120 === 0) {
            setDebugInfo(`Scanning... (${Math.floor(frameCount/30)}s)`);
            console.log('🔍 Scanning... (frame ' + frameCount + ')');
          }
        }
      }
      
      requestAnimationFrame(scan);
    };

    requestAnimationFrame(scan);
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
      setError('Invalid QR code format. Must be valid JSON.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-white md:rounded-lg shadow-2xl w-full h-full md:max-w-lg md:h-auto md:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b sticky top-0 bg-white z-10 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Camera size={20} className="text-blue-600 sm:w-6 sm:h-6" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Scan QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 active:text-gray-900 transition p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full touch-manipulation"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-2 sm:gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-red-700 font-medium break-words">{error}</p>
                  {permissionStatus === 'denied' && (
                    <p className="text-xs text-red-600 mt-2">
                      To enable camera: Settings → Privacy → Camera → Enable for your browser
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Camera Selection (if multiple cameras) */}
          {devices.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Smartphone size={16} className="inline mr-1" />
                Select Camera
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 touch-manipulation"
              >
                {devices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Video Stream - Full viewport on mobile */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9', minHeight: '250px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning overlay */}
            {isReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-64 border-4 border-green-500 rounded-lg shadow-lg">
                  <div className="absolute inset-0 border-2 border-green-400 opacity-50 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {!isReady && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-75">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-white text-sm">Initializing camera...</p>
              </div>
            )}
          </div>

          <div className="text-center text-xs sm:text-sm text-gray-600 mb-4 font-medium">
            {isReady ? '📷 Point camera at QR code' : '⏳ Waiting for camera...'}
          </div>

          {/* Debug Info */}
          {debugInfo && isReady && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-mono text-yellow-800 break-all">{debugInfo}</p>
            </div>
          )}

          {/* Manual Input Option - Hidden on small screens for better UX */}
          <div className="border-t pt-4 hidden sm:block">
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
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono bg-gray-50 text-gray-900 touch-manipulation"
              rows="3"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-t flex justify-between items-center flex-shrink-0">
          <div className="text-xs sm:text-sm text-gray-500">
            {devices.length} camera{devices.length !== 1 ? 's' : ''} found
          </div>
          <button
            onClick={onClose}
            className="px-5 sm:px-6 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition font-semibold text-sm sm:text-base touch-manipulation"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
