import { useState, useEffect } from 'react';
import { ArrowRight, Trash2, Calendar, BookOpen, AlertCircle, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface SessionData {
  date: string;
  logIds: string[];
  attendanceCount: number;
}

interface StageSessions {
  stageKey: string;
  stageLabel: string;
  sessions: SessionData[];
}

interface SessionsManagementPageProps {
  onBack: () => void;
}

const CLASS_LABELS: Record<string, string> = {
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

const getStageKey = (stageStr: string, yearStr: string) => {
  const s = String(stageStr || '').toLowerCase();
  const y = String(yearStr || '').toLowerCase();

  if (s === 'kg' || s.includes('حضانة')) return 'kg';
  if (s === 'preparatory' || s.includes('إعدادي')) return 'preparatory';
  if (s === 'secondary' || s.includes('ثانوي')) return 'secondary';
  if (s === 'university' || s === 'graduate' || s.includes('جامع') || s.includes('خريج')) return 'university_graduate';
  
  if (s === 'primary' || s.includes('ابتدائي')) {
    if (y.includes('اول') || y.includes('أول') || y.includes('ثاني') || y.includes('1') || y.includes('2')) return 'primary_12';
    if (y.includes('ثالث') || y.includes('رابع') || y.includes('3') || y.includes('4')) return 'primary_34';
    if (y.includes('خامس') || y.includes('سادس') || y.includes('5') || y.includes('6')) return 'primary_56';
    return 'primary';
  }

  return 'other';
};

export function SessionsManagementPage({ onBack }: SessionsManagementPageProps) {
  const [stageSessions, setStageSessions] = useState<StageSessions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      // Fetch all attendance logs joined with their participant's stage
      const { data, error } = await supabase
        .from('attendance_logs')
        .select(`
          id,
          attendance_date,
          participants!inner ( educational_stage, academic_year, class_or_job )
        `);

      if (error) throw error;

      // Group by Stage -> Date -> logIds
      const stageMap: Record<string, Record<string, string[]>> = {};

      data?.forEach((log: any) => {
        const stageStr = log.participants?.educational_stage || log.participants?.class_or_job || '';
        const yearStr = log.participants?.academic_year || '';
        const stageKey = getStageKey(stageStr, yearStr);
        const date = log.attendance_date;

        if (!stageMap[stageKey]) stageMap[stageKey] = {};
        if (!stageMap[stageKey][date]) stageMap[stageKey][date] = [];

        stageMap[stageKey][date].push(log.id);
      });
      // Convert to array format
      const formattedData: StageSessions[] = Object.keys(stageMap).map(key => {
        const sessionsArr = Object.keys(stageMap[key]).map(date => ({
          date,
          logIds: stageMap[key][date],
          attendanceCount: stageMap[key][date].length
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first

        return {
          stageKey: key,
          stageLabel: CLASS_LABELS[key] || CLASS_LABELS['other'],
          sessions: sessionsArr
        };
      }).filter(stage => stage.sessions.length > 0);

      // Sort stages according to CLASS_LABELS order
      const order = Object.keys(CLASS_LABELS);
      formattedData.sort((a, b) => order.indexOf(a.stageKey) - order.indexOf(b.stageKey));

      setStageSessions(formattedData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('حدث خطأ في تحميل الحصص');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDeleteSession = async (stageLabel: string, date: string, logIds: string[]) => {
    if (!confirm(`هل أنت متأكد من حذف حصة يوم ${date} لفصل ${stageLabel} نهائياً؟\nسيتم مسح غياب ${logIds.length} مخدوم ولن تحسب هذه الحصة في إحصائياتهم.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // Chunk deletion to avoid URL length limits in Supabase/PostgREST if a class is very large
      const chunkSize = 200;
      for (let i = 0; i < logIds.length; i += chunkSize) {
        const chunk = logIds.slice(i, i + chunkSize);
        const { error } = await supabase
          .from('attendance_logs')
          .delete()
          .in('id', chunk);
        
        if (error) throw error;
      }

      toast.success(`تم حذف حصة ${date} بنجاح`);
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform">
              <ArrowRight className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              إدارة الحصص
            </h2>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto pb-20">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3 text-blue-800">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>تنبيه هام:</strong> حذف أي حصة من هنا سيقوم بمسح سجلات الحضور الخاصة بها تماماً من قاعدة البيانات، ولن يتم احتساب هذا اليوم ضمن إجمالي أيام الحضور للمخدومين في هذا الفصل.
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">جاري تحميل الحصص...</div>
        ) : stageSessions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border">لا توجد أي حصص مسجلة حالياً</div>
        ) : (
          <div className="space-y-6">
            {stageSessions.map((stage) => (
              <div key={stage.stageKey} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="bg-muted/30 p-4 border-b border-border flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-foreground">{stage.stageLabel}</h3>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full mr-auto">
                    {stage.sessions.length} حصص
                  </span>
                </div>
                
                <div className="divide-y divide-border">
                  {stage.sessions.map((session) => (
                    <div key={session.date} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground" dir="ltr">{session.date}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            تم تسجيل غياب <span className="font-bold text-primary">{session.attendanceCount}</span> مخدوم
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteSession(stage.stageLabel, session.date, session.logIds)}
                        disabled={isDeleting}
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="حذف الحصة نهائياً"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
