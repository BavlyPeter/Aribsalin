import { useState, useEffect } from 'react';
import { ArrowRight, User, Phone, MapPin, Book, Crown, Calendar, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface ServantProfileProps {
  servantId: string;
  onBack: () => void;
}

const roleLabels: Record<string, string> = {
  'normal': 'خادم',
  'supervisor': 'أمين فصل',
  'admin': 'أمين الخدمة'
};

const servingStages: Record<string, string> = {
  'kg': 'حضانة',
  'primary_12': 'ابتدائي (الأول والثاني)',
  'primary_34': 'ابتدائي (الثالث والرابع)',
  'primary_56': 'ابتدائي (الخامس والسادس)',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university_graduate': 'جامعي وخريجين'
};

const educationStages: Record<string, string> = {
  'kg': 'حضانة',
  'primary': 'ابتدائي',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university': 'جامعي',
  'graduate': 'خريجين'
};

export function ServantProfile({ servantId, onBack }: ServantProfileProps) {
  const [servant, setServant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServantData = async () => {
      try {
        const { data, error } = await supabase
          .from('servants')
          .select('*')
          .eq('id', servantId)
          .single();

        if (error) throw error;
        setServant(data);
      } catch (err) {
        console.error('Error fetching servant profile:', err);
        toast.error('فشل في جلب بيانات الخادم');
      } finally {
        setIsLoading(false);
      }
    };

    if (servantId) {
      fetchServantData();
    }
  }, [servantId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg">
              <ArrowRight className="w-6 h-6" />
            </button>
            <h2 className="text-xl">ملف الخادم</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!servant) return null;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <h2 className="text-xl">ملف الخادم</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Header Card */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-xl bg-primary/10 flex items-center justify-center">
            {servant.photo_url ? (
              <img src={servant.photo_url} alt={servant.full_name} className="w-full h-full object-cover" />
            ) : servant.role === 'supervisor' || servant.role === 'admin' ? (
              <Crown className="w-12 h-12" style={{ color: 'var(--secondary)' }} />
            ) : (
              <User className="w-12 h-12 text-primary" />
            )}
          </div>
          <h3 className="text-xl mb-1 text-primary">{servant.full_name}</h3>
          <p className="text-sm text-muted-foreground mb-4">كود الدخول: {servant.teacher_id}</p>

          <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-lg" style={{ color: 'var(--secondary)' }}>
            <span className="text-sm font-medium">
              {roleLabels[servant.role || 'normal']} 
              {servant.role !== 'admin' && servant.class_stage ? ` - ${servingStages[servant.class_stage] || servant.class_stage}` : ''}
            </span>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary flex items-center gap-2">
            <Info className="w-5 h-5" />
            البيانات الشخصية والكنسية
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">النوع</div>
                <div className="font-medium">{servant.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
              </div>
            </div>

            {servant.birth_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">تاريخ الميلاد</div>
                  <div className="font-medium">
                    {new Date(servant.birth_date).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            )}

            {servant.father_of_confession && (
              <div className="flex items-start gap-3 pt-2 border-t border-border">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">أب الإعتراف</div>
                  <div className="font-medium">{servant.father_of_confession}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Education Information */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary flex items-center gap-2">
            <Book className="w-5 h-5" />
            البيانات التعليمية / العملية
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Book className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">المرحلة الدراسية الشخصية</div>
                <div className="font-medium">{educationStages[servant.educational_stage] || servant.educational_stage || 'غير محدد'}</div>
              </div>
            </div>

            {servant.academic_year && (
              <div className="flex items-start gap-3">
                <Book className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">السنة الدراسية</div>
                  <div className="font-medium">{servant.academic_year}</div>
                </div>
              </div>
            )}

            {servant.class_or_job && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">
                    {servant.educational_stage === 'graduate' ? 'الوظيفة / مكان العمل' : 'الجامعة / المدرسة'}
                  </div>
                  <div className="font-medium">{servant.class_or_job}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="mb-4 text-primary flex items-center gap-2">
            <Phone className="w-5 h-5" />
            بيانات التواصل
          </h3>
          <div className="space-y-3">
            {servant.mobile_personal && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">رقم الموبايل</div>
                  <a href={`tel:${servant.mobile_personal}`} className="font-medium text-primary block" dir="ltr" style={{ textAlign: 'right' }}>
                    {servant.mobile_personal}
                  </a>
                </div>
              </div>
            )}

            {(servant.address_area || servant.address_details) && (
              <div className="flex items-start gap-3 pt-2 border-t border-border">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">العنوان</div>
                  <div className="font-medium">
                    {servant.address_area} {servant.address_area && servant.address_details ? ' - ' : ''} {servant.address_details}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}