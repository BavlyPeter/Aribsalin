import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Save } from 'lucide-react';
import { TeacherData } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const churchLogo = new URL('../assets/images/new-church-logo.png', import.meta.url).href;
const festivalLogo = new URL('../assets/images/Arebsalin-1.png', import.meta.url).href;

interface SignupPageProps {
  onSignup: (data: TeacherData) => void;
  onBack: () => void;
}

const educationStages = {
  'secondary': 'ثانوي',
  'university': 'جامعي',
  'graduate': 'خريجين'
};

const servingStages = {
  'kg': 'حضانة',
  'primary_12': 'ابتدائي (الأول والثاني)',
  'primary_34': 'ابتدائي (الثالث والرابع)',
  'primary_56': 'ابتدائي (الخامس والسادس)',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university_graduate': 'جامعي وخريجين'
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
  const [showPassword, setShowPassword] = useState(false);
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
    teacherId: '',
    password: '',
    role: '',
    classStage: '',
    mobile: '',
    area: '',
    address: '',
    dateOfBirth: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const generateSmartId = async (role: string, stage: string) => {
    let prefix = '';
    let sliceIndex = 0;

    if (role === 'admin') {
      prefix = 'A';
      sliceIndex = 1;
    } else {
      const roleChar = role === 'supervisor' ? 'S' : 'N';

      let stageChars = 'X0';
      if (stage === 'kg') stageChars = 'K0';
      else if (stage === 'primary_12') stageChars = 'P1';
      else if (stage === 'primary_34') stageChars = 'P3';
      else if (stage === 'primary_56') stageChars = 'P5';
      else if (stage === 'preparatory') stageChars = 'Y0';
      else if (stage === 'secondary') stageChars = 'S0';
      else if (stage === 'university_graduate') stageChars = 'G0';

      prefix = `${roleChar}${stageChars}`;
      sliceIndex = 3;
    }

    const { data, error } = await supabase
      .from('servants')
      .select('teacher_id')
      .ilike('teacher_id', `${prefix}%`);

    if (error) throw error;

    let nextNum = 1;
    if (data && data.length > 0) {
      const existingNums = data
        .map(d => parseInt(d.teacher_id.slice(sliceIndex)))
        .filter(n => !isNaN(n));
      if (existingNums.length > 0) {
        nextNum = Math.max(...existingNums) + 1;
      }
    }

    return `${prefix}${String(nextNum).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const phoneRegex = /^[0-9]{11}$/;
      const phonesToCheck = [formData.mobile].filter(Boolean);

      for (const phone of phonesToCheck) {
        if (!phoneRegex.test(phone)) {
          toast.error('رقم الهاتف يجب أن يتكون من 11 رقم');
          setIsLoading(false);
          return;
        }
      }

      const generatedTeacherId = await generateSmartId(formData.role, formData.classStage);
      const email = `${generatedTeacherId.toLowerCase()}@aribsalin.com`;

      let formattedClassOrJob = formData.studyOrWorkPlace || null;
      if (formData.educationStage === 'university' || formData.educationStage === 'جامعي') {
        const uni = formData.universityName?.trim();
        const col = formData.collegeName?.trim();
        if (uni && col) {
          formattedClassOrJob = `${uni} - ${col}`;
        } else if (uni || col) {
          formattedClassOrJob = uni || col || null;
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: dbError } = await supabase.from('servants').insert([{
          id: authData.user.id,
          teacher_id: generatedTeacherId,
          full_name: formData.fullName,
          gender: formData.gender,
          educational_stage: formData.educationStage,
          academic_year: formData.educationYear,
          class_or_job: formattedClassOrJob,
          birth_date: formData.dateOfBirth || null,
          father_of_confession: formData.confessionFather,
          mobile_personal: formData.mobile,
          address_area: formData.area,
          address_details: formData.address,
          role: formData.role,
          class_stage: formData.role === 'admin' ? null : formData.classStage
        }]);

        if (dbError) throw dbError;

        toast.success(`تم إنشاء الحساب بنجاح! رقم الدخول الخاص بك هو: ${generatedTeacherId}`, {
          duration: 15000,
          description: 'يرجى الاحتفاظ بهذا الرقم لتسجيل الدخول لاحقاً'
        });

        onSignup({ ...formData, teacherId: generatedTeacherId });
      }
    } catch (error: any) {
      console.error(error);
      toast.error('حدث خطأ أثناء التسجيل: ' + error.message);
    } finally {
      setIsLoading(false);
    }
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
      return 'المدرسة';
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
              <label className="block mb-2 text-sm text-foreground">أب الإعتراف</label>
              <input
                type="text"
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
                  <label className="block mb-2 text-sm text-foreground">اسم الجامعة</label>
                  <input
                    type="text"
                    value={formData.universityName || ''}
                    onChange={(e) => updateField('universityName', e.target.value)}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="مثال: جامعة القاهرة"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-foreground">الكلية</label>
                  <input
                    type="text"
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
                maxLength={11}
                value={formData.mobile}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, '');
                  updateField('mobile', onlyNumbers);
                }}
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
              <label className="block mb-2 text-sm text-foreground">العنوان بالتفصيل</label>
              <textarea
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                placeholder="المدينة، الحي، الشارع، رقم المنزل"
              />
            </div>
          </div>
        </div>

        {/* Auth & Role Card */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">بيانات الدخول والصلاحية</h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-foreground">كلمة المرور *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="كلمة المرور (يجب ان تكون اكثر من 4 حروف او ارقام)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm text-foreground">دور الخادم *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">اختر الدور</option>
                <option value="normal">خادم</option>
                <option value="supervisor">أمين فصل</option>
                <option value="admin">أمين الخدمة</option>
              </select>
            </div>

            {formData.role !== 'admin' && (
              <div>
                <label className="block mb-2 text-sm text-foreground">فصل الخدمة (المرحلة التي تخدم بها) *</label>
                <select
                  required
                  value={formData.classStage}
                  onChange={(e) => updateField('classStage', e.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">اختر المرحلة</option>
                  {Object.entries(servingStages).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleSubmit}
          className="w-full bg-primary text-primary-foreground rounded-xl py-4 shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <Save className="w-5 h-5" />
          <span className="text-lg">{isLoading ? 'جاري الحفظ...' : 'حفظ البيانات'}</span>
        </button>
      </div>
    </div>
  );
}
