import { Search, Trash2, Coins, Edit, XCircle, User } from 'lucide-react';
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

export function ParticipantsList({ participants, onEdit, onManagePoints, onDelete }: ParticipantsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [items, setItems] = useState<Participant[]>(participants);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const filteredParticipants = items.filter(p => {
    const normalizedSearchQuery = normalizeArabicText(searchQuery);
    const normalizedName = normalizeArabicText(p.name || p.full_name || '');
    const normalizedId = normalizeArabicText(p.participant_id || p.id || '');

    const matchesSearch = !searchQuery ||
                         normalizedName.includes(normalizedSearchQuery) ||
                         normalizedId.includes(normalizedSearchQuery);

    const pData = p.data || {};
    const matchesGender = !filterGender || pData.gender === filterGender;

    const pStage = pData.educationStage || pData.educational_stage || '';
    const pYear = pData.educationYear || pData.academic_year || '';
    const calculatedClass = getParticipantClass(pStage, pYear);
    const matchesClass = !filterClass || calculatedClass === filterClass;

    const pArea = pData.area || pData.address_area || '';
    const matchesArea = !filterArea || pArea === filterArea;

    return matchesSearch && matchesGender && matchesClass && matchesArea;
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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      participant.attended ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <User className={`w-5 h-5 ${
                        participant.attended ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{participant.name}</span>
                        {participant.attended && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
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
                  title="إدارة النقاط"
                  onClick={(e) => { e.stopPropagation(); onManagePoints?.(participant); }}
                  className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                >
                  <Coins className="w-4 h-4" />
                </button>

                <button
                  title="تعديل"
                  onClick={(e) => { e.stopPropagation(); onEdit?.(participant); }}
                  className="p-2 rounded-lg bg-white/10 text-slate-700 hover:bg-muted"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  title="حذف"
                  onClick={(e) => { e.stopPropagation(); handleDelete(participant); }}
                  className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                  disabled={deletingId === participant.id}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
