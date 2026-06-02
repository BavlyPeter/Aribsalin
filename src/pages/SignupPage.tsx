import { useState, useEffect } from 'react';
import { ArrowRight, Eye, EyeOff, Save } from 'lucide-react';
import { TeacherData } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import churchLogo from '../assets/images/new-church-logo.png';
import festivalLogo from '../assets/images/Arebsalin-1.png';

interface SignupPageProps {
  onSignup: (data: TeacherData) => void;
  onBack: () => void;
}

interface SignupPageWithEditProps extends SignupPageProps {
  editData?: any | null;
  clearEdit?: () => void;
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

export function SignupPage({ onSignup, onBack, editData, clearEdit }: SignupPageWithEditProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
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

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const { data, error } = await supabase.from('areas').select('name').order('name');
        if (!error && data) {
          setAreas(data.map(a => a.name));
        }
      } catch (err) {
        console.error('Error fetching areas:', err);
      }
    };
    fetchAreas();
  }, []);

  // Fetch full data for editing from Supabase to ensure all fields populate
  useEffect(() => {
    const fetchFullServantData = async () => {
      if (!editData || !editData.id) return;

      try {
        setIsLoading(true);
        // Regex to check if the ID is a valid UUID or a Smart ID like T01
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editData.id);

        let query = supabase.from('servants').select('*');
        if (isUuid) {
          query = query.eq('id', editData.id);
        } else {
          query = query.eq('teacher_id', editData.id);
        }

        const { data: source, error } = await query.single();

        if (error) throw error;

        if (source) {
          setFormData({
            role: source.role || '',
            classStage: source.class_stage || '',
            fullName: source.full_name || '',
            gender: source.gender || '',
            educationStage: source.educational_stage || '',
            educationYear: source.academic_year || '',
            studyOrWorkPlace: source.educational_stage === 'graduate' ? (source.class_or_job || '') : (source.class_or_job && !source.class_or_job.includes(' - ') ? source.class_or_job : ''),
            universityName: source.educational_stage === 'university' && source.class_or_job?.includes(' - ') ? source.class_or_job.split(' - ')[0] : '',
            collegeName: source.educational_stage === 'university' && source.class_or_job?.includes(' - ') ? source.class_or_job.split(' - ')[1] : (source.educational_stage === 'university' ? source.class_or_job || '' : ''),
            jobTitle: source.job_title || '',
            confessionFather: source.father_of_confession || '',
            mobile: source.mobile_personal || '',
            area: source.address_area || '',
            address: source.address_details || '',
            dateOfBirth: source.birth_date || '',
            teacherId: source.teacher_id || '',
            password: '',
          });
        }
      } catch (err) {
        console.error('Error fetching full servant edit data:', err);
        toast.error('فشل في جلب بيانات الخادم كاملة للتعديل');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullServantData();
  }, [editData]);
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
      // Determine Role, Stage, and Class for Prefix
      let prefix = '';
      if (formData.role === 'admin') {
        prefix = 'A'; // Admins just get A + YZ
      } else {
        const R = formData.role === 'supervisor' ? 'S' : 'N';

        let L = 'X';
        let X = '0';
        const stage = formData.classStage || '';

        if (stage === 'kg') { L = 'K'; X = '0'; }
        else if (stage === 'primary_12') { L = 'P'; X = '1'; }
        else if (stage === 'primary_34') { L = 'P'; X = '3'; }
        else if (stage === 'primary_56') { L = 'P'; X = '5'; }
        else if (stage === 'preparatory') { L = 'Y'; X = '0'; }
        else if (stage === 'secondary') { L = 'S'; X = '0'; }
        else if (stage === 'university_graduate') { L = 'G'; X = '0'; }

        prefix = `${R}${L}${X}`;
      }

      // Gap-Filling Algorithm specific to the Prefix
      const { data: existingIds, error: fetchError } = await supabase
        .from('servants')
        .select('teacher_id')
        .like('teacher_id', `${prefix}%`);

      if (fetchError && fetchError.code !== '42703') {
        // ignore 42703 if column doesn't exist yet in some environments, but throw otherwise
        console.warn('Could not fetch existing teacher_ids:', fetchError);
      }

      let nextNum = 1;
      if (existingIds && existingIds.length > 0) {
        const numbers = existingIds
          .map(row => parseInt(String(row.teacher_id).replace(prefix, ''), 10))
          .filter(n => !isNaN(n))
          .sort((a, b) => a - b);

        for (const num of numbers) {
          if (num === nextNum) nextNum++;
          else if (num > nextNum) break; // Found the missing gap!
        }
      }
      const finalTeacherId = `${prefix}${String(nextNum).padStart(2, '0')}`;

      // Build payload ensuring teacher_id is explicitly included to fix the Not-Null constraint
      const servantPayload = {
        teacher_id: finalTeacherId,
        full_name: formData.fullName,
        gender: formData.gender,
        mobile_personal: formData.mobile,
        educational_stage: formData.educationStage, // Their personal education
        academic_year: formData.educationYear,
        class_stage: formData.classStage,           // The class they serve in
        class_or_job: formData.classStage,          // Fallback just in case
        father_of_confession: formData.confessionFather,
        address_area: formData.area,
        address_details: formData.address,
        birth_date: formData.dateOfBirth || null,
        role: formData.role
      };

      if (editData && editData.id) {
        // Update existing servant
        const { error } = await supabase
          .from('servants')
          .update(servantPayload)
          .eq('id', editData.id);

        if (error) throw error;

        toast.success('تم تحديث بيانات الخادم بنجاح');
      } else {
        // 1. Create Supabase Auth User with a dummy email based on the generated Smart ID
        const dummyEmail = `${finalTeacherId.toLowerCase()}@aribsalin.com`;
        const defaultPassword = formData.password || '123456'; // Ensure a password exists

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: defaultPassword,
        });

        if (authError) {
          throw new Error('فشل إنشاء حساب تسجيل الدخول: ' + authError.message);
        }

        if (!authData.user?.id) {
          throw new Error('تعذر الحصول على معرّف المستخدم من نظام المصادقة');
        }

        // 2. Link the Auth User UUID to the servants table record
        const finalPayload = {
          ...servantPayload,
          id: authData.user.id // Satisfies the servants_auth_fkey constraint
        };

        // 3. Insert into servants table
        const { error: insertError } = await supabase
          .from('servants')
          .insert([finalPayload]);

        if (insertError) throw insertError;

        toast.success(`تم تسجيل الخادم بنجاح. كود الدخول: ${finalTeacherId}`);
      }

      // Notify parent component to redirect or update state
      if (onSignup) {
        onSignup(formData as any);
      }

      clearEdit?.();
    } catch (error: any) {
      console.error('Error saving servant:', error);
      toast.error('حدث خطأ أثناء حفظ البيانات: ' + error.message);
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
          <h2 className="text-xl font-bold">
            {editData ? 'تعديل بيانات الخادم' : 'تسجيل خادم جديد'}
          </h2>
        </div>
      </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-32">
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
                  {areas.length > 0 ? (
                    areas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))
                  ) : (
                    <option value="" disabled>جاري تحميل المناطق...</option>
                  )}
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

      {/* Fixed Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground rounded-xl py-4 shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <Save className="w-5 h-5" />
          <span className="text-lg">{isLoading ? (editData ? 'جاري التحديث...' : 'جاري الحفظ...') : (editData ? 'تحديث البيانات' : 'حفظ البيانات')}</span>
        </button>
      </div>
    </form>
    </div>
  );
}
