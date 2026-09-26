import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trash2, Calendar, BookOpen, AlertCircle, Users, Church, ChevronDown, ChevronLeft, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useFestivalStore } from '../store/useFestivalStore';

export type EventTab = 'class' | 'liturgy' | 'service_meeting';

export interface RawLog {
  logId: string;
  date: string;
  meetingType: string;
  attendeeType: 'student' | 'servant';
  participantId?: string;
  servantId?: string;
  name: string;
  code: string;
  photoUrl: string;
  stageKey: string;
  stageLabel: string;
}

interface SessionsManagementPageProps {
  onBack?: () => void;
}

const CLASS_LABELS: Record<string, string> = {
  'supervisors': 'أمناء الخدمة والمسؤولين',
  'kg': 'حضانة',
  'primary_12': 'ابتدائي (الأول والثاني)',
  'primary_34': 'ابتدائي (الثالث والرابع)',
  'primary_56': 'ابتدائي (الخامس والسادس)',
  'primary': 'ابتدائي (عام)',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university_graduate': 'جامعي وخريجين',
  'other': 'أخرى'
};

const STAGE_ORDER = Object.keys(CLASS_LABELS);

const getStageKey = (stageStr: string, yearStr: string = '') => {
  const s = String(stageStr || '').toLowerCase().trim();
  const y = String(yearStr || '').toLowerCase().trim();

  if (s === 'supervisors' || s.includes('أمين') || s.includes('امين')) return 'supervisors';
  if (['kg', 'primary_12', 'primary_34', 'primary_56', 'preparatory', 'secondary', 'university_graduate'].includes(s)) {
    return s;
  }

  if (s.includes('حضانة') || s.includes('kg')) return 'kg';
  if (s.includes('إعدادي') || s.includes('preparatory')) return 'preparatory';
  if (s.includes('ثانوي') || s.includes('secondary')) return 'secondary';
  if (s.includes('جامع') || s.includes('university') || s.includes('خريج') || s.includes('graduate')) return 'university_graduate';

  if (s.includes('ابتدائي') || s.includes('primary')) {
    if (y.includes('اول') || y.includes('أول') || y.includes('ثاني') || y.includes('1') || y.includes('2') || s.includes('1') || s.includes('2')) return 'primary_12';
    if (y.includes('ثالث') || y.includes('رابع') || y.includes('3') || y.includes('4') || s.includes('3') || s.includes('4')) return 'primary_34';
    if (y.includes('خامس') || y.includes('سادس') || y.includes('5') || y.includes('6') || s.includes('5') || s.includes('6')) return 'primary_56';
    return 'primary';
  }

  return 'other';
};

// Internal reusable component for rendering an attendee across all views
interface AttendeeCardProps {
  attendee: RawLog;
  onDelete: () => void;
  disabled?: boolean;
}

