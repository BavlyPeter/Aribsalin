import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowRight, Flashlight, FlashlightOff, CheckCircle2, XCircle, Camera, Upload } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFestivalStore } from '../../store/useFestivalStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { MarketModal } from '../modals/MarketModal';
import { AddPointsModal } from '../modals/AddPointsModal';

export interface QRScannerProps {
  onBack?: () => void;
  onScanSuccess?: (decodedText: string) => boolean | Promise<boolean> | void;
  mode?: 'attendance' | 'market' | 'viewDetails' | 'addPoints';
}

export function QRScanner({ onBack, onScanSuccess, mode: propsMode }: QRScannerProps = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentServant, participants, setParticipants, viewerRole } = useFestivalStore();

  const mode = propsMode || (searchParams.get('mode') as any) || 'attendance';

  const [selectedParticipantForModal, setSelectedParticipantForModal] = useState<any | null>(null);
  const [activeModal, setActiveModal] = useState<'market' | 'addPoints' | null>(null);
  const [meetingType, setMeetingType] = useState<'class' | 'service_meeting'>('class');
  const meetingTypeRef = useRef(meetingType);
  useEffect(() => {
    meetingTypeRef.current = meetingType;
  }, [meetingType]);

  const userRole = currentServant?.role || viewerRole || 'normal';
  const canSelectMeetingType = ['admin', 'supervisor', 'developer'].includes(userRole);

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

  const resolveParticipantUuid = async (identifier: string) => {
    if (!identifier) return null;
    const maybeUuid = identifier.includes('-');
    if (maybeUuid) {
      const { data, error } = await supabase.from('participants').select('id, participant_id, points_balance').eq('id', identifier).single();
      if (!error && data) return data;
    }
    const { data, error } = await supabase.from('participants').select('id, participant_id, points_balance').eq('participant_id', identifier).single();
    if (!error && data) return data;
    return null;
  };

  const defaultScanHandler = async (decodedText: string): Promise<boolean> => {
    const rawScanned = String(decodedText).trim();
    const scanned = rawScanned.toLowerCase();
    if (!scanned) return false;

    // 1. First, search for the scanned ID in the store.participants
    const participant = participants.find(p =>
      String(p.id || '').trim().toLowerCase() === scanned ||
      String(p.participant_id || '').trim().toLowerCase() === scanned ||
      String((p as any).dbId || '').trim().toLowerCase() === scanned
    );

    if (participant) {
      const targetParticipant = participant;

      if (mode === 'attendance') {
        if (!currentServant || !currentServant.id) {
          toast.error('يجب تسجيل الدخول كخادم قبل تسجيل الحضور');
          return false;
        }

        try {
          const participantUuid = targetParticipant.id as string;
          const { error: attendError } = await supabase.from('attendance_logs').insert([{
            participant_id: participantUuid,
            servant_id: currentServant.id,
            attendance_date: new Date().toISOString().split('T')[0]
          }]);

          if (attendError) {
            toast.info('تم تسجيل حضور هذا المشارك مسبقاً اليوم');
            return true;
          }

          const currentPoints = Number(targetParticipant.points || 0);
          const newPoints = currentPoints + 10;
          await supabase.from('participants').update({ points_balance: newPoints }).eq('id', participantUuid);
          await supabase.from('points_transactions').insert([{
            participant_id: participantUuid,
            servant_id: currentServant.id,
            transaction_type: 'attendance_bonus',
            points_amount: 10,
            description: 'مكافأة حضور اليوم'
          }]);

          setParticipants((prev: any[]) => prev.map(p => (String(p.id) === String(participantUuid)) ? { ...p, points: newPoints, attended: true, attendanceDays: [...p.attendanceDays, new Date().toISOString().split('T')[0]] } : p));
          toast.success('تم تسجيل الحضور بنجاح وإضافة 10 نقاط');
          return true;
        } catch (err) {
          toast.error('حدث خطأ أثناء تسجيل الحضور');
          return false;
        }
      } else {
        setTimeout(() => {
          if (mode === 'market') {
            setSelectedParticipantForModal(targetParticipant);
            setActiveModal('market');
          } else if (mode === 'addPoints') {
            setSelectedParticipantForModal(targetParticipant);
            setActiveModal('addPoints');
          } else if (mode === 'viewDetails') {
            navigate(`/profile/${targetParticipant.id}`);
          }
        }, 500);
        return true;
      }
    }

    // 2. If NOT found in participants, query the servants table via Supabase
    try {
      let servantData: any = null;

      // Query by teacher_id exact or case-insensitive
      const { data: sByTeacherId } = await supabase
        .from('servants')
        .select('id, full_name, teacher_id')
        .ilike('teacher_id', rawScanned)
        .maybeSingle();

      servantData = sByTeacherId;

      // Fallback: check by id if scanned text looks like a UUID
      if (!servantData && rawScanned.includes('-')) {
        const { data: sById } = await supabase
          .from('servants')
          .select('id, full_name, teacher_id')
          .eq('id', rawScanned)
          .maybeSingle();
        servantData = sById;
      }

      if (servantData) {
        if (mode === 'attendance') {
          if (!currentServant || !currentServant.id) {
            toast.error('يجب تسجيل الدخول كخادم قبل تسجيل الحضور');
            return false;
          }

          const currentMeeting = meetingTypeRef.current || meetingType;
          const today = new Date().toISOString().split('T')[0];

          // Check if already attended today for this meeting type
          const { data: existingLog } = await supabase
            .from('servant_attendance_logs')
            .select('id')
            .eq('servant_id', servantData.id)
            .eq('meeting_type', currentMeeting)
            .eq('attendance_date', today)
            .maybeSingle();

          if (existingLog) {
            toast.info('تم تسجيل حضور هذا الخادم مسبقاً لهذا الاجتماع اليوم');
            return true;
          }

          // 3. Insert record into servant_attendance_logs
          const { error: servantAttendError } = await supabase
            .from('servant_attendance_logs')
            .insert([{
              servant_id: servantData.id,
              scanned_by: currentServant.id,
              meeting_type: currentMeeting,
              attendance_date: today
            }]);

          // 4. Handle duplicate constraint error gracefully
          if (servantAttendError) {
            toast.info('تم تسجيل حضور هذا الخادم مسبقاً لهذا الاجتماع اليوم');
            return true;
          }

          // 5. Show success toast
          toast.success(`تم تسجيل حضور الخادم ${servantData.full_name} بنجاح`);
          return true;
        } else if (mode === 'viewDetails') {
          setTimeout(() => {
            navigate(`/servant-profile/${servantData.id}`);
          }, 300);
          return true;
        } else {
          toast.error('عمليات السوق والنقاط الإضافية مخصصة للطلاب والمشاركين فقط');
          return false;
        }
      }
    } catch (err) {
      console.error('Error checking servant scan:', err);
    }

    // 6. If neither student nor servant is found, show the existing error
    toast.error('هذا الكود غير مسجل في النظام');
    return false;
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (scanLockRef.current) return;
    const cleanText = decodedText.trim();
    if (!cleanText || cleanText.length < 1) return;

    if (mode === 'attendance' && lastScannedCodeRef.current === cleanText) return;

    scanLockRef.current = true;
    lastScannedCodeRef.current = cleanText;

    // Call parent or default handler and await validation
    const isValid = onScanSuccess
      ? await onScanSuccess(cleanText)
      : await defaultScanHandler(cleanText);

    if (isValid === false) {
      // Invalid Code: Keep camera running smoothly. Unlock after delay.
      setTimeout(() => { 
        scanLockRef.current = false; 
        if (lastScannedCodeRef.current === cleanText) {
          lastScannedCodeRef.current = null;
        }
      }, 1500);
      return;
    }

    // Valid Code:
    if (mode === 'attendance') {
      setTimeout(() => { scanLockRef.current = false; }, 2000);
      setTimeout(() => { if (lastScannedCodeRef.current === cleanText) lastScannedCodeRef.current = null; }, 5000);
    } else {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          try { scannerRef.current?.clear(); } catch(e) {}
        }).catch(() => {});
      }
    }
  };


  const doBack = onBack || (() => {
    if (viewerRole === 'student') navigate('/student-portal');
    else navigate('/dashboard');
  });

  const handleSafeBack = () => {
    scanLockRef.current = true; // Prevent new scans while backing out
    if (scannerRef.current) {
      // Fallback: Force back navigation after 500ms even if stop() hangs
      const forceBackTimer = setTimeout(() => {
        doBack();
      }, 500);

      scannerRef.current.stop().then(() => {
        clearTimeout(forceBackTimer);
        try { scannerRef.current?.clear(); } catch(e) {}
        doBack();
      }).catch(() => {
        clearTimeout(forceBackTimer);
        doBack();
      });
    } else {
      doBack();
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
      // Create a COMPLETELY ISOLATED scanner instance so we don't crash the live camera!
      const fileScanner = new Html5Qrcode('file-qr-reader');
      let decodedText = '';

      try {
        // Attempt 1: Direct Scan (Works best for pure, lossless PNGs)
        decodedText = await fileScanner.scanFile(file, true);
      } catch (initialError) {
        // Attempt 2: Canvas Normalizer
        const normalizedFile = await new Promise<File>((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          
          img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 1200;
            let { width, height } = img;

            if (width > height && width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }

            if (width < 300) {
              const scale = 400 / width;
              width *= scale;
              height *= scale;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, width, height);
              // CRITICAL: Disable smoothing to keep QR edges sharp!
              ctx.imageSmoothingEnabled = false; 
              ctx.drawImage(img, 0, 0, width, height);
              
              canvas.toBlob((blob) => {
                if (blob) resolve(new File([blob], "normalized_qr.png", { type: "image/png" }));
                else reject(new Error("Canvas toBlob failed"));
              }, 'image/png');
            } else reject(new Error("No canvas context"));
          };
          img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
          img.src = url;
        });

        decodedText = await fileScanner.scanFile(normalizedFile, true);
      }
      
      // Cleanup the isolated scanner
      try { fileScanner.clear(); } catch(e) {}

      if (decodedText) {
        scanLockRef.current = false;
        handleScanSuccess(decodedText);
      }
    } catch (err) {
      console.error('Error reading QR from image:', err);
      alert('لم يتم التعرف على QR Code في هذه الصورة. يرجى التأكد من وضوح الصورة وتوجيه الكود بشكل صحيح.');
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
      {/* ISOLATED SCANNER FOR FILE UPLOADS TO PREVENT LIVE CAMERA CRASHES */}
      <div id="file-qr-reader" className="hidden" />
      
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
              {mode === 'attendance' ? 'قم بمسح كود QR للمشارك أو الخادم' :
               mode === 'market' ? 'امسح الكود لخصم النقاط' :
               mode === 'addPoints' ? 'امسح الكود لإضافة النقاط' :
               'امسح الكود لعرض الملف الشخصي'}
            </div>
            {mode === 'attendance' && canSelectMeetingType && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setMeetingType('class')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    meetingType === 'class' 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  تسجيل حصة
                </button>
                <button
                  type="button"
                  onClick={() => setMeetingType('service_meeting')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    meetingType === 'service_meeting' 
                      ? 'bg-secondary text-secondary-foreground shadow-md' 
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  تسجيل اجتماع خدمة
                </button>
              </div>
            )}
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

      {/* Market Modal */}
      {activeModal === 'market' && selectedParticipantForModal && (
        <MarketModal
          participantName={selectedParticipantForModal.name}
          currentPoints={selectedParticipantForModal.points}
          onConfirm={async (pointsToDeduct: number) => {
            if (!currentServant || !currentServant.id) {
              toast.error('يجب تسجيل الدخول كخادم قبل تنفيذ العملية');
              return;
            }
            try {
              const participantRow: any = await resolveParticipantUuid(selectedParticipantForModal.id);
              if (!participantRow) {
                toast.error('المشارك غير موجود في النظام');
                return;
              }
              const participantUuid = participantRow.id;
              const currentPoints = Number(participantRow.points_balance || 0);
              const deduct = Math.abs(Math.floor(pointsToDeduct));
              const newPoints = Math.max(0, currentPoints - deduct);

              const { error: updateError } = await supabase.from('participants').update({ points_balance: newPoints }).eq('id', participantUuid);
              if (updateError) {
                toast.error('حدث خطأ أثناء تحديث النقاط');
                return;
              }

              await supabase.from('points_transactions').insert([{
                participant_id: participantUuid,
                servant_id: currentServant.id,
                transaction_type: 'market_deduct',
                points_amount: -Math.abs(deduct),
                description: 'خصم من السوق'
              }]);

              setParticipants((prev: any[]) => prev.map(p => (p.id === selectedParticipantForModal.id || p.id === participantUuid) ? { ...p, points: newPoints } : p));
              toast.success('تم خصم النقاط بنجاح');
              setActiveModal(null);
              setSelectedParticipantForModal(null);
              navigate('/dashboard');
            } catch (err) {
              toast.error('حدث خطأ أثناء خصم النقاط');
            }
          }}
          onCancel={() => {
            setActiveModal(null);
            setSelectedParticipantForModal(null);
            navigate('/dashboard');
          }}
        />
      )}

      {/* Add Points Modal */}
      {activeModal === 'addPoints' && selectedParticipantForModal && (
        <AddPointsModal
          participantName={selectedParticipantForModal.name}
          currentPoints={selectedParticipantForModal.points}
          onConfirm={async (pointsToAdd: number) => {
            if (!currentServant || !currentServant.id) {
              toast.error('يجب تسجيل الدخول كخادم قبل تنفيذ العملية');
              return;
            }
            try {
              const participantRow: any = await resolveParticipantUuid(selectedParticipantForModal.id);
              if (!participantRow) {
                toast.error('المشارك غير موجود في النظام');
                return;
              }
              const participantUuid = participantRow.id;
              const currentPoints = Number(participantRow.points_balance || 0);
              const add = Math.abs(Math.floor(pointsToAdd));
              const newPoints = currentPoints + add;

              const { error: updateError } = await supabase.from('participants').update({ points_balance: newPoints }).eq('id', participantUuid);
              if (updateError) {
                toast.error('حدث خطأ أثناء تحديث النقاط');
                return;
              }

              await supabase.from('points_transactions').insert([{
                participant_id: participantUuid,
                servant_id: currentServant.id,
                transaction_type: 'bonus_add',
                points_amount: Math.abs(add),
                description: 'إضافة نقاط إضافية'
              }]);

              setParticipants((prev: any[]) => prev.map(p => (p.id === selectedParticipantForModal.id || p.id === participantUuid) ? { ...p, points: newPoints } : p));
              toast.success('تم إضافة النقاط بنجاح');
              setActiveModal(null);
              setSelectedParticipantForModal(null);
              navigate('/dashboard');
            } catch (err) {
              toast.error('حدث خطأ أثناء إضافة النقاط');
            }
          }}
          onCancel={() => {
            setActiveModal(null);
            setSelectedParticipantForModal(null);
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
}
