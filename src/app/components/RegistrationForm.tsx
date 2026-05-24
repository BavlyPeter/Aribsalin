import { ArrowRight, Save } from 'lucide-react';
import { useState } from 'react';

interface RegistrationFormProps {
  onBack: () => void;
  onSubmit: (data: ParticipantData) => void;
}

export interface ParticipantData {
  fullName: string;
  gender: 'male' | 'female' | '';
  educationStage: string;
  confessionFather: string;
  personalMobile: string;
  fatherMobile: string;
  motherMobile: string;
  address: string;
}

export function RegistrationForm({ onBack, onSubmit }: RegistrationFormProps) {
  const [formData, setFormData] = useState<ParticipantData>({
    fullName: '',
    gender: '',
    educationStage: '',
    confessionFather: '',
    personalMobile: '',
    fatherMobile: '',
    motherMobile: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof ParticipantData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <h2 className="text-xl">تسجيل مشارك جديد</h2>
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
              <label className="block mb-2 text-sm text-foreground">المرحلة الدراسية *</label>
              <select
                required
                value={formData.educationStage}
                onChange={(e) => updateField('educationStage', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">اختر المرحلة</option>
                <option value="kg">روضة</option>
                <option value="primary">ابتدائي</option>
                <option value="preparatory">إعدادي</option>
                <option value="secondary">ثانوي</option>
                <option value="university">جامعي</option>
              </select>
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

        {/* Contact Information Card */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">أرقام التواصل</h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-foreground">رقم الموبايل الشخصي</label>
              <input
                type="tel"
                value={formData.personalMobile}
                onChange={(e) => updateField('personalMobile', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-foreground">رقم موبايل الأب</label>
              <input
                type="tel"
                value={formData.fatherMobile}
                onChange={(e) => updateField('fatherMobile', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-foreground">رقم موبايل الأم</label>
              <input
                type="tel"
                value={formData.motherMobile}
                onChange={(e) => updateField('motherMobile', e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary">العنوان</h3>

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