function AttendeeCard({ attendee, onDelete, disabled }: AttendeeCardProps) {
  return (
    <div className="p-2.5 bg-card rounded-xl border border-border flex items-center justify-between shadow-xs hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-border">
          {attendee.photoUrl ? (
            <img src={attendee.photoUrl} alt={attendee.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-foreground truncate">{attendee.name}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            {attendee.code && <span dir="ltr">{attendee.code}</span>}
            {attendee.attendeeType === 'servant' && (
              <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-[var(--foreground)] font-medium text-[9px]">
                خادم
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors shrink-0 disabled:opacity-50"
        title="إلغاء حضور هذا الفرد"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function SessionsManagementPage({ onBack }: SessionsManagementPageProps = {}) {
  const navigate = useNavigate();
  const { fetchData, currentServant, viewerRole } = useFestivalStore();

  const userRole = currentServant?.role || viewerRole || 'normal';
  const canManageServiceMeetings = ['admin', 'supervisor', 'developer'].includes(userRole);

  const [activeTab, setActiveTab] = useState<EventTab>('class');
  const [logs, setLogs] = useState<RawLog[]>([]);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      fetchData();
      navigate('/dashboard');
    }
  };

  const toggleStage = (stageKey: string) => {
    setExpandedStages(prev => {
      const next = new Set(prev);
      if (next.has(stageKey)) next.delete(stageKey);
      else next.add(stageKey);
      return next;
    });
  };

  const toggleDate = (dateKey: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  };

  // 1. Unified State & Data Fetching
  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const mappedLogs: RawLog[] = [];

      if (activeTab === 'service_meeting') {
        // ONLY fetch from servant_attendance_logs where meeting_type = 'service_meeting'
        const { data: servantLogsData, error: servantError } = await supabase
          .from('servant_attendance_logs')
          .select(`
            id,
            attendance_date,
            meeting_type,
            servant_id,
            servants!servant_attendance_logs_servant_id_fkey!inner ( id, full_name, teacher_id, photo_url, class_stage, role )
          `)
          .eq('meeting_type', 'service_meeting');

        if (servantError) throw servantError;

        servantLogsData?.forEach((log: any) => {
          const s = log.servants;
          const stageKey = s?.role === 'admin' ? 'supervisors' : getStageKey(s?.class_stage || '', '');
          mappedLogs.push({
            logId: log.id,
            date: log.attendance_date,
            meetingType: 'service_meeting',
            attendeeType: 'servant',
            servantId: s?.id || log.servant_id,
            name: s?.full_name || 'بدون اسم',
            code: s?.teacher_id || '',
            photoUrl: s?.photo_url || '',
            stageKey,
            stageLabel: CLASS_LABELS[stageKey] || CLASS_LABELS['other']
          });
        });
      } else {
        // ActiveTab is 'class' or 'liturgy': fetch students from attendance_logs and servants from servant_attendance_logs
        let studentQuery = supabase
          .from('attendance_logs')
          .select(`
            id,
            attendance_date,
            meeting_type,
            participant_id,
            participants!inner ( id, full_name, participant_id, photo_url, educational_stage, academic_year, class_or_job )
          `);

        if (activeTab === 'class') {
          studentQuery = studentQuery.or('meeting_type.eq.class,meeting_type.is.null');
        } else {
          studentQuery = studentQuery.eq('meeting_type', 'liturgy');
        }

        let servantQuery = supabase
          .from('servant_attendance_logs')
          .select(`
            id,
            attendance_date,
            meeting_type,
            servant_id,
            servants!servant_attendance_logs_servant_id_fkey!inner ( id, full_name, teacher_id, photo_url, class_stage, role )
          `);

        if (activeTab === 'class') {
          servantQuery = servantQuery.or('meeting_type.eq.class,meeting_type.is.null');
        } else {
          servantQuery = servantQuery.eq('meeting_type', 'liturgy');
        }

        const [{ data: studentLogsData, error: studentError }, { data: servantLogsData, error: servantError }] = await Promise.all([
          studentQuery,
          servantQuery
        ]);

        if (studentError) throw studentError;
        if (servantError) throw servantError;

        // Map student logs
        studentLogsData?.forEach((log: any) => {
          const p = log.participants;
          const stageStr = p?.educational_stage || p?.class_or_job || '';
          const yearStr = p?.academic_year || '';
          const stageKey = getStageKey(stageStr, yearStr);

          mappedLogs.push({
            logId: log.id,
            date: log.attendance_date,
            meetingType: log.meeting_type || 'class',
            attendeeType: 'student',
            participantId: p?.id || log.participant_id,
            name: p?.full_name || 'بدون اسم',
            code: p?.participant_id || '',
            photoUrl: p?.photo_url || '',
            stageKey,
            stageLabel: CLASS_LABELS[stageKey] || CLASS_LABELS['other']
          });
        });

        // Map servant logs
        servantLogsData?.forEach((log: any) => {
          const s = log.servants;
          const stageKey = s?.role === 'admin' ? 'supervisors' : getStageKey(s?.class_stage || '', '');

          mappedLogs.push({
            logId: log.id,
            date: log.attendance_date,
            meetingType: log.meeting_type || 'class',
            attendeeType: 'servant',
            servantId: s?.id || log.servant_id,
            name: s?.full_name || 'بدون اسم',
            code: s?.teacher_id || '',
            photoUrl: s?.photo_url || '',
            stageKey,
            stageLabel: CLASS_LABELS[stageKey] || CLASS_LABELS['other']
          });
        });
      }

      setLogs(mappedLogs);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('حدث خطأ في تحميل الأحداث');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setExpandedStages(new Set());
    setExpandedDates(new Set());
    fetchSessions();
  }, [activeTab]);

  // 2. View Models (useMemo Transformers)

  // 2.1 classData: Groups by Stage -> Date -> { students: RawLog[], servants: RawLog[] }
  const classData = useMemo(() => {
    if (activeTab !== 'class') return [];

    const stageMap: Record<string, Record<string, { students: RawLog[]; servants: RawLog[] }>> = {};

    logs.forEach(log => {
      const stage = log.stageKey || 'other';
      const date = log.date;

      if (!stageMap[stage]) stageMap[stage] = {};
      if (!stageMap[stage][date]) stageMap[stage][date] = { students: [], servants: [] };

      if (log.attendeeType === 'servant') {
        stageMap[stage][date].servants.push(log);
      } else {
        stageMap[stage][date].students.push(log);
      }
    });

    const result = Object.keys(stageMap).map(stageKey => {
      const dates = Object.keys(stageMap[stageKey]).map(date => {
        const servants = stageMap[stageKey][date].servants;
        const students = stageMap[stageKey][date].students;
        const allLogs = [...servants, ...students];
        return {
          date,
          servants,
          students,
          allLogs,
          totalCount: allLogs.length
        };
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const totalAttendeesCount = dates.reduce((acc, d) => acc + d.totalCount, 0);

      return {
        stageKey,
        stageLabel: CLASS_LABELS[stageKey] || CLASS_LABELS['other'],
        dates,
        totalAttendeesCount
      };
    }).filter(stage => stage.dates.length > 0);

    result.sort((a, b) => {
      const idxA = STAGE_ORDER.indexOf(a.stageKey);
      const idxB = STAGE_ORDER.indexOf(b.stageKey);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    });

    return result;
  }, [logs, activeTab]);

  // 2.2 liturgyData: Groups by Date -> { servants: RawLog[], studentStages: { stageLabel: string, students: RawLog[] }[] }
  const liturgyData = useMemo(() => {
    if (activeTab !== 'liturgy') return [];

    const dateMap: Record<string, { servants: RawLog[]; studentMap: Record<string, RawLog[]> }> = {};

    logs.forEach(log => {
      const date = log.date;
      if (!dateMap[date]) {
        dateMap[date] = { servants: [], studentMap: {} };
      }

      if (log.attendeeType === 'servant') {
        dateMap[date].servants.push(log);
      } else {
        const stage = log.stageKey || 'other';
        if (!dateMap[date].studentMap[stage]) {
          dateMap[date].studentMap[stage] = [];
        }
        dateMap[date].studentMap[stage].push(log);
      }
    });

    const result = Object.keys(dateMap).map(date => {
      const servants = dateMap[date].servants;
      const studentStages = Object.keys(dateMap[date].studentMap).map(stageKey => ({
        stageKey,
        stageLabel: CLASS_LABELS[stageKey] || CLASS_LABELS['other'],
        students: dateMap[date].studentMap[stageKey]
      })).filter(s => s.students.length > 0);

      studentStages.sort((a, b) => {
        const idxA = STAGE_ORDER.indexOf(a.stageKey);
        const idxB = STAGE_ORDER.indexOf(b.stageKey);
        return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
      });

      const allStudents = studentStages.flatMap(s => s.students);
      const allLogs = [...servants, ...allStudents];

      return {
        date,
        servants,
        studentStages,
        allLogs,
        totalCount: allLogs.length
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [logs, activeTab]);

  // 2.3 serviceMeetingData: Groups by Date -> Stages -> servants: RawLog[]
  const serviceMeetingData = useMemo(() => {
    if (activeTab !== 'service_meeting') return [];

    const dateMap: Record<string, Record<string, RawLog[]>> = {};

    logs.forEach(log => {
      const date = log.date;
      const stage = log.stageKey || 'other';

      if (!dateMap[date]) dateMap[date] = {};
      if (!dateMap[date][stage]) dateMap[date][stage] = [];

      dateMap[date][stage].push(log);
    });

    const result = Object.keys(dateMap).map(date => {
      const stages = Object.keys(dateMap[date]).map(stageKey => ({
        stageKey,
        stageLabel: CLASS_LABELS[stageKey] || CLASS_LABELS['other'],
        servants: dateMap[date][stageKey]
      })).filter(s => s.servants.length > 0); // Do not render stages with 0 attendees

      stages.sort((a, b) => {
        const idxA = STAGE_ORDER.indexOf(a.stageKey);
        const idxB = STAGE_ORDER.indexOf(b.stageKey);
        return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
      });

      const allLogs = stages.flatMap(s => s.servants);

      return {
        date,
        stages,
        allLogs,
        totalCount: allLogs.length
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [logs, activeTab]);

  // 3. Unified Deletion Logic
  const handleDeleteBulk = async (logsToDelete: RawLog[], confirmMsg: string) => {
    if (!logsToDelete || logsToDelete.length === 0) return;
    if (!confirm(confirmMsg)) return;

    setIsDeleting(true);
    try {
      const studentLogs = logsToDelete.filter(l => l.attendeeType === 'student');
      const servantLogs = logsToDelete.filter(l => l.attendeeType === 'servant');

      // 1. Process Student Logs
      if (studentLogs.length > 0) {
        // If class attendance, deduct 10 points from participants balance and record points transaction
        const classStudentLogs = studentLogs.filter(l => l.meetingType === 'class');
        for (const log of classStudentLogs) {
          if (!log.participantId) continue;
          try {
            const { data: pData } = await supabase
              .from('participants')
              .select('points_balance')
              .eq('id', log.participantId)
              .single();

            const current = pData?.points_balance || 0;
            const newBalance = Math.max(0, current - 10);

            await supabase
              .from('participants')
              .update({ points_balance: newBalance })
              .eq('id', log.participantId);

            await supabase
              .from('points_transactions')
              .insert({
                participant_id: log.participantId,
                servant_id: currentServant?.id || null,
                transaction_type: 'deduction',
                points_amount: 10,
                description: `إلغاء مكافأة حضور حصة ${log.stageLabel} يوم ${log.date}`
              });
          } catch (pErr) {
            console.error('Error updating participant balance during deletion:', pErr);
          }
        }

        // Batch delete from attendance_logs in chunks of 200
        const studentLogIds = studentLogs.map(l => l.logId);
        const chunkSize = 200;
        for (let i = 0; i < studentLogIds.length; i += chunkSize) {
          const chunk = studentLogIds.slice(i, i + chunkSize);
          const { error: delErr } = await supabase
            .from('attendance_logs')
            .delete()
            .in('id', chunk);

          if (delErr) throw delErr;
        }
      }

      // 2. Process Servant Logs
      if (servantLogs.length > 0) {
        const servantLogIds = servantLogs.map(l => l.logId);
        const chunkSize = 200;
        for (let i = 0; i < servantLogIds.length; i += chunkSize) {
          const chunk = servantLogIds.slice(i, i + chunkSize);
          const { error: delErr } = await supabase
            .from('servant_attendance_logs')
            .delete()
            .in('id', chunk);

          if (delErr) throw delErr;
        }
      }

      toast.success('تم حذف السجلات بنجاح');
      await fetchData();
      await fetchSessions();
    } catch (err: any) {
      console.error('Error deleting logs:', err);
      toast.error(`حدث خطأ أثناء الحذف: ${err?.message || 'خطأ غير معروف'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingle = (log: RawLog) => {
    const isClass = log.meetingType === 'class';
    const isLiturgy = log.meetingType === 'liturgy';
    const eventName = isClass ? 'حصة' : isLiturgy ? 'قداس' : 'اجتماع خدمة';
    const attendeeDesc = log.attendeeType === 'servant' ? 'الخادم' : 'المخدوم';
    const pointsDeductMsg = (log.attendeeType === 'student' && isClass) ? '\nسيتم خصم 10 نقاط من رصيد المشارك.' : '';
    const confirmMsg = `هل أنت متأكد من حذف حضور ${attendeeDesc} "${log.name}" في ${eventName} يوم ${log.date}؟${pointsDeductMsg}`;
    return handleDeleteBulk([log], confirmMsg);
  };

  const tabs: { id: EventTab; label: string; icon: any }[] = [
    { id: 'class', label: 'الحصص', icon: BookOpen },
    { id: 'liturgy', label: 'القداسات', icon: Church },
    ...(canManageServiceMeetings ? [{ id: 'service_meeting' as const, label: 'اجتماعات الخدمة', icon: Users }] : []),
  ];

  const isEmpty =
    (activeTab === 'class' && classData.length === 0) ||
    (activeTab === 'liturgy' && liturgyData.length === 0) ||
    (activeTab === 'service_meeting' && serviceMeetingData.length === 0);

  return (
    <div className="min-h-screen bg-background pb-12" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform" title="الرجوع">
              <ArrowRight className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              إدارة الأحداث
            </h2>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto space-y-5">
        {/* Top-Level Tabs */}
        <div className="bg-card p-1.5 rounded-2xl border border-border flex gap-1 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Alert Banner */}
        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 rounded-xl p-4 flex gap-3 text-blue-900 dark:text-blue-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <div className="text-xs leading-relaxed">
            {activeTab === 'class' && (
              <>
                <strong>تنبيه هام:</strong> حذف أي حصة سيقوم بمسح سجلات الحضور الخاصة بها وخصم 10 نقاط من كل مخدوم حضرها، ولن تحسب في نسبة حضور المخدومين.
              </>
            )}
            {activeTab === 'liturgy' && (
              <>
                <strong>معلومة:</strong> حذف أي قداس سيقوم بمسح سجلات حضور القداس الخاصة بالمخدومين والخدام دون التأثير على رصيد نقاطهم.
              </>
            )}
            {activeTab === 'service_meeting' && (
              <>
                <strong>معلومة:</strong> حذف أي اجتماع خدمة سيقوم بمسح سجلات حضور الخدام المسجلين في هذا الاجتماع.
              </>
            )}
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">جاري تحميل الأحداث...</div>
        ) : isEmpty ? (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
            لا توجد أي سجلات مسجلة لـ {tabs.find(t => t.id === activeTab)?.label} حالياً
          </div>
        ) : (
          <div>
            {/* 4.1 UI for 'class' (الحصص) */}
            {activeTab === 'class' && (
              <div className="space-y-4">
                {classData.map((stage) => {
                  const isStageExpanded = expandedStages.has(stage.stageKey);

                  return (
                    <div key={stage.stageKey} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                      {/* Top header: Stage name */}
                      <button
                        type="button"
                        onClick={() => toggleStage(stage.stageKey)}
                        className="w-full bg-muted/30 p-4 border-b border-border flex items-center justify-between hover:bg-muted/50 transition-colors text-right"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-foreground">{stage.stageLabel}</h3>
                            <span className="text-xs text-muted-foreground">
                              {stage.dates.length} {stage.dates.length === 1 ? 'تاريخ مسجل' : 'تواريخ مسجلة'} • {stage.totalAttendeesCount} إجمالي الحضور
                            </span>
                          </div>
                        </div>
                        <div className="p-1 rounded-lg text-muted-foreground">
                          {isStageExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </div>
                      </button>

                      {/* Expand to show Dates */}
                      {isStageExpanded && (
                        <div className="divide-y divide-border">
                          {stage.dates.map((dateSession) => {
                            const dateKey = `${stage.stageKey}_${dateSession.date}`;
                            const isDateExpanded = expandedDates.has(dateKey);

                            return (
                              <div key={dateSession.date} className="bg-card transition-colors">
                                {/* Date Row Header */}
                                <div className="p-4 flex items-center justify-between hover:bg-muted/10">
                                  <button
                                    type="button"
                                    onClick={() => toggleDate(dateKey)}
                                    className="flex-1 flex items-center gap-3 text-right"
                                  >
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                      <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="font-bold text-foreground text-sm" dir="ltr">{dateSession.date}</div>
                                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                                        <span>خدام: <strong className="text-primary">{dateSession.servants.length}</strong></span>
                                        <span>•</span>
                                        <span>مخدومين: <strong className="text-primary">{dateSession.students.length}</strong></span>
                                        <span>•</span>
                                        <span className="text-primary hover:underline flex items-center gap-0.5">
                                          {isDateExpanded ? 'إخفاء الحاضرين' : 'عرض قائمة الحاضرين'}
                                          {isDateExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                                        </span>
                                      </div>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => handleDeleteBulk(
                                      dateSession.allLogs,
                                      `هل أنت متأكد من حذف حصة يوم ${dateSession.date} لمرحلة ${stage.stageLabel} بالكامل؟ (${dateSession.totalCount} حضور)${dateSession.students.length > 0 ? '\nسيتم خصم 10 نقاط من كل مخدوم حضر الحصة.' : ''}`
                                    )}
                                    className="p-2.5 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 shrink-0 mr-2"
                                    title="حذف هذا التاريخ بالكامل"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Expand Date to show 2 distinct sections */}
                                {isDateExpanded && (
                                  <div className="px-4 pb-4 pt-2 bg-muted/15 border-t border-dashed border-border space-y-4">
                                    {/* Section 1: خدام الفصل (Count) */}
                                    <div>
                                      <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                                        خدام الفصل ({dateSession.servants.length}):
                                      </div>
                                      {dateSession.servants.length === 0 ? (
                                        <div className="text-xs text-muted-foreground py-2 px-3 bg-card/60 rounded-xl border border-dashed border-border">
                                          لا يوجد خدام مسجلين في هذا اليوم
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                          {dateSession.servants.map(servant => (
                                            <AttendeeCard
                                              key={servant.logId}
                                              attendee={servant}
                                              onDelete={() => handleDeleteSingle(servant)}
                                              disabled={isDeleting}
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Section 2: المخدومين (Count) */}
                                    <div>
                                      <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                                        المخدومين ({dateSession.students.length}):
                                      </div>
                                      {dateSession.students.length === 0 ? (
                                        <div className="text-xs text-muted-foreground py-2 px-3 bg-card/60 rounded-xl border border-dashed border-border">
                                          لا يوجد مخدومين مسجلين في هذا اليوم
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                          {dateSession.students.map(student => (
                                            <AttendeeCard
                                              key={student.logId}
                                              attendee={student}
                                              onDelete={() => handleDeleteSingle(student)}
                                              disabled={isDeleting}
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4.2 UI for 'liturgy' (القداسات) */}
            {activeTab === 'liturgy' && (
              <div className="space-y-4">
                {liturgyData.map((liturgy) => {
                  const isDateExpanded = expandedDates.has(liturgy.date);

                  return (
                    <div key={liturgy.date} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                      {/* Top header: Liturgy Date */}
                      <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <button
                          type="button"
                          onClick={() => toggleDate(liturgy.date)}
                          className="flex-1 flex items-center gap-3 text-right"
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                            <Church className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-base" dir="ltr">{liturgy.date}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>خدام: <strong className="text-primary">{liturgy.servants.length}</strong></span>
                              <span>•</span>
                              <span>مخدومين: <strong className="text-primary">{liturgy.allLogs.length - liturgy.servants.length}</strong></span>
                              <span>•</span>
                              <span>إجمالي: <strong className="text-primary">{liturgy.totalCount}</strong></span>
                              <span>•</span>
                              <span className="text-primary hover:underline flex items-center gap-0.5">
                                {isDateExpanded ? 'إخفاء الحاضرين' : 'عرض قائمة الحاضرين'}
                                {isDateExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                              </span>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDeleteBulk(
                            liturgy.allLogs,
                            `هل أنت متأكد من حذف قداس يوم ${liturgy.date} بالكامل؟ (${liturgy.totalCount} حضور)\n(لن يتم خصم نقاط)`
                          )}
                          className="p-2.5 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 shrink-0 mr-2"
                          title="حذف هذا القداس بالكامل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Expand to show 2 distinct sections */}
                      {isDateExpanded && (
                        <div className="p-4 bg-muted/15 space-y-5">
                          {/* Section 1: الخدام (Count) */}
                          <div>
                            <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-secondary"></span>
                              الخدام ({liturgy.servants.length}):
                            </div>
                            {liturgy.servants.length === 0 ? (
                              <div className="text-xs text-muted-foreground py-2 px-3 bg-card/60 rounded-xl border border-dashed border-border">
                                لا يوجد خدام مسجلين في هذا القداس
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {liturgy.servants.map(servant => (
                                  <AttendeeCard
                                    key={servant.logId}
                                    attendee={servant}
                                    onDelete={() => handleDeleteSingle(servant)}
                                    disabled={isDeleting}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Section 2: المخدومين (Count) -> Map studentStages */}
                          <div className="space-y-4">
                            <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-primary"></span>
                              المخدومين ({liturgy.allLogs.length - liturgy.servants.length}):
                            </div>
                            {liturgy.studentStages.length === 0 ? (
                              <div className="text-xs text-muted-foreground py-2 px-3 bg-card/60 rounded-xl border border-dashed border-border">
                                لا يوجد مخدومين مسجلين في هذا القداس
                              </div>
                            ) : (
                              liturgy.studentStages.map(stg => (
                                <div key={stg.stageKey} className="bg-card/70 p-3.5 rounded-xl border border-border/70 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Users className="w-4 h-4 text-primary" />
                                      <h4 className="text-xs font-bold text-foreground">
                                        {stg.stageLabel} ({stg.students.length})
                                      </h4>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {stg.students.map(student => (
                                      <AttendeeCard
                                        key={student.logId}
                                        attendee={student}
                                        onDelete={() => handleDeleteSingle(student)}
                                        disabled={isDeleting}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4.3 UI for 'service_meeting' (اجتماعات الخدمة) */}
            {activeTab === 'service_meeting' && (
              <div className="space-y-4">
                {serviceMeetingData.map((meeting) => {
                  const isDateExpanded = expandedDates.has(meeting.date);

                  return (
                    <div key={meeting.date} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                      {/* Top header: Meeting Date */}
                      <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <button
                          type="button"
                          onClick={() => toggleDate(meeting.date)}
                          className="flex-1 flex items-center gap-3 text-right"
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-base" dir="ltr">{meeting.date}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>إجمالي الخدام الحاضرين: <strong className="text-primary">{meeting.totalCount}</strong></span>
                              <span>•</span>
                              <span>مراحل مسجلة: <strong className="text-primary">{meeting.stages.length}</strong></span>
                              <span>•</span>
                              <span className="text-primary hover:underline flex items-center gap-0.5">
                                {isDateExpanded ? 'إخفاء الحاضرين' : 'عرض قائمة الحاضرين'}
                                {isDateExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                              </span>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDeleteBulk(
                            meeting.allLogs,
                            `هل أنت متأكد من حذف اجتماع خدمة يوم ${meeting.date} بالكامل؟ (${meeting.totalCount} خادم)`
                          )}
                          className="p-2.5 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 shrink-0 mr-2"
                          title="حذف هذا الاجتماع بالكامل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Expand to show list of Stages (No 0-attendee stages) */}
                      {isDateExpanded && (
                        <div className="p-4 bg-muted/15 space-y-4">
                          {meeting.stages.map((stg) => (
                            <div key={stg.stageKey} className="bg-card/80 p-3.5 rounded-xl border border-border/70 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                  <h4 className="text-xs font-bold text-foreground">
                                    {stg.stageLabel} - {stg.servants.length} حضور
                                  </h4>
                                </div>

                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => handleDeleteBulk(
                                    stg.servants,
                                    `هل أنت متأكد من حذف حضور مرحلة ${stg.stageLabel} في اجتماع خدمة يوم ${meeting.date}؟ (${stg.servants.length} خادم)`
                                  )}
                                  className="p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors text-[11px] flex items-center gap-1"
                                  title="حذف حضور هذه المرحلة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>حذف المرحلة</span>
                                </button>
                              </div>

                              {/* Servants mapped underneath */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {stg.servants.map(servant => (
                                  <AttendeeCard
                                    key={servant.logId}
                                    attendee={servant}
                                    onDelete={() => handleDeleteSingle(servant)}
                                    disabled={isDeleting}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
