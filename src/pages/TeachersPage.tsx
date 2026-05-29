import { ArrowRight, Users, Crown, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { stageLabels } from '../app/utils/stageHelpers';

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
}

export function TeachersPage({ onBack, onEdit }: TeachersPageProps) {
  const [classesData, setClassesData] = useState<ClassData[]>([
    {
      stage: 'kg',
      stageLabel: 'حضانة',
      supervisor: {
        id: 'T001',
        name: 'مريم بطرس فهمي',
        mobile: '01012345678',
        email: 'mariam@example.com',
        isSupervisor: true
      },
      teachers: [
        { id: 'T002', name: 'نانسي نبيل عزيز', mobile: '01098765432', email: 'nancy@example.com' },
        { id: 'T003', name: 'ساندرا سامح توفيق', mobile: '01087654321', email: 'sandra@example.com' }
      ]
    },
    {
      stage: 'primary_12',
      stageLabel: stageLabels['primary_12'],
      supervisor: {
        id: 'T004',
        name: 'جورج رأفت إبراهيم',
        mobile: '01156789012',
        email: 'george@example.com',
        isSupervisor: true
      },
      teachers: [
        { id: 'T005', name: 'كريستينا ماجد ميخائيل', mobile: '01145678901', email: 'christina@example.com' }
      ]
    },
    {
      stage: 'primary_34',
      stageLabel: stageLabels['primary_34'],
      supervisor: {
        id: 'T024',
        name: 'جورج رأفت إبراهيم',
        mobile: '01156789012',
        email: 'george@example.com',
        isSupervisor: true
      },
      teachers: [
        { id: 'T006', name: 'فيرونيا سمير نصيف', mobile: '01134567890', email: 'veronia@example.com' }
      ]
    },
    {
      stage: 'primary_56',
      stageLabel: stageLabels['primary_56'],
      supervisor: {
        id: 'T025',
        name: 'جورج رأفت إبراهيم',
        mobile: '01156789012',
        email: 'george@example.com',
        isSupervisor: true
      },
      teachers: [
        { id: 'T007', name: 'تريزا عادل منير', mobile: '01123456789', email: 'tereza@example.com' }
      ]
    },
    {
      stage: 'preparatory',
      stageLabel: 'إعدادي',
      supervisor: {
        id: 'T008',
        name: 'بولس ميلاد سمير',
        mobile: '01234567890',
        email: 'boulos@example.com',
        isSupervisor: true
      },
      teachers: [
        { id: 'T009', name: 'كيرلس عادل رمزي', mobile: '01056789012', email: 'kyrillos@example.com' },
        { id: 'T010', name: 'فيلوباتير جورج صليب', mobile: '01067890123', email: 'philopateer@example.com' },
        { id: 'T011', name: 'إيريني حبيب جرجس', mobile: '01078901234', email: 'eirene@example.com' }
      ]
    },
    {
      stage: 'secondary',
      stageLabel: 'ثانوي',
      supervisor: {
        id: 'T012',
        name: 'مارك جرجس عبد المسيح',
        mobile: '01089012345',
        email: 'mark@example.com',
        isSupervisor: true
      },
      teachers: [
        { id: 'T013', name: 'مارينا عماد وليم', mobile: '01090123456', email: 'marina@example.com' },
        { id: 'T014', name: 'بيشوي مجدي حنا', mobile: '01001234567', email: 'bishoy@example.com' },
        { id: 'T015', name: 'يوحنا عاطف نصيف', mobile: '01112345678', email: 'youhanna@example.com' }
      ]
    },
    {
      stage: 'university',
      stageLabel: 'جامعي',
      supervisor: {
        id: 'T016',
        name: 'أندرو مجدي فايق',
        mobile: '01223456789',
        email: 'andrew@example.com',
        isSupervisor: true
      },
      teachers: [
        { id: 'T017', name: 'مرثا إميل إبراهيم', mobile: '01334567890', email: 'martha@example.com' },
        { id: 'T018', name: 'بيتر رؤوف عزت', mobile: '01445678901', email: 'peter@example.com' }
      ]
    },
    {
      stage: 'graduate',
      stageLabel: 'خريجين',
      supervisor: {
        id: 'T019',
        name: 'أبانوب رافت ميخائيل',
        mobile: '01556789012',
        email: 'abanoub@example.com',
        isSupervisor: true
      },
      teachers: [
        { id: 'T020', name: 'رامي رؤوف نجيب', mobile: '01667890123', email: 'ramy@example.com' },
        { id: 'T021', name: 'كارولين ماهر سليمان', mobile: '01778901234', email: 'caroline@example.com' },
        { id: 'T022', name: 'آية نشأت رزق', mobile: '01889012345', email: 'aya@example.com' }
      ]
    }
  ]);

  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

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
                  {/* Supervisor */}
                  {classData.supervisor && (
                    <div className="bg-secondary/10 rounded-lg p-3 border-2 border-secondary/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--secondary)' }}>
                          المشرف
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">{classData.supervisor.name}</div>
                        <div className="text-xs text-muted-foreground">{classData.supervisor.mobile}</div>
                        <div className="text-xs text-muted-foreground">{classData.supervisor.email}</div>
                      </div>
                    </div>
                  )}

                  {/* Teachers List */}
                  {classData.teachers.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">الخدام</div>
                      {classData.teachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="bg-muted/30 rounded-lg p-3 flex items-start justify-between"
                        >
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{teacher.name}</div>
                            <div className="text-xs text-muted-foreground">{teacher.mobile}</div>
                            <div className="text-xs text-muted-foreground">{teacher.email}</div>
                          </div>

                          <div className="flex items-center gap-2 mr-2">
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
                                  // Remove teacher from local state
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
