import { QRCodeSVG } from 'qrcode.react';
import churchLogo from '../../imports/new-church-logo.png';
import festivalLogo from '../../imports/Arebsalin-1.png';

interface IDCardProps {
  student: {
    id: string;
    name: string;
    data: {
      educationStage: string;
      educationYear: string;
      gender: 'male' | 'female' | '';
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
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  const getGradientStyle = (gender: string) => {
    if (gender === 'male') {
      return { background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }; // Blue
    } else if (gender === 'female') {
      return { background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)' }; // Pink
    }
    return { background: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)' }; // Purple
  };

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
        <img src={churchLogo} alt="Church Logo" className="absolute top-3 right-3 w-14 h-14 object-contain" />

        {/* Festival Logo - Center */}
        <img src={festivalLogo} alt="Festival Logo" className="absolute top-3 left-1/2 transform -translate-x-1/2 h-14 object-contain" />
      </div>

      {/* Profile Picture Circle - Overlapping */}
      <div className="flex justify-center" style={{ marginTop: '-50px' }}>
        <div className="relative">
          {/* Profile Picture Placeholder */}
          <div
            className="w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-xl"
            style={{
              ...getGradientStyle(student.data.gender),
              border: '4px solid #ffffff'
            }}
          >
            <span className="text-4xl font-bold" style={{ color: '#ffffff' }}>
              {getInitials(student.name)}
            </span>
          </div>

          {/* ID Badge */}
          <div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md"
            style={{ border: '2px solid rgba(139, 21, 56, 0.2)' }}
          >
            <span className="text-xs font-medium" style={{ color: '#8B1538' }}>{student.id}</span>
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
              value={student.id}
              size={140}
              level="H"
              includeMargin={false}
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