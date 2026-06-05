import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowRight, Flashlight, FlashlightOff, CheckCircle2, XCircle, Camera, Upload } from 'lucide-react';

interface QRScannerProps {
  onBack: () => void;
  onScanSuccess: (decodedText: string) => boolean | Promise<boolean> | void;
  mode: 'attendance' | 'market' | 'viewDetails' | 'addPoints';
}

export function QRScanner({ onBack, onScanSuccess, mode }: QRScannerProps) {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // Used to prevent duplicate scans during processing
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef('qr-reader');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanLockRef = useRef(false);
  const lastScannedCodeRef = useRef<string | null>(null);

  const handleScanSuccess = async (decodedText: string) => {
    if (scanLockRef.current) return;
    const cleanText = decodedText.trim();
    if (!cleanText || cleanText.length < 1) return;

    if (mode === 'attendance' && lastScannedCodeRef.current === cleanText) return;

    scanLockRef.current = true;
    lastScannedCodeRef.current = cleanText;

    if (navigator.vibrate) navigator.vibrate(200);
    
    // Call parent and await validation
    const isValid = await onScanSuccess(cleanText);

    if (isValid === false) {
      // Invalid Code: DO NOT STOP CAMERA. Unlock immediately to scan again.
      setTimeout(() => { scanLockRef.current = false; }, 1500);
      return;
    }

    // Valid Code:
    if (mode === 'attendance') {
      setTimeout(() => { scanLockRef.current = false; }, 2000);
      setTimeout(() => { if (lastScannedCodeRef.current === cleanText) lastScannedCodeRef.current = null; }, 5000);
    } else {
      // For modals: Safely stop camera immediately. AppMain will delay view switch by 500ms.
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          try { scannerRef.current?.clear(); } catch(e) {}
        }).catch(() => {});
      }
    }
  };

  const handleSafeBack = () => {
    scanLockRef.current = true; // Prevent new scans while backing out
    if (scannerRef.current) {
      // Fallback: Force back navigation after 500ms even if stop() hangs
      const forceBackTimer = setTimeout(() => {
        onBack();
      }, 500);

      scannerRef.current.stop().then(() => {
        clearTimeout(forceBackTimer);
        try { scannerRef.current?.clear(); } catch(e) {}
        onBack();
      }).catch(() => {
        clearTimeout(forceBackTimer);
        onBack();
      });
    } else {
      onBack();
    }
  };

  useEffect(() => {
    const startScanner = async () => {
      try {
        // First check if camera is available
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          setCameraError('لا توجد كاميرا متاحة على هذا الجهاز');
          setHasPermission(false);
          return;
        }

        const html5QrCode = new Html5Qrcode(scannerIdRef.current);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            // Success callback
            handleScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Error callback - we can ignore most errors as they're just "no QR code found"
          }
        );

        setIsScannerActive(true);
        setHasPermission(true);
      } catch (err: any) {
        console.error('Error starting scanner:', err);
        setHasPermission(false);

        if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
          setCameraError('تم رفض إذن الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح.');
        } else if (err.name === 'NotFoundError') {
          setCameraError('لم يتم العثور على كاميرا. تأكد من توصيل كاميرا بالجهاز.');
        } else if (err.name === 'NotReadableError') {
          setCameraError('الكاميرا قيد الاستخدام من قبل تطبيق آخر.');
        } else {
          setCameraError('فشل في تشغيل الكاميرا. استخدم خيار رفع الصورة بدلاً من ذلك.');
        }
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && isScannerActive) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const toggleFlash = async () => {
    if (scannerRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;

        if (capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any]
          });
          setFlashEnabled(!flashEnabled);
        }
      } catch (err) {
        console.error('Flash not supported:', err);
      }
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let scanner = scannerRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode(scannerIdRef.current);
        scannerRef.current = scanner;
      }

      // NATIVE CANVAS NORMALIZER FOR HIGH-RES MOBILE IMAGES
      const normalizedFile = await new Promise<File>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1000;
          let { width, height } = img;

          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) resolve(new File([blob], "normalized_qr.jpg", { type: "image/jpeg" }));
              else reject(new Error("Canvas toBlob failed"));
            }, 'image/jpeg', 0.9);
          } else reject(new Error("No canvas context"));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
        img.src = url;
      });

      const decodedText = await scanner.scanFile(normalizedFile, false);
      if (decodedText) {
        scanLockRef.current = false;
        handleScanSuccess(decodedText);
      }
    } catch (err) {
      alert('لم يتم التعرف على QR Code في هذه الصورة. يرجى قص الصورة (Crop) لتوضيح الكود.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      window.location.reload();
    } catch (err) {
      showNotification('error', 'فشل في الحصول على إذن الكاميرا');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleSafeBack}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg active:scale-95 transition-transform"
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </button>
          <div className="text-white text-center flex-1 mr-3">
            <div className="text-lg">
              {mode === 'attendance' ? 'تسجيل الحضور' :
               mode === 'market' ? 'مسح السوق' :
               mode === 'addPoints' ? 'إضافة نقاط' :
               'عرض التفاصيل'}
            </div>
            <div className="text-sm opacity-80">
              {mode === 'attendance' ? 'قم بمسح كود QR للمشارك' :
               mode === 'market' ? 'امسح الكود لخصم النقاط' :
               mode === 'addPoints' ? 'امسح الكود لإضافة النقاط' :
               'امسح الكود لعرض الملف الشخصي'}
            </div>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Scanner View */}
      <div className="relative h-screen flex items-center justify-center">
        <div id={scannerIdRef.current} className="w-full max-w-md" />

        {/* Camera Error / Fallback UI */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-card rounded-2xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl mb-2 text-foreground">تعذر الوصول إلى الكاميرا</h3>
                <p className="text-sm text-muted-foreground mb-4">{cameraError}</p>
              </div>

              {/* Alternative: Upload Image */}
              <div className="space-y-3">
                <button
                  onClick={requestCameraPermission}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-4 shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>طلب إذن الكاميرا مرة أخرى</span>
                </button>

                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-secondary text-secondary-foreground rounded-xl py-4 shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>رفع صورة QR</span>
                  </button>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    💡 يمكنك التقاط صورة للكود من تطبيق الكاميرا ثم رفعها هنا
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scanning Overlay */}
        {hasPermission === true && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-full flex items-center justify-center">
            {/* Corner markers */}
            <div className="relative w-64 h-64">
              {/* Top-left corner */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 rounded-tl-2xl"
                   style={{ borderColor: mode === 'attendance' ? 'var(--primary)' : mode === 'market' ? 'var(--secondary)' : mode === 'addPoints' ? '#10B981' : '#3B82F6' }} />
              {/* Top-right corner */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 rounded-tr-2xl"
                   style={{ borderColor: mode === 'attendance' ? 'var(--primary)' : mode === 'market' ? 'var(--secondary)' : mode === 'addPoints' ? '#10B981' : '#3B82F6' }} />
              {/* Bottom-left corner */}
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 rounded-bl-2xl"
                   style={{ borderColor: mode === 'attendance' ? 'var(--primary)' : mode === 'market' ? 'var(--secondary)' : mode === 'addPoints' ? '#10B981' : '#3B82F6' }} />
              {/* Bottom-right corner */}
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 rounded-br-2xl"
                   style={{ borderColor: mode === 'attendance' ? 'var(--primary)' : mode === 'market' ? 'var(--secondary)' : mode === 'addPoints' ? '#10B981' : '#3B82F6' }} />

              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="text-sm">ضع الكود في المربع</div>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Flash Toggle Button */}
      {hasPermission === true && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-4">
          <button
            onClick={toggleFlash}
            className="p-4 bg-white/20 backdrop-blur-sm rounded-full active:scale-95 transition-transform"
          >
            {flashEnabled ? (
              <Flashlight className="w-8 h-8 text-yellow-300" />
            ) : (
              <FlashlightOff className="w-8 h-8 text-white" />
            )}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-white/20 backdrop-blur-sm rounded-full active:scale-95 transition-transform"
          >
            <Upload className="w-8 h-8 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-24 left-4 right-4 z-30 animate-in slide-in-from-top">
          <div className={`flex items-center gap-3 p-4 rounded-xl shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
            <span className="text-lg">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
