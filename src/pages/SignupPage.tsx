import { useState } from 'react';
import { ArrowRight, Save } from 'lucide-react';
import churchLogo from '../assets/images/new-church-logo.png';
import festivalLogo from '../assets/images/Arebsalin-1.png';
import { TeacherData } from '../types';

interface SignupPageProps {
  onSignup: (data: TeacherData) => void;
  onBack: () => void;
}

const educationStages = {
  'secondary': 'ثانوي',
  'university': 'جامعي',
  'graduate': 'خريجين'
};

const educationYears = {
  'secondary': [
    'الصف الأول الثانوي',
    'الصف الثاني الثانوي',
    'الصف الثالث الثانوي'
  ],
  'university': [
    'الفرقة الأولى',
    'الفرقة الثانية',
    'الفرقة الثالثة',
    'الفرقة الرابعة',
    'الفرقة الخامسة',
    'الفرقة السادسة',
    'الفرقة السابعة'
  ]
};

const ASWAN_AREAS = ['السيل', 'كيما', 'الصداقة', 'المحمودية', 'أطلس', 'العقاد', 'الكورنيش', 'الكرور', 'الشيخ هارون', 'أخرى'];

export function SignupPage({ onSignup, onBack }: SignupPageProps) {
  const [formData, setFormData] = useState<TeacherData>({
    fullName: '',
    gender: '',
    educationStage: '',
    educationYear: '',
    studyOrWorkPlace: '',
    universityName: '',
    collegeName: '',
    jobTitle: '',
    confessionFather: '',
    mobile: '',
    area: '',
    address: '',
    dateOfBirth: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(formData);
  };

  const updateField = (field: keyof TeacherData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Reset dependent fields when education stage changes
      if (field === 'educationStage') {
        newData.educationYear = '';
        newData.studyOrWorkPlace = '';
        newData.universityName = '';
        newData.collegeName = '';
        newData.jobTitle = '';
      }

      return newData;
    });
  };

  const getPlaceholderForStudyPlace = () => {
    if (!formData.educationStage) return '';

    if (formData.educationStage === 'secondary') {
      return 'اسم المدرسة';
    } else if (formData.educationStage === 'graduate') {
      return 'مكان العمل (اختياري)';
    }
    return '';
  };

  const getStudyPlaceLabel = () => {
    if (!formData.educationStage) return '';

    if (formData.educationStage === 'secondary') {
      return 'المدرسة *';
    } else if (formData.educationStage === 'graduate') {
      return 'مكان العمل';
    }
    return '';
  };

  const isStudyPlaceRequired = () => {
    return formData.educationStage === 'secondary';
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
          <h2 className="text-xl">تسجيل خادم جديد</h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-24">
        {/* Basic Information Card */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">البيانات الأساسية</h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-foreground">الإسم رباعي *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="أدخل الإسم الكامل"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-foreground">النوع *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField('gender', 'male')}
                  className={`py-3 rounded-lg border-2 transition-all ${
                    formData.gender === 'male'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-input-background'
                  }`}
                >
                  ذكر
                </button>
                <button
                  type="button"
                  onClick={() => updateField('gender', 'female')}
                  className={`py-3 rounded-lg border-2 transition-all ${
                    formData.gender === 'female'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-input-background'
                  }`}
                >
                  أنثى
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm text-foreground">تاريخ الميلاد *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-foreground">أب الإعتراف *</label>
              <input
                type="text"
                required
                value={formData.confessionFather}
                onChange={(e) => updateField('confessionFather', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="اسم الأب الكاهن"
              />
            </div>
          </div>
        </div>

        {/* Education Information Card */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">البيانات التعليمية</h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-foreground">المرحلة الدراسية *</label>
              <select
                required
                value={formData.educationStage}
                onChange={(e) => updateField('educationStage', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">اختر المرحلة</option>
                {Object.entries(educationStages).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            {formData.educationStage && formData.educationStage !== 'graduate' && (
              <div>
                <label className="block mb-2 text-sm text-foreground">السنة الدراسية *</label>
                <select
                  required
                  value={formData.educationYear}
                  onChange={(e) => updateField('educationYear', e.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">اختر السنة</option>
                  {educationYears[formData.educationStage as keyof typeof educationYears]?.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.educationStage && formData.educationStage === 'graduate' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-foreground">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={formData.jobTitle || ''}
                    onChange={(e) => updateField('jobTitle', e.target.value)}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="مثال: مهندس، طبيب، معلم"
                  />
                  <p className="text-xs text-muted-foreground mt-1">اختياري</p>
                </div>
              </div>
            )}

            {formData.educationStage && formData.educationStage === 'university' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-foreground">اسم الجامعة *</label>
                  <input
                    type="text"
                    required
                    value={formData.universityName || ''}
                    onChange={(e) => updateField('universityName', e.target.value)}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="مثال: جامعة القاهرة"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-foreground">الكلية *</label>
                  <input
                    type="text"
                    required
                    value={formData.collegeName || ''}
                    onChange={(e) => updateField('collegeName', e.target.value)}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="مثال: كلية الهندسة"
                  />
                </div>
              </div>
            )}

            {formData.educationStage && formData.educationStage === 'secondary' && (
              <div>
                <label className="block mb-2 text-sm text-foreground">
                  {getStudyPlaceLabel()}
                </label>
                <input
                  type="text"
                  required={isStudyPlaceRequired()}
                  value={formData.studyOrWorkPlace}
                  onChange={(e) => updateField('studyOrWorkPlace', e.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={getPlaceholderForStudyPlace()}
                />
              </div>
            )}

            {formData.educationStage && formData.educationStage === 'graduate' && (
              <div>
                <label className="block mb-2 text-sm text-foreground">مكان العمل</label>
                <input
                  type="text"
                  value={formData.studyOrWorkPlace}
                  onChange={(e) => updateField('studyOrWorkPlace', e.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="اسم الشركة أو مكان العمل"
                />
                <p className="text-xs text-muted-foreground mt-1">اختياري</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">أرقام التواصل</h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-foreground">رقم الموبايل *</label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => updateField('mobile', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">العنوان</h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-foreground">المنطقة *</label>
              <select
                required
                value={formData.area}
                onChange={(e) => updateField('area', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">اختر المنطقة</option>
                {ASWAN_AREAS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm text-foreground">العنوان بالتفصيل *</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                placeholder="المدينة، الحي، الشارع، رقم المنزل"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <button
          onClick={handleSubmit}
          className="w-full bg-primary text-primary-foreground rounded-xl py-4 shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span className="text-lg">حفظ البيانات</span>
        </button>
      </div>
    </div>
  );
}
