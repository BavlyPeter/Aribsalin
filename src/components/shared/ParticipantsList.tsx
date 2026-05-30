import { Search, Trash2, Coins, Edit, CheckCircle2, XCircle, Filter, User } from 'lucide-react';
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

export function ParticipantsList({ participants, onEdit, onManagePoints, onDelete }: ParticipantsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Participant[]>(participants);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterGender, setFilterGender] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterArea, setFilterArea] = useState('');

  const ASWAN_AREAS = ['السيل', 'كيما', 'الصداقة', 'المحمودية', 'أطلس', 'العقاد', 'الكورنيش', 'الكرور', 'الشيخ هارون', 'أخرى'];
  const EDUCATION_STAGES = [
    { value: 'kg', label: 'حضانة' },
    { value: 'primary', label: 'ابتدائي' },
    { value: 'preparatory', label: 'إعدادي' },
    { value: 'secondary', label: 'ثانوي' },
    { value: 'university', label: 'جامعي' },
    { value: 'graduate', label: 'خريجين' }
  ];

  useEffect(() => setItems(participants), [participants]);

  const filteredParticipants = participants.filter(p => {
    // 1. Tolerant Search (existing logic)
    const normalizedSearchQuery = normalizeArabicText(searchQuery);
    const normalizedName = normalizeArabicText(p.name || p.full_name || '');
    const normalizedId = normalizeArabicText(p.participant_id || p.id || '');

    const matchesSearch = !searchQuery ||
                         normalizedName.includes(normalizedSearchQuery) ||
                         normalizedId.includes(normalizedSearchQuery);

    // 2. Advanced Filters
    const pData = p.data || {};
    const matchesGender = !filterGender || pData.gender === filterGender;
    const matchesStage = !filterStage || pData.educationStage === filterStage || pData.educational_stage === filterStage;

    // Check year (handling both camelCase and snake_case from DB)
    const pYear = pData.educationYear || pData.academic_year || '';
    const matchesYear = !filterYear || pYear.includes(filterYear);

    // Check area (handling both cases)
    const pArea = pData.area || pData.address_area || '';
    const matchesArea = !filterArea || pArea === filterArea;

    return matchesSearch && matchesGender && matchesStage && matchesYear && matchesArea;
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

        {/* Search and Filter Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المشارك أو الرقم..."
              className="w-full pl-4 pr-10 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 flex items-center justify-center rounded-xl border transition-all ${
              isFilterOpen || filterGender || filterStage || filterArea || filterYear
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-input-background border-border text-muted-foreground hover:bg-muted'
            }`}
            title="تصفية متقدمة"
          >
            {isFilterOpen || filterGender || filterStage || filterArea || filterYear ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Filter className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-card p-4 rounded-xl border border-border">
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-3 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:border-primary text-sm"
            >
              <option value="">كل الأنواع</option>
              <option value="male">ذكور فقط</option>
              <option value="female">إناث فقط</option>
            </select>

            <select
              value={filterStage}
              onChange={(e) => { setFilterStage(e.target.value); setFilterYear(''); }}
              className="w-full px-3 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:border-primary text-sm"
            >
              <option value="">كل المراحل</option>
              {EDUCATION_STAGES.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:border-primary text-sm"
              disabled={!filterStage || filterStage === 'kg' || filterStage === 'graduate'}
            >
              <option value="">كل الصفوف</option>
              <option value="الصف الأول الابتدائي">الصف الأول / الفرقة الأولى</option>
              <option value="الصف الثاني الابتدائي">الصف الثاني / الفرقة الثانية</option>
              <option value="الصف الثالث الابتدائي">الصف الثالث / الفرقة الثالثة</option>
              <option value="الصف الرابع الابتدائي">الصف الرابع / الفرقة الرابعة</option>
              <option value="الصف الخامس الابتدائي">الصف الخامس / الفرقة الخامسة</option>
              <option value="الصف السادس الابتدائي">الصف السادس / الفرقة السادسة</option>
            </select>

            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full px-3 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:border-primary text-sm"
            >
              <option value="">كل المناطق (أسوان)</option>
              {ASWAN_AREAS.map(area => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            {/* Clear Filters Button (Shows only if a filter is active) */}
            {(filterGender || filterStage || filterArea || filterYear) && (
              <button
                onClick={() => {
                  setFilterGender('');
                  setFilterStage('');
                  setFilterYear('');
                  setFilterArea('');
                }}
                className="lg:col-span-4 flex items-center justify-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors text-sm font-medium mt-1"
              >
                <XCircle className="w-4 h-4" />
                مسح الفلاتر
              </button>
            )}
          </div>
        )}
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
