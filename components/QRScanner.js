'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, Smartphone, X } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import {
  BarcodeFormat,
  DecodeHintType,
  NotFoundException,
  ChecksumException,
  FormatException,
} from '@zxing/library';

const ZXING_HINTS = new Map();
ZXING_HINTS.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
ZXING_HINTS.set(DecodeHintType.TRY_HARDER, true);

const DECODE_INTERVAL_MS = 350;
const ZXING_OPTIONS = {
  delayBetweenScanAttempts: 250,
  delayBetweenScanSuccess: 800,
};

const describeCameraError = (err) => {
  if (!err) return 'Unknown camera error';
  switch (err.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return '📷 Camera access denied. Please enable permissions in your browser settings.';
    case 'NotFoundError':
      return '📱 No camera found on this device.';
    case 'NotReadableError':
      return '📷 Camera is already in use by another application.';
    case 'OverconstrainedError':
      return '📷 Camera constraints not supported on this hardware.';
    default:
      return `Failed to access camera: ${err.message}`;
  }
};

const flashSuccessOverlay = () => {
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;background:rgba(34,197,94,0.35);pointer-events:none;z-index:9999;';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 180);
};

export default function QRScanner({ onScan, onClose, enabled = true, badgeLabel }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const processingRef = useRef(false);

  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [debugInfo, setDebugInfo] = useState('');

  const stopVideoStream = useCallback(() => {
    const video = videoRef.current;
    const stream = video?.srcObject;
    if (stream instanceof MediaStream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (video) {
      video.srcObject = null;
    }
  }, []);

  const finalizeScan = useCallback(
    (payload, controls) => {
      controls?.stop();
      if (controlsRef.current && controlsRef.current !== controls) {
        controlsRef.current.stop();
      }
      controlsRef.current = null;
      stopVideoStream();
      processingRef.current = true;
      setDebugInfo('✅ Valid QR! Submitting attendance...');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(180);
      }
      flashSuccessOverlay();
      onScan(payload);
    },
    [onScan, stopVideoStream]
  );

  const validateAndHandlePayload = useCallback(
    (rawText, controls) => {
      if (!rawText || processingRef.current) {
        return false;
      }

      const trimmed = rawText.trim();
      setDebugInfo(`Processing: ${trimmed.substring(0, 60)}${trimmed.length > 60 ? '...' : ''}`);

      try {
        const qrData = JSON.parse(trimmed);
        if (qrData.userId && qrData.type === 'attendance') {
          finalizeScan(trimmed, controls);
          return true;
        }

        const missing = [];
        if (!qrData.userId) missing.push('userId');
        if (!qrData.type || qrData.type !== 'attendance') missing.push('type="attendance"');
        setDebugInfo(`❌ Invalid QR data (missing ${missing.join(', ')})`);
        return false;
      } catch (err) {
        setDebugInfo(`❌ Not JSON: ${trimmed.substring(0, 50)}${trimmed.length > 50 ? '...' : ''}`);
        if (trimmed.includes('userId') && trimmed.includes('attendance')) {
          finalizeScan(trimmed, controls);
          return true;
        }
        return false;
      }
    },
    [finalizeScan]
  );

  const requestCameraPermission = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError('Camera API is not supported in this browser.');
      setPermissionStatus('denied');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionStatus('granted');
      return true;
    } catch (err) {
      setError(describeCameraError(err));
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader(ZXING_HINTS, ZXING_OPTIONS);
    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      stopVideoStream();
    };
  }, [stopVideoStream]);

  useEffect(() => {
    const loadDevices = async () => {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter((device) => device.kind === 'videoinput');
      setDevices(videoDevices);

      if (videoDevices.length === 0) {
        setError('No camera devices found on this device.');
        return;
      }

      if (!selectedDeviceId) {
        const backCamera = videoDevices.find((device) =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        const preferred = backCamera || videoDevices[videoDevices.length - 1];
        setSelectedDeviceId(preferred.deviceId);
      }
    };

    loadDevices();
  }, [requestCameraPermission, selectedDeviceId]);

  useEffect(() => {
    processingRef.current = false;
    if (!enabled) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      stopVideoStream();
    }
  }, [enabled, stopVideoStream]);

  useEffect(() => {
    if (!enabled || permissionStatus !== 'granted') {
      return () => undefined;
    }

    const reader = readerRef.current;
    const video = videoRef.current;
    if (!reader || !video) {
      return () => undefined;
    }

    let cancelled = false;
    let restartTimer = null;

    const waitForVideoReady = () => {
      if (!video) return Promise.resolve();
      if (video.readyState >= 2 && video.videoWidth > 0) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        const handler = () => {
          if (video.readyState >= 2 && video.videoWidth > 0) {
            video.removeEventListener('loadeddata', handler);
            resolve();
          }
        };
        video.addEventListener('loadeddata', handler, { once: true });
      });
    };

    async function startScanner() {
      try {
        setError('');
        setIsReady(false);
        setDebugInfo('Initializing camera...');

        controlsRef.current?.stop();
        stopVideoStream();

        const constraints = {
          audio: false,
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;  
        
        await video.play().catch((err) => {
          console.warn('Video play warning:', err);
        });

        await waitForVideoReady();
        setDebugInfo('Camera ready, starting scan...');

        const controls = await reader.decodeFromStream(
          stream,
          video,
          (result, err, ctrl) => {
            if (cancelled) return;

            if (result) {
              setIsReady(true);
              validateAndHandlePayload(result.getText(), ctrl);
              return;
            }

            if (!err) return;
            if (err instanceof NotFoundException || err instanceof ChecksumException || err instanceof FormatException) {
              return;
            }
            if (err.name === 'IndexSizeError') {
              setDebugInfo('Camera feed warming up...');
              return;
            }
            if (err.name === 'AbortError') {
              setDebugInfo('Camera interrupted, retrying...');
              ctrl?.stop();
              if (controlsRef.current && controlsRef.current !== ctrl) {
                controlsRef.current.stop();
              }
              controlsRef.current = null;
              stopVideoStream();
              scheduleRestart();
              return;
            }
            console.error('ZXing scan error:', err);
            setDebugInfo(`Scanner error: ${err.message}`);
          }
        );

        if (cancelled) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
        setIsReady(true);
        setDebugInfo('Scanning...');
      } catch (err) {
        if (cancelled) return;
        if (err === false || err?.name === 'AbortError') {
          setDebugInfo('Camera interrupted, retrying...');
          scheduleRestart();
          return;
        }
        console.error('Camera start error:', err);
        if (err && typeof err === 'object' && 'name' in err) {
          setError(describeCameraError(err));
        } else {
          setError('Failed to start camera. Please check permissions and try again.');
        }
        setIsReady(false);
      }
    }

    const scheduleRestart = () => {
      if (cancelled) return;
      if (restartTimer) clearTimeout(restartTimer);
      restartTimer = setTimeout(() => {
        if (!cancelled) {
          startScanner();
        }
      }, 300);
    };

    startScanner();

    return () => {
      cancelled = true;
      if (restartTimer) {
        clearTimeout(restartTimer);
      }
      controlsRef.current?.stop();
      controlsRef.current = null;
      stopVideoStream();
    };
  }, [enabled, permissionStatus, selectedDeviceId, stopVideoStream, validateAndHandlePayload]);

  const handleManualInput = (text) => {
    if (!text.trim()) return;
    const success = validateAndHandlePayload(text.trim());
    if (!success) {
      setError('Invalid QR code data format. Expecting attendance JSON payload.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-white md:rounded-lg shadow-2xl w-full h-full md:max-w-lg md:h-auto md:max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b sticky top-0 bg-white z-10 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Camera size={20} className="text-blue-600 sm:w-6 sm:h-6" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Scan QR Code</h2>
            {badgeLabel && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                {badgeLabel}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 active:text-gray-900 transition p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full touch-manipulation"
          >
            <X size={24} />
          </button>
        </div>

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

          <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9', minHeight: '250px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
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

          {debugInfo && isReady && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-mono text-yellow-800 break-all">{debugInfo}</p>
            </div>
          )}

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
