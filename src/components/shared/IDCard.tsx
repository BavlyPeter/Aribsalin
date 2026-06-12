import { QRCodeSVG } from 'qrcode.react';
import { User } from 'lucide-react';
import churchLogo from '../../assets/images/new-church-logo.png';
import festivalLogo from '../../assets/images/Arebsalin-1.png';
import { StudentData } from '../../types';

interface IDCardProps {
  student: {
    id: string;
    participant_id?: string | number;
    name: string;
    data: {
      educationStage: StudentData['educationStage'];
      educationYear: StudentData['educationYear'];
      gender: StudentData['gender'];
      photo_url?: StudentData['photo_url'];
    };
  };
}

const educationStageLabels: Record<string, string> = {
  'kg': 'حضانة',
  'primary': 'ابتدائي',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university': 'جامعي',
  'graduate': 'خريجين'
};

export function IDCard({ student }: IDCardProps) {
  const participantSmartId = student.participant_id || student.id;
  const photoUrl = (student as any).photo_url || student.data?.photo_url || '';

  return (
    <div
      id="id-card"
      className="w-[350px] h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden relative"
      style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}
    >
      {/* Header with Logos and Background */}
      <div
        className="h-[140px] relative"
        style={{ background: 'linear-gradient(135deg, #8B1538 0%, #C9A961 100%)' }}
      >
        {/* Church Logo - Upper Right */}
        <img src={churchLogo} alt="Church Logo" className="absolute top-3 right-2 w-21 h-14 object-contain" />

        {/* Festival Logo - Center */}
        <img src={festivalLogo} alt="Festival Logo" className="absolute top-3 left-1/2 transform -translate-x-1/2 h-14 object-contain" />
      </div>

      {/* Profile Picture Circle - Overlapping */}
      <div className="flex justify-center" style={{ marginTop: '-50px' }}>
        <div className="relative">
          {/* Profile Image or Fallback User Icon */}
          <div
            className="w-[120px] h-[120px] rounded-full overflow-hidden shadow-xl flex items-center justify-center bg-white"
            style={{
              border: '4px solid #ffffff'
            }}
          >
            {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={student.name}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              ) : (
                // SVG عادي بدون استخدام أي مكتبات أو ألوان oklch
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#9ca3af" /* لون رمادي صريح */
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-16 h-16"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
            )}
          </div>

          {/* ID Badge */}
          <div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md"
            style={{ border: '2px solid rgba(139, 21, 56, 0.2)' }}
          >
            <span className="text-xs font-medium" style={{ color: '#8B1538' }}>{participantSmartId}</span>
          </div>
        </div>
      </div>

      {/* Student Information */}
      <div className="px-6 mt-8 text-center">
        {/* Name */}
        <h2 className="text-xl font-bold mb-1" style={{ color: '#8B1538' }} dir="rtl">
          {student.name}
        </h2>

        {/* Class Information */}
        <div
          className="rounded-lg px-4 py-3 mb-4"
          style={{
            backgroundColor: 'rgba(201, 169, 97, 0.1)',
            border: '1px solid rgba(201, 169, 97, 0.2)'
          }}
        >
          <div className="text-xs mb-1" style={{ color: '#6B5744' }}>المرحلة الدراسية</div>
          <div className="text-base font-medium" style={{ color: '#C9A961' }} dir="rtl">
            {educationStageLabels[student.data.educationStage]}
            {student.data.educationYear && ` - ${student.data.educationYear}`}
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-3">
          <div
            className="bg-white p-3 rounded-xl shadow-md"
            style={{ border: '2px solid rgba(139, 21, 56, 0.2)' }}
          >
            <QRCodeSVG
              value={String(participantSmartId)}
              size={140}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        {/* QR Code Label */}
        <div className="text-xs" style={{ color: '#6B5744' }}>
          امسح الكود للحضور والنقاط
        </div>
      </div>

      {/* Footer Decoration */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2"
        style={{ background: 'linear-gradient(90deg, #8B1538 0%, #C9A961 50%, #8B1538 100%)' }}
      ></div>
    </div>
  );
}