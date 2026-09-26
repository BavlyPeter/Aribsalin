import { ArrowRight, Users, Crown, Trash2, Edit, User, CalendarCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useFestivalStore } from '../store/useFestivalStore';

interface Teacher {
  id: string;
  name: string;
  mobile: string;
  email: string;
  isSupervisor?: boolean;
  photo_url?: string;
}

interface ClassData {
  stage: string;
  stageLabel: string;
  supervisor: Teacher | null;
  teachers: Teacher[];
}

interface TeachersPageProps {
  onBack?: () => void;
  onEdit?: (teacher: Teacher, type: 'servant') => void;
  onViewProfile?: (id: string) => void;
}

const servingStages: Record<string, string> = {
  supervisors: 'أمناء الخدمة والمسؤولين',
  kg: 'حضانة',
  primary_12: 'ابتدائي (الأول والثاني)',
  primary_34: 'ابتدائي (الثالث والرابع)',
  primary_56: 'ابتدائي (الخامس والسادس)',
  preparatory: 'إعدادي',
  secondary: 'ثانوي',
  university_graduate: 'جامعي وخريجين',
  other: 'غير محدد / أخرى'
};

export function TeachersPage({ onBack, onEdit, onViewProfile }: TeachersPageProps = {}) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/dashboard'));
  const handleViewProfile = onViewProfile || ((id: string) => navigate(`/servant-profile/${id}`));
  const handleEdit = onEdit || ((teacher: Teacher) => navigate(`/signup?edit=${teacher.id}`));

  const { currentServant } = useFestivalStore();
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceTeacher, setAttendanceTeacher] = useState<Teacher | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceTypes, setAttendanceTypes] = useState<string[]>(['class']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAttendanceType = (type: string) => {
    setAttendanceTypes(prev => {
      if (prev.includes(type)) {
        if (prev.length === 1) {
          toast.info('يجب اختيار نوع حدث واحد على الأقل');
          return prev;
        }
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const [classesData, setClassesData] = useState<ClassData[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  // Helper to map DB stage values to our ClassData keys
  const getStageKey = (dbStage: string) => {
    const s = (dbStage || '').toLowerCase().trim();
    if (!s || s === 'empty') return 'other';

    // 1. Check for exact DB matches with our keys
    if (['kg', 'primary_12', 'primary_34', 'primary_56', 'preparatory', 'secondary', 'university_graduate'].includes(s)) {
      return s;
    }

    // 2. Fallback text-based matching for Arabic/English keywords
    if (s.includes('حضانة') || s.includes('kg')) return 'kg';
    if (s.includes('إعدادي') || s.includes('preparatory')) return 'preparatory';
    if (s.includes('ثانوي') || s.includes('secondary')) return 'secondary';
    if (s.includes('جامعي') || s.includes('university') || s.includes('خريج') || s.includes('graduate')) return 'university_graduate';
    
    if (s.includes('ابتدائي') || s.includes('primary')) {
      if (s.includes('1') || s.includes('2') || s.includes('أول') || s.includes('ثاني')) return 'primary_12';
      if (s.includes('3') || s.includes('4') || s.includes('ثالث') || s.includes('رابع')) return 'primary_34';
      if (s.includes('5') || s.includes('6') || s.includes('خامس') || s.includes('سادس')) return 'primary_56';
      return 'primary_12'; // default fallback for primary
    }

    return 'other';
  };

  useEffect(() => {
    fetchServants();
  }, []);

  const fetchServants = async () => {
    try {
      // Fetch ONLY approved servants
      const { data, error } = await supabase
        .from('servants')
        .select('*')
        .eq('status', 'approved')
        .neq('role', 'developer'); // Stealth Mode: Hide developers from UI

      if (error) throw error;

      // Initialize empty groups
      const grouped: Record<string, ClassData> = Object.keys(servingStages).reduce((acc, key) => {
        acc[key] = { stage: key, stageLabel: servingStages[key], supervisor: null, teachers: [] };
        return acc;
      }, {} as Record<string, ClassData>);

      data?.forEach(servant => {
        const teacherObj: Teacher = {
          id: servant.id,
          name: servant.full_name || servant.name || 'بدون اسم',
          mobile: servant.mobile_personal || servant.mobile || '',
          email: servant.email || '',
          photo_url: servant.photo_url || '',
          isSupervisor: servant.role === 'supervisor' // Flag them as supervisor
        };

        if (servant.role === 'admin') {
          grouped['supervisors'].teachers.push(teacherObj);
        } else {
          const stage = servant.class_stage || servant.classStage || 'other';
          const stageKey = getStageKey(stage);
          if (grouped[stageKey]) {
            grouped[stageKey].teachers.push(teacherObj);
          } else {
            grouped['other'].teachers.push(teacherObj);
          }
        }
      });

      // Sort teachers: Supervisors first, then alphabetically
      const mappedData: ClassData[] = Object.values(grouped)
        .map(cls => {
          cls.teachers.sort((a, b) => {
            if (a.isSupervisor && !b.isSupervisor) return -1;
            if (!a.isSupervisor && b.isSupervisor) return 1;
            return a.name.localeCompare(b.name, 'ar');
          });
          return cls;
        })
        .filter(c => c.teachers.length > 0);

      setClassesData(mappedData);
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
            onClick={handleBack}
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
                          className={`rounded-lg p-3 flex items-start justify-between border cursor-pointer hover:shadow-md transition-all ${teacher.isSupervisor ? 'bg-secondary/10 border-secondary/30 hover:bg-secondary/20' : 'bg-muted/30 border-transparent hover:bg-muted/50'}`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Avatar */}
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-primary/5 border-2 border-primary/10 flex items-center justify-center shrink-0">
                              {teacher.photo_url ? (
                                <img src={teacher.photo_url} alt={teacher.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-primary/40" />
                              )}
                            </div>

                            <div className="space-y-1 min-w-0 flex-1 text-right" onClick={() => handleViewProfile(teacher.id)}>
                              <div className="flex items-center gap-2 flex-wrap">
                                {teacher.isSupervisor && (
                                  <Crown className="w-4 h-4 shrink-0 text-yellow-500" title="أمين فصل" />
                                )}
                                <div className={`font-medium text-sm ${teacher.isSupervisor ? 'text-[var(--secondary)]' : 'text-foreground'}`}>
                                  {teacher.name}
                                </div>
                                {teacher.isSupervisor && (
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary/20" style={{ color: 'var(--secondary)' }}>
                                    {classData.stage === 'supervisors' ? '(أمين خدمة)' : '(أمين الفصل)'}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{teacher.mobile}</div>
                              {teacher.email && <div className="text-xs text-muted-foreground">{teacher.email}</div>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mr-2 shrink-0">
                            <button
                              title="تسجيل حضور يدوي"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAttendanceTeacher(teacher);
                                setAttendanceDate(new Date().toISOString().split('T')[0]);
                                setAttendanceTypes(['class']);
                                setAttendanceModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              <CalendarCheck className="w-4 h-4" />
                            </button>

                            <button
                              title="تعديل"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(teacher, 'servant');
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
                                  // Call the secure RPC function to completely delete the user and clean up dependencies
                                  const { error } = await supabase.rpc('delete_servant_completely', { 
                                    target_user_id: teacher.id 
                                  });
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

      {/* Manual Attendance Modal */}
      {attendanceModalOpen && attendanceTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => !isSubmitting && setAttendanceModalOpen(false)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-border"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5 text-blue-700"/>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-blue-900">تسجيل حضور خادم</h3>
                <p className="text-sm text-blue-700 truncate max-w-[220px]">{attendanceTeacher.name}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">تاريخ الحضور</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:ring-2 focus:ring-primary outline-none text-foreground text-sm"
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">نوع الحدث</label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'class', label: 'حصة' },
                    { id: 'service_meeting', label: 'اجتماع خدمة' },
                    { id: 'liturgy', label: 'قداس' },
                    { id: 'communion', label: 'تناول' },
                    { id: 'confession', label: 'اعتراف' },
                  ].map(opt => {
                    const isChecked = attendanceTypes.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => toggleAttendanceType(opt.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isChecked
                            ? 'bg-primary text-white shadow-md ring-2 ring-primary/40'
                            : 'bg-muted/60 text-foreground hover:bg-muted border border-border'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold border transition-colors ${
                          isChecked ? 'bg-white text-primary border-white' : 'border-foreground/30'
                        }`}>
                          {isChecked ? '✓' : ''}
                        </span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex gap-3">
              <button
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    // Check for existing logs on this date for this servant
                    const { data: existingLogs, error: checkError } = await supabase
                      .from('servant_attendance_logs')
                      .select('meeting_type')
                      .eq('servant_id', attendanceTeacher.id)
                      .eq('attendance_date', attendanceDate);

                    if (checkError) throw checkError;

                    const existingSet = new Set((existingLogs || []).map((l: any) => l.meeting_type));

                    const TYPE_NAMES: Record<string, string> = {
                      class: 'حصة',
                      service_meeting: 'اجتماع خدمة',
                      liturgy: 'قداس',
                      communion: 'تناول',
                      confession: 'اعتراف'
                    };

                    const newlyRecorded: string[] = [];
                    const alreadyRecorded: string[] = [];

                    for (const type of attendanceTypes) {
                      if (existingSet.has(type)) {
                        alreadyRecorded.push(type);
                        continue;
                      }

                      const { error: insertError } = await supabase
                        .from('servant_attendance_logs')
                        .insert({
                          servant_id: attendanceTeacher.id,
                          scanned_by: currentServant?.id || null,
                          meeting_type: type,
                          attendance_date: attendanceDate
                        });

                      if (insertError) {
                        alreadyRecorded.push(type);
                      } else {
                        newlyRecorded.push(type);
                      }
                    }

                    if (newlyRecorded.length > 0) {
                      const recordedLabels = newlyRecorded.map(t => TYPE_NAMES[t] || t).join('، ');
                      let toastMsg = `تم تسجيل حضور الخادم ${attendanceTeacher.name}: ${recordedLabels}`;
                      if (alreadyRecorded.length > 0) {
                        const skippedLabels = alreadyRecorded.map(t => TYPE_NAMES[t] || t).join('، ');
                        toastMsg += ` (مسجل مسبقاً: ${skippedLabels})`;
                      }
                      toast.success(toastMsg);
                    } else if (alreadyRecorded.length > 0) {
                      const skippedLabels = alreadyRecorded.map(t => TYPE_NAMES[t] || t).join('، ');
                      toast.info(`تم تسجيل (${skippedLabels}) لهذا الخادم مسبقاً لهذا اليوم`);
                    }

                    setAttendanceModalOpen(false);
                  } catch (err: any) {
                    console.error('Manual servant attendance error:', err);
                    toast.error('حدث خطأ أثناء تسجيل الحضور');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-70"
              >
                {isSubmitting ? 'جاري التسجيل...' : 'تأكيد الحضور'}
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => setAttendanceModalOpen(false)}
                className="flex-1 bg-muted text-foreground py-3 rounded-xl font-medium hover:bg-muted/80 active:scale-95 transition-all disabled:opacity-70"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
