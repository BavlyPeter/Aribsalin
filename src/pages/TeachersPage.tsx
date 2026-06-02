import { ArrowRight, Users, Crown, Trash2, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  name: string;
  mobile: string;
  email: string;
  isSupervisor?: boolean;
}

interface ClassData {
  stage: string;
  stageLabel: string;
  supervisor: Teacher | null;
  teachers: Teacher[];
}

interface TeachersPageProps {
  onBack: () => void;
  onEdit?: (teacher: Teacher, type: 'servant') => void;
  onViewProfile?: (id: string) => void;
}

const servingStages = {
  kg: 'حضانة',
  primary_12: 'ابتدائي (الأول والثاني)',
  primary_34: 'ابتدائي (الثالث والرابع)',
  primary_56: 'ابتدائي (الخامس والسادس)',
  preparatory: 'إعدادي',
  secondary: 'ثانوي',
  university_graduate: 'جامعي وخريجين'
};

export function TeachersPage({ onBack, onEdit, onViewProfile }: TeachersPageProps) {
  const [classesData, setClassesData] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  // Helper to map DB stage values to our ClassData keys
  const getStageKey = (dbStage: string) => {
    const s = (dbStage || '').toLowerCase();
    if (s.includes('حضانة') || s === 'kg') return 'kg';
    if (s.includes('إعدادي') || s === 'preparatory') return 'preparatory';
    if (s.includes('ثانوي') || s === 'secondary') return 'secondary';
    if (s.includes('جامعي') || s === 'university' || s.includes('خريجين') || s === 'graduate') return 'university_graduate';

    // Default to primary combinations if not strictly matched
    if (s.includes('ابتدائي') || s === 'primary') return 'primary_12';
    return s;
  };

  useEffect(() => {
    fetchServants();
  }, []);

  const fetchServants = async () => {
    try {
      const { data, error } = await supabase
        .from('servants')
        .select('*');

      if (error) throw error;

      if (data) {
        // Group by stage
        const grouped: Record<string, Teacher[]> = {};

        data.forEach((servant: any) => {
          const stageKey = getStageKey(servant.class_stage || servant.class_or_job || '');

          if (!grouped[stageKey]) {
            grouped[stageKey] = [];
          }

          grouped[stageKey].push({
            id: servant.id,
            name: servant.full_name,
            mobile: servant.mobile_personal,
            email: '',
            isSupervisor: servant.role === 'supervisor'
          });
        });

        const mappedData: ClassData[] = Object.keys(servingStages)
          .map(key => ({
            stage: key,
            stageLabel: servingStages[key as keyof typeof servingStages] || key,
            supervisor: null,
            teachers: (grouped[key] || []).sort((a, b) => {
              if (a.isSupervisor && !b.isSupervisor) return -1;
              if (!a.isSupervisor && b.isSupervisor) return 1;
              return 0;
            })
          }))
          .filter(c => c.teachers.length > 0);

        setClassesData(mappedData);
      }
    } catch (err) {
      console.error('Error fetching servants:', err);
      toast.error('فشل في تحميل بيانات الخدام');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStage = (stage: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stage)) {
      newExpanded.delete(stage);
    } else {
      newExpanded.add(stage);
    }
    setExpandedStages(newExpanded);
  };

  const getTotalTeachers = () => {
    return classesData.reduce((sum, cls) => sum + cls.teachers.length + (cls.supervisor ? 1 : 0), 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        جاري تحميل بيانات الخدام...
      </div>
    );
  }

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
          <h2 className="text-xl">إدارة الخدام</h2>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Card */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{getTotalTeachers()}</div>
                <div className="text-sm text-muted-foreground">إجمالي الخدام</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: 'var(--secondary)' }}>{classesData.length}</div>
              <div className="text-xs text-muted-foreground">مراحل دراسية</div>
            </div>
          </div>
        </div>

        {/* Classes List */}
        <div className="space-y-3">
          <h3 className="text-primary font-medium">الخدام حسب المرحلة الدراسية</h3>

          {classesData.map((classData) => (
            <div key={classData.stage} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              {/* Stage Header */}
              <button
                onClick={() => toggleStage(classData.stage)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{classData.stageLabel}</div>
                    <div className="text-xs text-muted-foreground">
                      {classData.teachers.length + (classData.supervisor ? 1 : 0)} خادم
                    </div>
                  </div>
                </div>
                <div className="text-muted-foreground">
                  {expandedStages.has(classData.stage) ? '▼' : '◄'}
                </div>
              </button>

              {/* Expanded Content */}
              {expandedStages.has(classData.stage) && (
                <div className="border-t border-border p-4 space-y-3">
                  {/* Teachers List */}
                  {classData.teachers.length > 0 && (
                    <div className="space-y-2">
                      {classData.teachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          onClick={() => onViewProfile?.(teacher.id)}
                          className={`rounded-lg p-3 flex items-start justify-between border cursor-pointer hover:shadow-md transition-all ${teacher.isSupervisor ? 'bg-secondary/10 border-secondary/30 hover:bg-secondary/20' : 'bg-muted/30 border-transparent hover:bg-muted/50'}`}
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {teacher.isSupervisor && (
                                <Crown className="w-4 h-4 shrink-0" style={{ color: 'var(--secondary)' }} />
                              )}
                              <div className={`font-medium text-sm ${teacher.isSupervisor ? 'text-[var(--secondary)]' : 'text-foreground'}`}>
                                {teacher.name}
                              </div>
                              {teacher.isSupervisor && (
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary/20" style={{ color: 'var(--secondary)' }}>
                                  (أمين الفصل)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{teacher.mobile}</div>
                            {teacher.email && <div className="text-xs text-muted-foreground">{teacher.email}</div>}
                          </div>

                          <div className="flex items-center gap-2 mr-2 shrink-0">
                            <button
                              title="تعديل"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(teacher, 'servant');
                              }}
                              className="p-2 rounded-lg bg-white/10 text-slate-700 hover:bg-muted"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              title="حذف"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const ok = window.confirm('هل أنت متأكد من حذف هذا السجل تماماً؟');
                                if (!ok) return;
                                try {
                                  const { error } = await supabase.from('servants').delete().eq('id', teacher.id);
                                  if (error) {
                                    toast.error('فشل الحذف');
                                    console.error(error);
                                    return;
                                  }
                                  setClassesData(prev => prev.map(cls => ({
                                    ...cls,
                                    teachers: cls.teachers.filter(t => t.id !== teacher.id),
                                    supervisor: cls.supervisor?.id === teacher.id ? null : cls.supervisor
                                  })));
                                  toast.success('تم الحذف بنجاح');
                                } catch (err) {
                                  console.error(err);
                                  toast.error('حدث خطأ');
                                }
                              }}
                              className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
