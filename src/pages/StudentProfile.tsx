import { ArrowRight, Calendar, Phone, MapPin, Book, Award, CheckCircle2, User, School, Download, CreditCard, Trash2, BookOpen, Church, Heart, Scroll, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Participant } from '../types';
import { useRef, useState, useMemo, useEffect, startTransition } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { IDCard } from '../components/shared/IDCard';
import { useFestivalStore } from '../store/useFestivalStore';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface StudentProfileProps {
  student?: Participant;
  totalDays?: number;
  onBack?: () => void;
  onDeleteAttendance?: (participantId: string, date: string) => Promise<void>; // ADDED
  viewerRole?: string; // ADDED
}

export function StudentProfile({
  student: propsStudent,
  totalDays: propsTotalDays,
  onBack,
  onDeleteAttendance,
  viewerRole: propsViewerRole
}: StudentProfileProps = {}) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const { participants, currentServant, viewerRole: storeViewerRole, fetchData } = useFestivalStore();

  const viewerRole = propsViewerRole || currentServant?.role || storeViewerRole;

  const foundStudent = useMemo(() => {
    if (propsStudent) return propsStudent;
    if (!paramId) return null;
    const normalized = String(paramId).trim().toUpperCase();
    return participants.find(p =>
      String(p.id || '').trim().toUpperCase() === normalized ||
      String(p.participant_id || '').trim().toUpperCase() === normalized
    ) || null;
  }, [propsStudent, paramId, participants]);

  const student = foundStudent;

  const calculatedTotalDays = useMemo(() => {
    if (!participants || participants.length === 0 || !student) return 1;

    const studentStage = student?.data?.educationStage || (student as any)?.educational_stage || '';
    const studentYear = student?.data?.educationYear || (student as any)?.academic_year || '';
    const studentClassKey = `${studentStage}_${studentYear}`.trim();

    const filteredParticipants = participants.filter((p: any) => {
      const pStage = p?.data?.educationStage || p?.educational_stage || '';
      const pYear = p?.data?.educationYear || p?.academic_year || '';
      const pClassKey = `${pStage}_${pYear}`.trim();
      return pClassKey === studentClassKey;
    });

    const uniqueDates = new Set<string>();
    filteredParticipants.forEach((p: any) => {
      if (p?.attendanceDays && Array.isArray(p.attendanceDays)) {
        p.attendanceDays.forEach((date: string) => uniqueDates.add(date));
      }
    });

    return Math.max(1, uniqueDates.size);
  }, [participants, student]);

  const totalDays = propsTotalDays !== undefined ? propsTotalDays : calculatedTotalDays;
  const handleBack = onBack || (() => {
    setTimeout(() => {
      startTransition(() => {
        navigate(-1);
      });
    }, 10);
  });

  const [isDeletingDate, setIsDeletingDate] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const idCardRef = useRef<HTMLDivElement>(null);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);

  if (!student && (!participants || participants.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <h2 className="text-lg font-semibold mb-4">حدث خطأ: لم يتم العثور على بيانات المشارك</h2>
        <p className="mb-6 text-muted-foreground">الرجاء المحاولة مرة أخرى أو العودة.</p>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          onClick={handleBack}
        >
          العودة
        </button>
      </div>
    );
  }

  const attendancePercentage = totalDays > 0 && student?.attendanceDays ? Math.round((student.attendanceDays.length / totalDays) * 100) : 0;
  const participantSmartId = student?.participant_id || 'غير متوفر';

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return 0;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (larger for better quality)
    const size = 600;
    canvas.width = size;
    canvas.height = size;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = `QR_${student.id}_${student.name}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      });

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const downloadIDCard = async () => {
    if (!idCardRef.current) return;

    setIsDownloadingCard(true);

    try {
      // Wait a bit for the card to render
      await new Promise(resolve => setTimeout(resolve, 300));

      const element = idCardRef.current.querySelector('#id-card') as HTMLElement;
      if (!element) return;

      const canvas = await html2canvas(idCardRef.current, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        // إجبار الـ canvas على أن يكون بنفس حجم الكارنيه تماماً
        // width: 350,
        // height: 550,
        windowWidth: 350,
        windowHeight: 550,
        // منع أي مسافات من الـ scroll
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        removeContainer: true
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          setIsDownloadingCard(false);
          return;
        }
        const link = document.createElement('a');
        link.download = `${student.name}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        setIsDownloadingCard(false);
      });
    } catch (error) {
      console.error('Error generating ID card:', error);
      setIsDownloadingCard(false);
    }
  };

  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [selectedSpiritualModal, setSelectedSpiritualModal] = useState<{
    type: 'class' | 'liturgy' | 'communion' | 'confession';
    title: string;
  } | null>(null);

  const canDeleteAttendance = ['admin', 'supervisor', 'developer'].includes(viewerRole);

  const fetchStudentAttendanceLogs = async () => {
    const targetId = student?.dbId || student?.id;
    if (!targetId) return;
    setIsLoadingAttendance(true);
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('participant_id', targetId)
        .order('attendance_date', { ascending: false });

      if (error) throw error;
      setAttendanceLogs(data || []);
    } catch (err) {
      console.error('Error fetching student attendance logs:', err);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  useEffect(() => {
    if (student) {
      fetchStudentAttendanceLogs();
    }
  }, [student?.id, student?.dbId]);

  const classLogs = attendanceLogs.filter(l => (l.meeting_type || 'class') === 'class');
  const liturgyLogs = attendanceLogs.filter(l => l.meeting_type === 'liturgy');
  const communionLogs = attendanceLogs.filter(l => l.meeting_type === 'communion');
  const confessionLogs = attendanceLogs.filter(l => l.meeting_type === 'confession');

  const handleDeleteLog = async (logId: string, date: string, meetingType: string) => {
    const typeLabel = meetingType === 'class' ? 'حصة' : meetingType === 'liturgy' ? 'قداس' : meetingType === 'communion' ? 'تناول' : 'اعتراف';
    if (!confirm(`هل أنت متأكد من حذف حضور ${typeLabel} يوم ${date}؟`)) return;

    setIsDeletingDate(logId);
    try {
      const targetId = student.dbId || student.id;

      const { error: deleteError } = await supabase
        .from('attendance_logs')
        .delete()
        .eq('id', logId);

      if (deleteError) throw deleteError;

      // Only deduct 10 points if the meeting_type is 'class'
      if (meetingType === 'class') {
        const { data: pData } = await supabase
          .from('participants')
          .select('points_balance')
          .eq('id', targetId)
          .single();

        const currentBalance = pData?.points_balance || 0;
        const newBalance = Math.max(0, currentBalance - 10);

        await supabase
          .from('participants')
          .update({ points_balance: newBalance })
          .eq('id', targetId);

        await supabase
          .from('points_transactions')
          .insert({
            participant_id: targetId,
            servant_id: currentServant?.id || null,
            transaction_type: 'deduction',
            points_amount: 10,
            description: `إلغاء مكافأة حضور حصة يوم ${date}`
          });

        toast.success(`تم حذف حضور الحصة ليوم ${date} وخصم 10 نقاط بنجاح`);
      } else {
        toast.success(`تم حذف حضور ${typeLabel} ليوم ${date} بنجاح`);
      }

      setAttendanceLogs(prev => prev.filter(l => l.id !== logId));
      await fetchData();
    } catch (error) {
      console.error('Error deleting specific attendance:', error);
      toast.error('حدث خطأ أثناء حذف السجل');
    } finally {
      setIsDeletingDate(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <h2 className="text-xl">ملف المشارك</h2>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {/* Profile Header Card */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center border-4 border-white shadow-xl">
            {student?.data?.photo_url || (student as any)?.photo_url ? (
              <img
                src={student?.data?.photo_url || (student as any)?.photo_url}
                alt={student?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-primary" />
            )}
          </div>
          <h3 className="text-xl mb-1 text-primary">{student?.name}</h3>
          <p className="text-lg text-muted-foreground mb-4">رقم المشارك: <span className="font-bold text-red-500">{participantSmartId}</span></p>

          {/* Status Badge */}
          {student?.attended && (
            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-700 px-4 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">حاضر اليوم</span>
            </div>
          )}
        </div>


        {/* ID Card Preview */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="mb-4 text-center text-primary">بطاقة الهوية</h3>
          <div className="flex justify-center">
            <div className="transform scale-75 origin-top">
              <IDCard student={student} />
            </div>
          </div>
        </div>

        {/* Action buttons under ID card: Download ID card and Download QR (hidden) */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={downloadIDCard}
            disabled={isDownloadingCard}
            className="bg-primary text-primary-foreground rounded-xl py-3 px-5 shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center gap-2"
            title="تحميل الكارنيه"
          >
            <CreditCard className="w-5 h-5" />
            <span>{isDownloadingCard ? 'جاري التحميل...' : 'تحميل الكارنيه'}</span>
          </button>

          <button
            onClick={downloadQRCode}
            className="bg-secondary text-secondary-foreground rounded-xl py-3 px-5 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-2"
            title="تحميل كود QR"
          >
            <Download className="w-5 h-5" />
            <span>تحميل كود QR</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border text-center">
            <div className="w-12 h-12 bg-secondary/20 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Award className="w-6 h-6" style={{ color: 'var(--secondary)' }} />
            </div>
            <div className="text-2xl mb-1" style={{ color: 'var(--primary)' }}>{student?.points || 0}</div>
            <div className="text-sm text-muted-foreground">النقاط المتاحة</div>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-sm border border-border text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl mb-1" style={{ color: 'var(--primary)' }}>{attendancePercentage}%</div>
            <div className="text-sm text-muted-foreground">نسبة الحضور</div>
          </div>
        </div>

        {/* Spiritual Tracking Section */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary font-bold text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Church className="w-5 h-5 text-primary" />
              المتابعة الروحية
            </span>
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              {attendanceLogs.length} نشاط مسجل
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              {
                type: 'class' as const,
                title: 'الحصص',
                count: classLogs.length,
                icon: BookOpen,
                bgClass: 'bg-blue-50/60 dark:bg-blue-950/20',
                borderClass: 'border-blue-200 dark:border-blue-800/40',
                iconBgClass: 'bg-blue-100 dark:bg-blue-900/50',
                iconColorClass: 'text-blue-600 dark:text-blue-400'
              },
              {
                type: 'liturgy' as const,
                title: 'القداسات',
                count: liturgyLogs.length,
                icon: Church,
                bgClass: 'bg-purple-50/60 dark:bg-purple-950/20',
                borderClass: 'border-purple-200 dark:border-purple-800/40',
                iconBgClass: 'bg-purple-100 dark:bg-purple-900/50',
                iconColorClass: 'text-purple-600 dark:text-purple-400'
              },
              {
                type: 'communion' as const,
                title: 'التناول',
                count: communionLogs.length,
                icon: Heart,
                bgClass: 'bg-rose-50/60 dark:bg-rose-950/20',
                borderClass: 'border-rose-200 dark:border-rose-800/40',
                iconBgClass: 'bg-rose-100 dark:bg-rose-900/50',
                iconColorClass: 'text-rose-600 dark:text-rose-400'
              },
              {
                type: 'confession' as const,
                title: 'الاعتراف',
                count: confessionLogs.length,
                icon: Scroll,
                bgClass: 'bg-amber-50/60 dark:bg-amber-950/20',
                borderClass: 'border-amber-200 dark:border-amber-800/40',
                iconBgClass: 'bg-amber-100 dark:bg-amber-900/50',
                iconColorClass: 'text-amber-600 dark:text-amber-400'
              }
            ].map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.type}
                  type="button"
                  onClick={() => setSelectedSpiritualModal({ type: card.type, title: card.title })}
                  className={`p-4 rounded-xl border text-right transition-all transform active:scale-98 hover:shadow-md flex flex-col justify-between ${card.bgClass} ${card.borderClass}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBgClass} ${card.iconColorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-foreground">
                      {card.count}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{card.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <span>عرض السجل</span>
                      <span className="text-xs">←</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">البيانات الشخصية</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">تاريخ الميلاد</div>
                {student?.data?.dateOfBirth ? (
                  <div className="font-medium">
                    {new Date(student.data.dateOfBirth).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    <span className="text-sm text-muted-foreground mr-2">
                      ({calculateAge(student.data.dateOfBirth)} سنة)
                    </span>
                  </div>
                ) : (
                  <div className="font-medium text-muted-foreground">غير مسجل</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">النوع</div>
                <div className="font-medium">
                  {student?.data?.gender === 'male' ? 'ذكر' : student?.data?.gender === 'female' ? 'أنثى' : 'غير محدد'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Book className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">أب الإعتراف</div>
                <div className="font-medium">{student?.data?.confessionFather || 'غير محدد'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Education Information */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">البيانات التعليمية</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <School className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">المرحلة الدراسية</div>
                <div className="font-medium">{student?.data?.educationStage || 'غير محدد'}</div>
              </div>
            </div>

            {student?.data?.educationYear && (
              <div className="flex items-start gap-3">
                <Book className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">السنة الدراسية</div>
                  <div className="font-medium">{student?.data?.educationYear}</div>
                </div>
              </div>
            )}

            {(student?.data?.studyOrWorkPlace || (student as any)?.class_or_job) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">
                    {student?.data?.educationStage === 'graduate' ? 'جهة العمل / الوظيفة' : 
                     (['kg', 'primary', 'preparatory', 'secondary'].includes(student?.data?.educationStage || '')) ? 'المدرسة' : 'الجامعة / الكلية'}
                  </div>
                  <div className="font-medium">{student?.data?.studyOrWorkPlace || (student as any)?.class_or_job}</div>
                </div>
              </div>
            )}

            {student?.data?.jobTitle && (
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">الوظيفة</div>
                  <div className="font-medium">{student?.data?.jobTitle}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">بيانات التواصل</h3>
          <div className="space-y-3">
            {student?.data?.personalMobile && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">موبايل شخصي</div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${student.data.personalMobile}`} className="font-medium text-primary hover:underline" dir="ltr">
                      {student.data.personalMobile}
                    </a>
                    <a 
                      href={`https://wa.me/2${student.data.personalMobile}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                      title="مراسلة عبر واتساب"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {student?.data?.fatherMobile && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">موبايل الأب</div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${student.data.fatherMobile}`} className="font-medium text-primary hover:underline" dir="ltr">
                      {student.data.fatherMobile}
                    </a>
                    <a 
                      href={`https://wa.me/2${student.data.fatherMobile}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                      title="مراسلة عبر واتساب"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {student?.data?.motherMobile && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">موبايل الأم</div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${student.data.motherMobile}`} className="font-medium text-primary hover:underline" dir="ltr">
                      {student.data.motherMobile}
                    </a>
                    <a 
                      href={`https://wa.me/2${student.data.motherMobile}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                      title="مراسلة عبر واتساب"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {(student?.data?.area || student?.data?.address) && (
              <div className="flex items-start gap-3 pt-2 border-t border-border">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">العنوان</div>
                  <div className="font-medium">
                    {[student?.data?.area, student?.data?.address].filter(Boolean).join(' - ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden ID Card for Download */}
        <div
          ref={idCardRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            backgroundColor: '#ffffff',
            // padding: '20px'
          }}
        >
          <IDCard student={student} />
        </div>
        {/* Hidden QR for download only */}
        <div
          ref={qrRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            backgroundColor: '#ffffff',
            padding: '20px'
          }}
        >
          <QRCodeSVG value={String(student.participant_id || student.id)} size={600} includeMargin={true} />
        </div>
      </div>

      {/* Spiritual Activity Logs Modal */}
      {selectedSpiritualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {selectedSpiritualModal.type === 'class' && <BookOpen className="w-5 h-5" />}
                  {selectedSpiritualModal.type === 'liturgy' && <Church className="w-5 h-5" />}
                  {selectedSpiritualModal.type === 'communion' && <Heart className="w-5 h-5" />}
                  {selectedSpiritualModal.type === 'confession' && <Scroll className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">سجل: {selectedSpiritualModal.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    إجمالي السجلات: {
                      (selectedSpiritualModal.type === 'class' ? classLogs :
                       selectedSpiritualModal.type === 'liturgy' ? liturgyLogs :
                       selectedSpiritualModal.type === 'communion' ? communionLogs : confessionLogs).length
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSpiritualModal(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: List of Dates */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {isLoadingAttendance ? (
                <div className="text-center py-8 text-muted-foreground">جاري تحميل السجلات...</div>
              ) : (selectedSpiritualModal.type === 'class' ? classLogs :
                   selectedSpiritualModal.type === 'liturgy' ? liturgyLogs :
                   selectedSpiritualModal.type === 'communion' ? communionLogs : confessionLogs).length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                  لا توجد سجلات حضور مسجلة لهذا النشاط حتى الآن
                </div>
              ) : (
                (selectedSpiritualModal.type === 'class' ? classLogs :
                 selectedSpiritualModal.type === 'liturgy' ? liturgyLogs :
                 selectedSpiritualModal.type === 'communion' ? communionLogs : confessionLogs).map((log: any) => {
                  const dateStr = log.attendance_date || (log.scanned_at ? String(log.scanned_at).split('T')[0] : '');
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground block" dir="ltr">{dateStr}</span>
                          {log.scanned_at && (
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(log.scanned_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {canDeleteAttendance && (
                        <button
                          onClick={() => handleDeleteLog(log.id, dateStr, log.meeting_type || 'class')}
                          disabled={isDeletingDate === log.id}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="حذف السجل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-border bg-muted/20 text-center">
              <button
                onClick={() => setSelectedSpiritualModal(null)}
                className="w-full py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
