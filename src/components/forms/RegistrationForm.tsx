import { ArrowRight, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StudentData } from '../../types';
import { supabase } from '../../lib/supabase';
import { uploadProfileImage } from '../../lib/uploadHelper';
import { toast } from 'sonner';

interface RegistrationFormProps {
  onBack: () => void;
  onSubmit: (data: StudentData, participantId?: string) => Promise<void> | void;
  editData?: any | null;
  clearEdit?: () => void;
}

const educationStages = {
  'kg': 'حضانة',
  'primary': 'ابتدائي',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university': 'جامعي',
  'graduate': 'خريجين'
};

const educationYears = {
  'kg': ['Baby Class', 'KG1', 'KG2'],
  'primary': [
    'الصف الأول الابتدائي',
    'الصف الثاني الابتدائي',
    'الصف الثالث الابتدائي',
    'الصف الرابع الابتدائي',
    'الصف الخامس الابتدائي',
    'الصف السادس الابتدائي'
  ],
  'preparatory': [
    'الصف الأول الإعدادي',
    'الصف الثاني الإعدادي',
    'الصف الثالث الإعدادي'
  ],
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

export function RegistrationForm({ onBack, onSubmit, editData, clearEdit }: RegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(editData?.photo_url || null);
  const [formData, setFormData] = useState<StudentData>({
    fullName: '',
    gender: '',
    educationStage: '',
    educationYear: '',
    studyOrWorkPlace: '',
    universityName: '',
    collegeName: '',
    jobTitle: '',
    confessionFather: '',
    personalMobile: '',
    fatherMobile: '',
    motherMobile: '',
    area: '',
    address: '',
    dateOfBirth: ''
  });

  // Fetch full data for editing from Supabase to ensure all fields populate
  useEffect(() => {
    const fetchFullParticipantData = async () => {
      if (!editData || !editData.id) return;

      try {
        setIsLoading(true);
        // Regex to check if the ID is a valid UUID or a Smart ID like P01
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editData.id);

        let query = supabase.from('participants').select('*');
        if (isUuid) {
          query = query.eq('id', editData.id);
        } else {
          query = query.eq('participant_id', editData.id);
        }

        const { data: source, error } = await query.single();

        if (error) throw error;

        if (source) {
          setFormData({
            fullName: source.full_name || '',
            gender: source.gender || '',
            photo_url: source.photo_url || null,
            educationStage: source.educational_stage || '',
            educationYear: source.academic_year || '',
            studyOrWorkPlace: source.class_or_job || '',
            confessionFather: source.father_of_confession || '',
            personalMobile: source.mobile_personal || '',
            fatherMobile: source.mobile_father || '',
            motherMobile: source.mobile_mother || '',
            area: source.address_area || '',
            address: source.address_details || '',
            dateOfBirth: source.birth_date || ''
          });
          setPhotoPreview(source.photo_url || null);
          setPhotoFile(null);
        }
      } catch (err) {
        console.error('Error fetching full participant edit data:', err);
        toast.error('فشل في جلب بيانات المشارك كاملة للتعديل');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullParticipantData();
  }, [editData]);

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

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

  const generateParticipantSmartId = async (stage: string, year: string) => {
    let stageChar = 'X';
    if (stage === 'kg') stageChar = 'K';
    else if (stage === 'primary') stageChar = 'P';
    else if (stage === 'preparatory') stageChar = 'Y';
    else if (stage === 'secondary') stageChar = 'S';
    else if (stage === 'university' || stage === 'graduate') stageChar = 'G';

    let yearChar = '0';
    if (stage === 'kg') {
      if (year === 'Baby Class') yearChar = '0';
      else if (year === 'KG1') yearChar = '1';
      else if (year === 'KG2') yearChar = '2';
    } else if (stage === 'primary') {
      if (year === 'الصف الأول الابتدائي') yearChar = '1';
      else if (year === 'الصف الثاني الابتدائي') yearChar = '2';
      else if (year === 'الصف الثالث الابتدائي') yearChar = '3';
      else if (year === 'الصف الرابع الابتدائي') yearChar = '4';
      else if (year === 'الصف الخامس الابتدائي') yearChar = '5';
      else if (year === 'الصف السادس الابتدائي') yearChar = '6';
    } else if (stage === 'preparatory') {
      if (year === 'الصف الأول الإعدادي') yearChar = '1';
      else if (year === 'الصف الثاني الإعدادي') yearChar = '2';
      else if (year === 'الصف الثالث الإعدادي') yearChar = '3';
    } else if (stage === 'secondary') {
      if (year === 'الصف الأول الثانوي') yearChar = '1';
      else if (year === 'الصف الثاني الثانوي') yearChar = '2';
      else if (year === 'الصف الثالث الثانوي') yearChar = '3';
    } else if (stage === 'university') {
      if (year === 'الفرقة الأولى') yearChar = '1';
      else if (year === 'الفرقة الثانية') yearChar = '2';
      else if (year === 'الفرقة الثالثة') yearChar = '3';
      else if (year === 'الفرقة الرابعة') yearChar = '4';
      else if (year === 'الفرقة الخامسة') yearChar = '5';
      else if (year === 'الفرقة السادسة') yearChar = '6';
      else if (year === 'الفرقة السابعة') yearChar = '7';
    } else if (stage === 'graduate') {
      yearChar = '0';
    }

    const prefix = `${stageChar}${yearChar}`;

    const { data, error } = await supabase
      .from('participants')
      .select('participant_id')
      .ilike('participant_id', `${prefix}%`);

    if (error) {
      throw error;
    }

    let nextNum = 1;
    if (data && data.length > 0) {
      const existingNums = data
        .map((item) => parseInt(item.participant_id.slice(2), 10))
        .filter((num) => !Number.isNaN(num));

      if (existingNums.length > 0) {
        nextNum = Math.max(...existingNums) + 1;
      }
    }

    return `${prefix}${String(nextNum).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mobile numbers length if provided
    if (formData.personalMobile && formData.personalMobile.length !== 11) {
      toast.error('رقم الموبايل الشخصي يجب أن يتكون من 11 رقم بالضبط');
      return;
    }
    if (formData.fatherMobile && formData.fatherMobile.length !== 11) {
      toast.error('رقم موبايل الأب يجب أن يتكون من 11 رقم بالضبط');
      return;
    }
    if (formData.motherMobile && formData.motherMobile.length !== 11) {
      toast.error('رقم موبايل الأم يجب أن يتكون من 11 رقم بالضبط');
      return;
    }

    setIsLoading(true);

    try {
      let finalPhotoUrl = formData.photo_url || editData?.photo_url || null;
      if (photoFile) {
        finalPhotoUrl = await uploadProfileImage(photoFile, 'participants');
      }

      const finalData = { ...formData, photo_url: finalPhotoUrl };

      await onSubmit(finalData, editData?.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      console.error(error);
      toast.error(`حدث خطأ أثناء التسجيل: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof StudentData, value: string) => {
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

    if (['kg', 'primary', 'preparatory', 'secondary'].includes(formData.educationStage)) {
      return 'اسم المدرسة';
    } else if (formData.educationStage === 'graduate') {
      return 'مكان العمل (اختياري)';
    }
    return '';
  };

  const getStudyPlaceLabel = () => {
    if (!formData.educationStage) return '';

    if (['kg', 'primary', 'preparatory', 'secondary'].includes(formData.educationStage)) {
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
          <h2 className="text-xl">{editData ? 'تعديل بيانات المشارك' : 'تسجيل مشارك جديد'}</h2>
        </div>
      </div>

      <div className="px-4 pt-4">
        <label className="block w-fit mx-auto cursor-pointer">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-border overflow-hidden bg-muted/40 flex items-center justify-center shadow-sm">
            {photoPreview ? (
              <img src={photoPreview} alt="صورة المشارك" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-muted-foreground text-center px-2">أضف صورة</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPhotoFile(file);
                if (photoPreview && photoPreview.startsWith('blob:')) {
                  URL.revokeObjectURL(photoPreview);
                }
                setPhotoPreview(URL.createObjectURL(file));
              }
            }}
          />
        </label>
      </div>

      {/* Form */}
      <form id="registration-form" onSubmit={handleSubmit} className="p-4 space-y-4 pb-24">
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

            {formData.educationStage === 'university' && (
              <div>
                <label className="block mb-2 text-sm text-foreground">الجامعة / الكلية</label>
                <input
                  type="text"
                  value={formData.studyOrWorkPlace}
                  onChange={(e) => updateField('studyOrWorkPlace', e.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="مثال: جامعة أسوان / كلية التجارة"
                />
              </div>
            )}
            {formData.educationStage === 'graduate' && (
              <div>
                <label className="block mb-2 text-sm text-foreground">جهة العمل / الوظيفة</label>
                <input
                  type="text"
                  value={formData.studyOrWorkPlace}
                  onChange={(e) => updateField('studyOrWorkPlace', e.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="مثال: مدرس، مهندس، محاسب..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">أرقام التواصل</h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-foreground">رقم الموبايل الشخصي</label>
              <input
                type="tel"
                maxLength={11}
                value={formData.personalMobile}
                onChange={(e) => updateField('personalMobile', e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="01xxxxxxxxx"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-foreground">رقم موبايل الأب</label>
              <input
                type="tel"
                maxLength={11}
                value={formData.fatherMobile}
                onChange={(e) => updateField('fatherMobile', e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="01xxxxxxxxx"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-foreground">رقم موبايل الأم</label>
              <input
                type="tel"
                maxLength={11}
                value={formData.motherMobile}
                onChange={(e) => updateField('motherMobile', e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="01xxxxxxxxx"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-foreground">المنطقة السكنية *</label>
              <select
                required
                value={formData.area}
                onChange={(e) => updateField('area', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">اختر المنطقة</option>
                {areas.map((area) => (
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
      </form>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <button
          type="submit"
          form="registration-form"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground rounded-xl py-4 shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span className="text-lg">{isLoading ? (editData ? 'جاري التحديث...' : 'جاري التسجيل...') : (editData ? 'تحديث البيانات' : 'حفظ البيانات')}</span>
        </button>
      </div>
    </div>
  );
}
