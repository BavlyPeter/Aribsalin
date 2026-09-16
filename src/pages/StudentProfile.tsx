import { ArrowRight, Calendar, Phone, MapPin, Book, Award, CheckCircle2, User, School, Download, CreditCard, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Participant } from '../types';
import { useRef, useState, useMemo, startTransition } from 'react';
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

  const handleDeleteDate = async (date: string) => {
    if (!confirm(`هل أنت متأكد من حذف حضور يوم ${date} لهذا المخدوم؟`)) return;
    
    setIsDeletingDate(date);
    try {
      const targetId = student.dbId || student.id;
      if (onDeleteAttendance) {
        await onDeleteAttendance(targetId, date);
      } else {
        const { error: deleteError } = await supabase
          .from('attendance_logs')
          .delete()
          .match({ 
            participant_id: targetId, 
            attendance_date: date 
          });

        if (deleteError) throw deleteError;

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
            servant_id: currentServant?.id,
            transaction_type: 'deduction',
            points_amount: 10,
            description: `إلغاء مكافأة حضور يوم ${date}`
          });

        toast.success(`تم حذف حضور يوم ${date} وخصم 10 نقاط بنجاح`);
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting specific attendance:', error);
      toast.error('حدث خطأ أثناء حذف الحصة');
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

        {/* Attendance Details */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">تفاصيل الحضور</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">عدد أيام الحضور</span>
              <span className="font-medium">{student?.attendanceDays?.length || 0} يوم</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">إجمالي أيام المهرجان</span>
              <span className="font-medium">{totalDays} يوم</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">نسبة الحضور</span>
              <span className="font-medium" style={{ color: 'var(--primary)' }}>{attendancePercentage}%</span>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <h4 className="text-sm text-muted-foreground mb-1">أيام الحضور:</h4>
            {student?.attendanceDays && student.attendanceDays.length > 0 ? (
              student.attendanceDays.map((date, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground" dir="ltr">{date}</span>
                  </div>
                  
                  {/* Delete Button (Only for Admin/Supervisor) */}
                  {(viewerRole === 'admin' || viewerRole === 'supervisor') && (
                    <button
                      onClick={() => handleDeleteDate(date)}
                      disabled={isDeletingDate === date}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="حذف الحصة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                لم يتم تسجيل أي حضور حتى الآن
              </div>
            )}
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
                  <a href={`tel:${student.data.personalMobile}`} className="font-medium text-primary">
                    {student.data.personalMobile}
                  </a>
                </div>
              </div>
            )}

            {student?.data?.fatherMobile && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">موبايل الأب</div>
                  <a href={`tel:${student.data.fatherMobile}`} className="font-medium text-primary">
                    {student.data.fatherMobile}
                  </a>
                </div>
              </div>
            )}

            {student?.data?.motherMobile && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">موبايل الأم</div>
                  <a href={`tel:${student.data.motherMobile}`} className="font-medium text-primary">
                    {student.data.motherMobile}
                  </a>
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
    </div>
  );
}
