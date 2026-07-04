import { QRCodeSVG } from 'qrcode.react';
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

        {/* Festival Logo - Center */}
        <img src={festivalLogo} alt="Festival Logo" className="absolute top-3 left-1/2 transform -translate-x-1/2 h-14 object-contain" />
      </div>

      {/* Content Wrapper */}
      <div className="relative p-4 flex flex-col flex-1 z-10">
        
        {/* Core Information Boxes */}
        <div className="flex flex-col space-y-4 mt-2 mb-4">
          
          {/* Box 1: Participant Name */}
          <div
            className="rounded-xl px-4 shadow-sm flex items-center justify-center text-center"
            style={{
              backgroundColor: 'rgba(139, 21, 56, 0.03)',
              border: '1px solid rgba(139, 21, 56, 0.25)',
              // height: '80px'
            }}
          >
            <div 
              className="text-2xl font-black" 
              style={{ color: '#8B1538', lineHeight: '1.2' }} 
              dir="rtl"
            >
              {student.name}
              {/* bavly peter barsoum kamel sefen */}
              {/* بافلي بيتر برسوم كامل سيفن */}
              
              
              <br/>
              <br/>

            </div>
          </div>

          {/* Box 2: Education Stage & Year */}
          <div
            className="rounded-xl px-4 shadow-sm flex flex-col justify-center items-center text-center"
            style={{
              backgroundColor: 'rgba(201, 169, 97, 0.08)',
              border: '2.5px solid rgba(201, 169, 97, 0.35)',
              // height: '70px'
            }}
          >
            <div 
              className="text-sm font-bold" 
              style={{ color: '#6B5744', lineHeight: '1.2' }}
            >
              {educationStageLabels[student.data.educationStage] || student.data.educationStage}
            </div>

            {student.data.educationYear && (
              <div 
                className="text-lg font-bold mt-0.5" 
                style={{ color: '#8B1538', lineHeight: '1.2' }} 
                dir="rtl"
              >
                {student.data.educationYear}
              </div>
            )}

            <br/>
          </div>

          {/* Box 3: Participant ID */}
          <div
          //   flex-col 
            
            className="w-fit mx-auto rounded-full px-4 py-0 shadow-sm flex items-center justify-center text-center"
            style={{
              backgroundColor: 'rgba(201, 169, 97, 0.08)',
              border: '2px solid rgba(139, 21, 56, 0.25)',
              // height: '46px'
            }}
          >
            <div 
              className="text-2xl font-black tracking-widest" 
              style={{ color: '#C9A961', lineHeight: '1.1' }} 
              dir="ltr"
            >
              {participantSmartId}

              <br/>
              <br/>
            </div>
          </div>

        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center mt-auto pb-2">
          <div
            className="bg-white p-2 rounded-2xl shadow-md"
            style={{ border: '2px solid rgba(139, 21, 56, 0.2)' }}
          >
            <QRCodeSVG
              value={String(participantSmartId)}
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