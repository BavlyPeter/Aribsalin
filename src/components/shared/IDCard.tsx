import { QRCodeSVG } from 'qrcode.react';
import churchLogo from '../../assets/images/church logo.png';
import serviceLogo from '../../assets/images/service logo.png';

interface IDCardProps {
  student?: any;
  servant?: any;
  data?: any;
}

const roleLabels: Record<string, string> = {
  'normal': 'خادم',
  'supervisor': 'أمين فصل',
  'admin': 'أمين الخدمة',
  'developer': 'مطور النظام'
};

const stageLabelsMap: Record<string, string> = {
  'kg': 'حضانة',
  'primary_12': 'ابتدائي (الأول والثاني)',
  'primary_34': 'ابتدائي (الثالث والرابع)',
  'primary_56': 'ابتدائي (الخامس والسادس)',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university_graduate': 'جامعي وخريجين',
  'university': 'جامعي',
  'graduate': 'خريجين',
  'primary': 'ابتدائي',
  'supervisors': 'الخدام والمشرفين'
};

const educationStageLabels: Record<string, string> = {
  'kg': 'حضانة',
  'primary': 'ابتدائي',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university': 'جامعي',
  'graduate': 'خريجين'
};

export function IDCard({ student, servant, data }: IDCardProps) {
  const target = servant || student || data;
  if (!target) return null;

  // Check if the passed object has a teacher_id. If so, treat it as a Servant. If it has a participant_id, treat it as a Student.
  const hasTeacherId = Boolean(target.teacher_id || target.data?.teacher_id);
  const hasParticipantId = Boolean(target.participant_id || target.data?.participant_id);
  const isServant = hasTeacherId || (!hasParticipantId && (target.role !== undefined || target.class_stage !== undefined));

  const smartId = isServant
    ? String(target.teacher_id || target.data?.teacher_id || target.id || '')
    : String(target.participant_id || target.data?.participant_id || target.id || '');

  const displayName = target.name || target.full_name || target.data?.fullName || '';

  let subtitleLine1 = '';
  let subtitleLine2 = '';

  if (isServant) {
    const rawRole = target.role || target.data?.role || '';
    const roleText = roleLabels[rawRole] || rawRole || 'خادم';

    const rawStage = target.class_stage || target.classStage || target.data?.class_stage || target.data?.classStage || '';
    const stageText = stageLabelsMap[rawStage] || rawStage || '';

    // e.g. "أمين فصل - ابتدائي"
    subtitleLine1 = [roleText, stageText].filter(Boolean).join(' - ');
  } else {
    const rawStage = target.data?.educationStage || target.educationStage || target.educational_stage || '';
    subtitleLine1 = educationStageLabels[rawStage] || stageLabelsMap[rawStage] || rawStage || '';
    subtitleLine2 = target.data?.educationYear || target.educationYear || target.academic_year || '';
  }

  return (
    <div
      id="id-card"
      className="w-[350px] h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden relative flex flex-col shrink-0"
      style={{ 
        border: '1.7px solid #8B1538', 
        fontFamily: 'Tajawal, Cairo, sans-serif', 
        display: 'flex'
      }}
    >
      {/* Header */}
      <div
        className="h-[100px] relative shrink-0"
        style={{ background: 'linear-gradient(135deg, #8B1538 0%, #C9A961 100%)' }}
      >
        {/* Church Logo - Upper Right */}
        <img src={churchLogo} alt="Church Logo" className="absolute top-3 right-2 w-21 h-14 object-contain" />

        {/* service Logo - Center */}
        <img src={serviceLogo} alt="service Logo" className="absolute top-3 left-1/2 transform -translate-x-1/2 h-14 object-contain" />
      </div>

      {/* Content Wrapper */}
      <div className="relative p-4 flex flex-col flex-1 z-10">
        
        {/* Core Information Boxes */}
        <div className="flex flex-col space-y-3 mt-2 mb-3">
          
          {/* Box 1: Name */}
          <div
            className="rounded-xl px-4 py-2.5 shadow-sm flex items-center justify-center text-center min-h-[58px]"
            style={{
              backgroundColor: 'rgba(139, 21, 56, 0.03)',
              border: '1px solid rgba(139, 21, 56, 0.25)',
            }}
          >
            <div 
              className="text-xl font-black" 
              style={{ color: '#8B1538', lineHeight: '1.2' }} 
              dir="rtl"
            >
              {displayName}
            </div>
          </div>

          {/* Box 2: Stage / Role */}
          <div
            className="rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center items-center text-center min-h-[56px]"
            style={{
              backgroundColor: 'rgba(201, 169, 97, 0.08)',
              border: '2.5px solid rgba(201, 169, 97, 0.35)',
            }}
          >
            <div 
              className="text-base font-bold" 
              style={{ color: '#6B5744', lineHeight: '1.2' }}
              dir="rtl"
            >
              {subtitleLine1}
            </div>

            {subtitleLine2 && (
              <div 
                className="text-sm font-bold mt-0.5" 
                style={{ color: '#8B1538', lineHeight: '1.2' }} 
                dir="rtl"
              >
                {subtitleLine2}
              </div>
            )}
          </div>

          {/* Box 3: Smart ID (Participant ID / Servant ID) */}
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-bold mb-1" style={{ color: '#8B1538' }}>
              {isServant ? 'كود الخادم' : 'رقم المشارك'}
            </span>
            <div 
              className="w-fit mx-auto rounded-full px-5 py-0.5 shadow-sm flex items-center justify-center text-center"
              style={{
                backgroundColor: 'rgba(201, 169, 97, 0.08)',
                border: '2px solid rgba(139, 21, 56, 0.25)',
              }}
            >
              <div 
                className="text-2xl font-black tracking-widest" 
                style={{ color: '#C9A961', lineHeight: '1.1' }} 
                dir="ltr"
              >
                {smartId}
              </div>
            </div>
          </div>

        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center mt-auto pb-1">
          <div
            className="bg-white p-2 rounded-2xl shadow-md"
            style={{ border: '2px solid rgba(139, 21, 56, 0.2)' }}
          >
            <QRCodeSVG
              value={smartId}
              size={130}
              level="H"
              includeMargin={true}
            />
          </div>
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