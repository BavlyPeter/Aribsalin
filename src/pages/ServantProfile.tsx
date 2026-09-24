import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, User, Phone, MapPin, Book, Crown, Calendar, Info, Trash2, Download, CreditCard, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { IDCard } from '../components/shared/IDCard';
import { useFestivalStore } from '../store/useFestivalStore';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface ServantProfileProps {
  servantId?: string;
  onBack?: () => void;
}

const roleLabels: Record<string, string> = {
  'normal': 'خادم',
  'supervisor': 'أمين فصل',
  'admin': 'أمين الخدمة',
  'developer': 'مطور النظام'
};

const servingStages: Record<string, string> = {
  'kg': 'حضانة',
  'primary_12': 'ابتدائي (الأول والثاني)',
  'primary_34': 'ابتدائي (الثالث والرابع)',
  'primary_56': 'ابتدائي (الخامس والسادس)',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university_graduate': 'جامعي وخريجين'
};

const educationStages: Record<string, string> = {
  'kg': 'حضانة',
  'primary': 'ابتدائي',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university': 'جامعي',
  'graduate': 'خريجين'
};

export function ServantProfile({ servantId: propsServantId, onBack }: ServantProfileProps = {}) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const servantId = propsServantId || paramId || '';
  const handleBack = onBack || (() => navigate(-1));
  const { currentServant, viewerRole: storeViewerRole } = useFestivalStore();
  const viewerRole = currentServant?.role || storeViewerRole || 'normal';
  const canDeleteAttendance = ['admin', 'supervisor', 'developer'].includes(viewerRole);

  const [servant, setServant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isDeletingLogId, setIsDeletingLogId] = useState<string | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);
  const idCardRef = useRef<HTMLDivElement>(null);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);

  useEffect(() => {
    const fetchServantData = async () => {
      try {
        const { data, error } = await supabase
          .from('servants')
          .select('*')
          .eq('id', servantId)
          .single();

        if (error) throw error;
        setServant(data);
      } catch (err) {
        console.error('Error fetching servant profile:', err);
        toast.error('فشل في جلب بيانات الخادم');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAttendanceLogs = async () => {
      if (!servantId) return;
      setIsLoadingAttendance(true);
      try {
        const { data, error } = await supabase
          .from('servant_attendance_logs')
          .select('*')
          .eq('servant_id', servantId)
          .order('attendance_date', { ascending: false });

        if (error) {
          console.warn('Error fetching servant attendance logs:', error);
        } else {
          setAttendanceLogs(data || []);
        }
      } catch (err) {
        console.error('Error fetching servant attendance logs:', err);
      } finally {
        setIsLoadingAttendance(false);
      }
    };

    if (servantId) {
      fetchServantData();
      fetchAttendanceLogs();
    }
  }, [servantId]);

  const handleDeleteAttendance = async (logId: string, date: string) => {
    if (!confirm(`هل أنت متأكد من حذف سجل حضور يوم ${date}؟`)) return;
    setIsDeletingLogId(logId);
    try {
      const { error } = await supabase
        .from('servant_attendance_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      setAttendanceLogs(prev => prev.filter(item => item.id !== logId));
      toast.success('تم حذف سجل الحضور بنجاح');
    } catch (err) {
      console.error('Error deleting attendance log:', err);
      toast.error('فشل في حذف سجل الحضور');
    } finally {
      setIsDeletingLogId(null);
    }
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 600;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = `QR_${servant.teacher_id}_${servant.full_name}.png`;
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
      await new Promise(resolve => setTimeout(resolve, 300));

      const element = idCardRef.current.querySelector('#id-card') as HTMLElement;
      if (!element) return;

      const canvas = await html2canvas(idCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        windowWidth: 350,
        windowHeight: 550,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        removeContainer: true
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsDownloadingCard(false);
          return;
        }
        const link = document.createElement('a');
        link.download = `كارنيه_${servant.full_name || servant.teacher_id}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        setIsDownloadingCard(false);
      });
    } catch (error) {
      console.error('Error generating ID card:', error);
      toast.error('فشل في تحميل الكارنيه');
      setIsDownloadingCard(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-lg">
              <ArrowRight className="w-6 h-6" />
            </button>
            <h2 className="text-xl">ملف الخادم</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!servant) return null;

  return (
    <div className="min-h-screen bg-background pb-8" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <h2 className="text-xl">ملف الخادم</h2>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-xl bg-primary/10 flex items-center justify-center">
            {servant.photo_url ? (
              <img src={servant.photo_url} alt={servant.full_name} className="w-full h-full object-cover" />
            ) : servant.role === 'supervisor' || servant.role === 'admin' || servant.role === 'developer' ? (
              <Crown className="w-12 h-12" style={{ color: 'var(--secondary)' }} />
            ) : (
              <User className="w-12 h-12 text-primary" />
            )}
          </div>
          <h3 className="text-xl mb-1 text-primary">{servant.full_name}</h3>
          <p className="text-sm text-muted-foreground mb-4">كود الدخول: <span className="font-bold text-red-500" dir="ltr">{servant.teacher_id}</span></p>

          <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-lg" style={{ color: 'var(--secondary)' }}>
            <span className="text-sm font-medium">
              {roleLabels[servant.role || 'normal']} 
              {servant.role !== 'admin' && servant.role !== 'developer' && servant.class_stage ? ` - ${servingStages[servant.class_stage] || servant.class_stage}` : ''}
            </span>
          </div>
        </div>

        {/* ID Card Preview */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="mb-4 text-center text-primary font-bold">بطاقة الهوية</h3>
          <div className="flex justify-center">
            <div className="transform scale-75 origin-top">
              <IDCard servant={servant} />
            </div>
          </div>
        </div>

        {/* Action buttons under ID card: Download ID card and Download QR */}
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

        {/* Attendance Details Section */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold">
              <Calendar className="w-5 h-5" />
              تفاصيل الحضور
            </span>
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              {attendanceLogs.length} حضور
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-muted/20 rounded-xl border border-border text-center">
              <div className="text-xs text-muted-foreground mb-1">حضور الحصص</div>
              <div className="text-xl font-bold text-primary">
                {attendanceLogs.filter(l => l.meeting_type === 'class').length}
              </div>
            </div>
            <div className="p-3 bg-muted/20 rounded-xl border border-border text-center">
              <div className="text-xs text-muted-foreground mb-1">اجتماعات الخدمة</div>
              <div className="text-xl font-bold" style={{ color: 'var(--secondary)' }}>
                {attendanceLogs.filter(l => l.meeting_type === 'service_meeting').length}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm text-muted-foreground mb-1">سجل الحضور:</h4>
            {attendanceLogs && attendanceLogs.length > 0 ? (
              attendanceLogs.map((log) => {
                const meetingTypeLabel = log.meeting_type === 'class' ? 'حصة' : 'اجتماع خدمة';
                const dateFormatted = log.attendance_date || (log.scanned_at ? String(log.scanned_at).split('T')[0] : '');

                return (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground block" dir="ltr">{dateFormatted}</span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          log.meeting_type === 'class' ? 'bg-primary/10 text-primary' : 'bg-secondary/20 text-amber-800'
                        }`}>
                          {meetingTypeLabel}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button (Only for Admin/Supervisor/Developer) */}
                    {canDeleteAttendance && (
                      <button
                        onClick={() => handleDeleteAttendance(log.id, dateFormatted)}
                        disabled={isDeletingLogId === log.id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="حذف سجل الحضور"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                لم يتم تسجيل أي حضور حتى الآن
              </div>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary flex items-center gap-2 font-bold">
            <Info className="w-5 h-5" />
            البيانات الشخصية والكنسية
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">النوع</div>
                <div className="font-medium">{servant.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
              </div>
            </div>

            {servant.birth_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">تاريخ الميلاد</div>
                  <div className="font-medium">
                    {new Date(servant.birth_date).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            )}

            {servant.father_of_confession && (
              <div className="flex items-start gap-3 pt-2 border-t border-border">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">أب الإعتراف</div>
                  <div className="font-medium">{servant.father_of_confession}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Education Information */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary flex items-center gap-2 font-bold">
            <Book className="w-5 h-5" />
            البيانات التعليمية / العملية
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Book className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">المرحلة الدراسية الشخصية</div>
                <div className="font-medium">{educationStages[servant.educational_stage] || servant.educational_stage || 'غير محدد'}</div>
              </div>
            </div>

            {servant.academic_year && (
              <div className="flex items-start gap-3">
                <Book className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">السنة الدراسية</div>
                  <div className="font-medium">{servant.academic_year}</div>
                </div>
              </div>
            )}

            {servant.class_or_job && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">
                    {servant.educational_stage === 'graduate' ? 'الوظيفة / مكان العمل' : 'الجامعة / المدرسة'}
                  </div>
                  <div className="font-medium">{servant.class_or_job}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary flex items-center gap-2 font-bold">
            <Phone className="w-5 h-5" />
            بيانات التواصل
          </h3>
          <div className="space-y-3">
            {servant.mobile_personal && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">رقم الموبايل</div>
                  <div className="flex items-center gap-2 justify-end" dir="ltr">
                    <a 
                      href={`https://wa.me/2${servant.mobile_personal}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                      title="مراسلة عبر واتساب"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                    </a>
                    <a href={`tel:${servant.mobile_personal}`} className="font-medium text-primary hover:underline">
                      {servant.mobile_personal}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {(servant.address_area || servant.address_details) && (
              <div className="flex items-start gap-3 pt-2 border-t border-border">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">العنوان</div>
                  <div className="font-medium">
                    {servant.address_area} {servant.address_area && servant.address_details ? ' - ' : ''} {servant.address_details}
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
          }}
        >
          <IDCard servant={servant} />
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
          <QRCodeSVG value={String(servant.teacher_id)} size={600} includeMargin={true} />
        </div>
      </div>
    </div>
  );
}