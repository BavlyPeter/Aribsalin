import { Search, Trash2, Coins, Edit, XCircle, User, CalendarCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { normalizeArabicText } from '../../utils/textUtils';

interface Participant {
  id: string;
  participant_id?: string;
  dbId?: string;
  name: string;
  full_name?: string;
  points: number;
  attended: boolean;
  photo_url?: string;
  data?: {
    gender?: string;
    educationStage?: string;
    educational_stage?: string;
    educationYear?: string;
    academic_year?: string;
    area?: string;
    address_area?: string;
  };
  onClick?: () => void;
}

interface ParticipantsListProps {
  participants: Participant[];
  onEdit?: (p: Participant) => void;
  onManagePoints?: (p: Participant) => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  onManualAttendance?: (participantId: string, date: string) => void;
}

const CLASSES = [
  { id: 'kg', label: 'حضانة' },
  { id: 'primary_12', label: 'ابتدائي (الأول والثاني)' },
  { id: 'primary_34', label: 'ابتدائي (الثالث والرابع)' },
  { id: 'primary_56', label: 'ابتدائي (الخامس والسادس)' },
  { id: 'preparatory', label: 'إعدادي' },
  { id: 'secondary', label: 'ثانوي' },
  { id: 'university', label: 'جامعي' },
  { id: 'graduate', label: 'خريجين' }
];

// Helper to map DB stage/year to our specific classes
const getParticipantClass = (stage: string, year: string) => {
  if (!stage) return '';
  const s = stage.toLowerCase();
  if (s === 'kg' || s === 'حضانة') return 'kg';
  if (s === 'preparatory' || s === 'إعدادي') return 'preparatory';
  if (s === 'secondary' || s === 'ثانوي') return 'secondary';
  if (s === 'university' || s === 'جامعي') return 'university';
  if (s === 'graduate' || s === 'خريجين') return 'graduate';

  if (s === 'primary' || s === 'ابتدائي') {
    if (!year) return 'primary_12';
    if (year.includes('الأول') || year.includes('الثاني') || year.includes('1') || year.includes('2')) return 'primary_12';
    if (year.includes('الثالث') || year.includes('الرابع') || year.includes('3') || year.includes('4')) return 'primary_34';
    if (year.includes('الخامس') || year.includes('السادس') || year.includes('5') || year.includes('6')) return 'primary_56';
    return 'primary_12';
  }
  return stage;
};

export function ParticipantsList({ 
  participants, 
  onEdit, 
  onManagePoints, 
  onDelete, 
  canEdit = true, 
  canDelete = true,
  onManualAttendance
}: ParticipantsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [items, setItems] = useState<Participant[]>(participants);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceParticipant, setAttendanceParticipant] = useState<Participant | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => setItems(participants), [participants]);

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

  const filteredParticipants = items.filter((p: any) => {
    // 1. Search Match
    const normalizedSearch = normalizeArabicText(searchQuery);
    const pName = normalizeArabicText(p.name || p.full_name || '');
    const pId = normalizeArabicText(p.participant_id || p.id || '');
    const matchesSearch = !searchQuery || pName.includes(normalizedSearch) || pId.includes(normalizedSearch);

    // Extract raw fields safely (checking both flat DB structure and nested data structure)
    const rawGender = String(p.gender || p.data?.gender || '').trim();
    const rawArea = String(p.address_area || p.area || p.data?.address_area || p.data?.area || '').trim();
    const rawStage = String(p.educational_stage || p.educationStage || p.data?.educational_stage || p.data?.educationStage || '').trim();
    const rawYear = String(p.academic_year || p.educationYear || p.data?.academic_year || p.data?.educationYear || '').trim();

    // 2. Gender Match (Map Arabic DB values to English Filter values)
    let mappedGender = rawGender;
    if (rawGender === 'ذكر' || rawGender === 'male') mappedGender = 'male';
    if (rawGender === 'أنثى' || rawGender === 'female') mappedGender = 'female';
    const matchesGender = !filterGender || mappedGender === filterGender;

    // 3. Area Match
    const matchesArea = !filterArea || rawArea === filterArea;

    // 4. Class / Stage Match
    let matchesClass = true;
    if (filterClass) {
      let calculatedClass = rawStage;
      if (rawStage.includes('حضانة') || rawStage === 'kg') {
        calculatedClass = 'kg';
      } else if (rawStage.includes('إعدادي') || rawStage === 'preparatory') {
        calculatedClass = 'preparatory';
      } else if (rawStage.includes('ثانوي') || rawStage === 'secondary') {
        calculatedClass = 'secondary';
      } else if (rawStage.includes('جامعي') || rawStage.includes('خريج') || rawStage === 'university') {
        calculatedClass = 'university';
      } else if (rawStage.includes('ابتدائي') || rawStage === 'primary') {
        if (rawYear.includes('أول') || rawYear.includes('ثاني') || rawYear.includes('1') || rawYear.includes('2')) {
          calculatedClass = 'primary_12';
        } else if (rawYear.includes('ثالث') || rawYear.includes('رابع') || rawYear.includes('3') || rawYear.includes('4')) {
          calculatedClass = 'primary_34';
        } else {
          calculatedClass = 'primary_56';
        }
      }
      matchesClass = (calculatedClass === filterClass);
    }

    return matchesSearch && matchesGender && matchesArea && matchesClass;
  });

  const handleDelete = async (record: Participant) => {
    const confirmed = window.confirm('هل أنت متأكد من حذف هذا السجل تماماً؟');
    if (!confirmed) return;
    try {
      const participantKey = record.dbId || record.id;
      setDeletingId(record.id);
      const { error } = await supabase.from('participants').delete().eq('id', participantKey);
      if (error) {
        toast.error('فشل الحذف');
        console.error(error);
        setDeletingId(null);
        return;
      }
      setItems(prev => prev.filter(p => p.id !== record.id));
      // notify parent to remove from its list as well
      onDelete?.(participantKey);
      toast.success('تم الحذف بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h3 className="mb-3 text-primary">قائمة المشاركين</h3>

        {/* Unified Search and Filter Panel */}
        <div className="mt-4 bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-2.5 bg-input-background rounded-xl border border-border focus:outline-none focus:border-primary text-sm"
            >
              <option value="">كل الفصول</option>
              {CLASSES.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.label}
                </option>
              ))}
            </select>

            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full px-4 py-2.5 bg-input-background rounded-xl border border-border focus:outline-none focus:border-primary text-sm"
            >
              <option value="">كل المناطق (أسوان)</option>
              {areas.map(area => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-4 py-2.5 bg-input-background rounded-xl border border-border focus:outline-none focus:border-primary text-sm"
            >
              <option value="">كل الأنواع</option>
              <option value="male">ذكور فقط</option>
              <option value="female">إناث فقط</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(filterGender || filterClass || filterArea) && (
            <button
              onClick={() => {
                setFilterGender('');
                setFilterClass('');
                setFilterArea('');
              }}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <XCircle className="w-4 h-4" />
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredParticipants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>لا توجد نتائج</p>
          </div>
        ) : (
          filteredParticipants.map(participant => (
            <div
              key={participant.id}
              className="w-full bg-card rounded-lg p-4 border border-border shadow-sm active:scale-[0.98] transition-transform text-right flex items-center"
            >
              <div className="flex-1 cursor-pointer" onClick={participant.onClick}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Status Indicator */}
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        participant.attended ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-200'
                      }`}
                      title={participant.attended ? 'حاضر اليوم' : 'لم يسجل حضور اليوم'}
                    />

                    {/* Avatar Image */}
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-primary/5 border-2 border-primary/10 flex items-center justify-center shrink-0">
                      {participant.photo_url || participant.data?.photo_url ? (
                        <img src={participant.photo_url || participant.data?.photo_url} alt={participant.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-primary/40" />
                      )}
                    </div>

                    <div className="flex flex-col items-start" dir="rtl">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{participant.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{participant.participant_id || participant.id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-lg">
                    <Coins className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
                    <span className="font-medium" style={{ color: 'var(--secondary)' }}>
                      {participant.points}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions - left side in RTL */}
              <div className="flex items-center gap-2 mr-4">
                <button
                  title="تسجيل حضور يدوي"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setAttendanceParticipant(participant);
                    setAttendanceDate(new Date().toISOString().split('T')[0]);
                    setAttendanceModalOpen(true);
                  }}
                  className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  <CalendarCheck className="w-4 h-4" />
                </button>

                <button
                  title="إدارة النقاط"
                  onClick={(e) => { e.stopPropagation(); onManagePoints?.(participant); }}
                  className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                >
                  <Coins className="w-4 h-4" />
                </button>

                {canEdit && (
                  <button
                    title="تعديل"
                    onClick={(e) => { e.stopPropagation(); onEdit?.(participant); }}
                    className="p-2 rounded-lg bg-white/10 text-slate-700 hover:bg-muted"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}

                {canDelete && (
                  <button
                    title="حذف"
                    onClick={(e) => { e.stopPropagation(); handleDelete(participant); }}
                    className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                    disabled={deletingId === participant.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Attendance Modal */}
      {attendanceModalOpen && attendanceParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setAttendanceModalOpen(false)}>
          <div className="bg-background rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-border" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">تسجيل حضور يدوي</h3>
                <p className="text-sm text-blue-700 truncate max-w-[200px]">{attendanceParticipant.name}</p>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">تاريخ الحضور</label>
                <input 
                  type="date" 
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:ring-2 focus:ring-blue-500 outline-none"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="p-4 border-t border-border flex gap-3">
              <button
                onClick={() => {
                  onManualAttendance?.(attendanceParticipant.dbId || attendanceParticipant.id, attendanceDate);
                  setAttendanceModalOpen(false);
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all"
              >
                تأكيد الحضور
              </button>
              <button
                onClick={() => setAttendanceModalOpen(false)}
                className="flex-1 bg-muted text-foreground py-3 rounded-xl font-medium hover:bg-muted/80 active:scale-95 transition-all"
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
