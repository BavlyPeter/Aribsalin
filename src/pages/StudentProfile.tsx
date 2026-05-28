import { ArrowRight, Calendar, Phone, MapPin, Book, Award, CheckCircle2, User, School, Download, CreditCard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { StudentData } from '../types';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { IDCard } from '../components/shared/IDCard';

interface StudentProfileProps {
  student: {
    id: string;
    name: string;
    points: number;
    attended: boolean;
    data: StudentData;
    attendanceDays: string[];
  };
  participants?: Array<{
    id: string;
    name: string;
    points: number;
    attended: boolean;
    data: StudentData;
    attendanceDays: string[];
  }>;
  totalDays: number;
  onBack: () => void;
}

export function StudentProfile({ student, totalDays, onBack }: StudentProfileProps) {
  const attendancePercentage = totalDays > 0 ? Math.round((student.attendanceDays.length / totalDays) * 100) : 0;
  const qrRef = useRef<HTMLDivElement>(null);
  const idCardRef = useRef<HTMLDivElement>(null);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
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

      const canvas = await html2canvas(idCardRef.current, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          setIsDownloadingCard(false);
          return;
        }
        const link = document.createElement('a');
        link.download = `IDCard_${student.id}_${student.name}.png`;
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
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
          <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl mb-1 text-primary">{student.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">رقم المشارك: {student.id}</p>

          {/* Status Badge */}
          {student.attended && (
            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-700 px-4 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">حاضر اليوم</span>
            </div>
          )}
        </div>

        {/* QR Code Card */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="mb-4 text-center text-primary">كود QR الخاص بالمشارك</h3>
          <div ref={qrRef} className="bg-white p-6 rounded-xl mx-auto w-fit">
            <QRCodeSVG value={student.id} size={200} />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4 mb-4">
            استخدم هذا الكود لتسجيل الحضور أو خصم النقاط
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadQRCode}
              className="bg-secondary text-secondary-foreground rounded-xl py-3 shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>تحميل QR</span>
            </button>
            <button
              onClick={downloadIDCard}
              disabled={isDownloadingCard}
              className="bg-primary text-primary-foreground rounded-xl py-3 shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5" />
              <span>{isDownloadingCard ? 'جاري التحميل...' : 'تحميل الكارت'}</span>
            </button>
          </div>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border text-center">
            <div className="w-12 h-12 bg-secondary/20 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Award className="w-6 h-6" style={{ color: 'var(--secondary)' }} />
            </div>
            <div className="text-2xl mb-1" style={{ color: 'var(--primary)' }}>{student.points}</div>
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
              <span className="font-medium">{student.attendanceDays.length} يوم</span>
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

          {student.attendanceDays.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm text-muted-foreground mb-3">أيام الحضور:</h4>
              <div className="flex flex-wrap gap-2">
                {student.attendanceDays.map((day, index) => (
                  <div
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm"
                  >
                    {new Date(day).toLocaleDateString('ar-EG', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Personal Information */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">البيانات الشخصية</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">تاريخ الميلاد</div>
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
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">النوع</div>
                <div className="font-medium">{student.data.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Book className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">أب الإعتراف</div>
                <div className="font-medium">{student.data.confessionFather}</div>
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
                <div className="font-medium">{student.data.educationStage}</div>
              </div>
            </div>

            {student.data.educationYear && (
              <div className="flex items-start gap-3">
                <Book className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">السنة الدراسية</div>
                  <div className="font-medium">{student.data.educationYear}</div>
                </div>
              </div>
            )}

            {student.data.educationStage === 'university' && (student.data.universityName || student.data.collegeName) && (
              <>
                {student.data.universityName && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">الجامعة</div>
                      <div className="font-medium">{student.data.universityName}</div>
                    </div>
                  </div>
                )}

                {student.data.collegeName && (
                  <div className="flex items-start gap-3">
                    <School className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">الكلية</div>
                      <div className="font-medium">{student.data.collegeName}</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {student.data.educationStage !== 'university' && student.data.studyOrWorkPlace && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">
                    {student.data.educationStage === 'graduate' ? 'مكان العمل' : 'المدرسة'}
                  </div>
                  <div className="font-medium">{student.data.studyOrWorkPlace}</div>
                </div>
              </div>
            )}

            {student.data.jobTitle && (
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">الوظيفة</div>
                  <div className="font-medium">{student.data.jobTitle}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">بيانات التواصل</h3>
          <div className="space-y-3">
            {student.data.personalMobile && (
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

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">موبايل الأب</div>
                <a href={`tel:${student.data.fatherMobile}`} className="font-medium text-primary">
                  {student.data.fatherMobile}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">موبايل الأم</div>
                <a href={`tel:${student.data.motherMobile}`} className="font-medium text-primary">
                  {student.data.motherMobile}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-border">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">العنوان</div>
                <div className="font-medium">{student.data.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden ID Card for Download */}
        <div
          ref={idCardRef}
          style={{
            position: 'fixed',
            left: '-9999px',
            top: '-9999px',
            opacity: isDownloadingCard ? 1 : 0,
            pointerEvents: 'none'
          }}
        >
          <IDCard student={student} />
        </div>
      </div>
    </div>
  );
}
