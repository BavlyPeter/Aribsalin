import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Search, Trash2, Coins, Edit, XCircle, User, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { normalizeArabicText } from '../utils/textUtils';
import { useFestivalStore } from '../store/useFestivalStore';
import { ManualPointsModal } from '../components/modals/ManualPointsModal';

export interface ParticipantItem {
  id: string;
  participant_id?: string;
  dbId?: string;
  name: string;
  full_name?: string;
  points: number;
  attended: boolean;
  photo_url?: string;
  data?: {
    fullName?: string;
    gender?: string;
    educationStage?: string;
    educational_stage?: string;
    educationYear?: string;
    academic_year?: string;
    studyOrWorkPlace?: string;
    confessionFather?: string;
    personalMobile?: string;
    fatherMobile?: string;
    motherMobile?: string;
    area?: string;
    address_area?: string;
    address?: string;
    dateOfBirth?: string;
    photo_url?: string;
  };
  onClick?: () => void;
}

export interface ParticipantsPageProps {
  participants?: ParticipantItem[];
  onBack?: () => void;
  onViewProfile?: (participantId: string) => void;
  onEdit?: (participant: ParticipantItem) => void;
  onEditRequest?: (participant: ParticipantItem) => void;
  onManagePoints?: (participant: ParticipantItem) => void;
  onDelete?: (id: string) => void;
  onDeleteParticipant?: (id: string) => void;
  onManualAttendance?: (participantId: string, date: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function ParticipantsPage({
  participants: propsParticipants,
  onBack,
  onViewProfile,
  onEdit,
  onEditRequest,
  onManagePoints,
  onDelete,
  onDeleteParticipant,
  onManualAttendance,
  canEdit: propsCanEdit,
  canDelete: propsCanDelete
}: ParticipantsPageProps = {}) {
  const navigate = useNavigate();
  const { participants: storeParticipants, currentServant, setParticipants, fetchData } = useFestivalStore();

  const userRole = currentServant?.role || 'normal';
  const canManage = ['admin', 'supervisor'].includes(userRole);
  const canEdit = propsCanEdit !== undefined ? propsCanEdit : canManage;
  const canDelete = propsCanDelete !== undefined ? propsCanDelete : canManage;

  const mappedStoreParticipants: ParticipantItem[] = useMemo(() => {
    return storeParticipants.map((p: any) => ({
      id: p.participant_id || p.id,
      participant_id: p.participant_id,
      dbId: p.id,
      name: p.name,
      points: p.points,
      attended: p.attended,
      data: p.data,
      photo_url: p.photo_url
    }));
  }, [storeParticipants]);

  const participants = propsParticipants || mappedStoreParticipants;

  const [items, setItems] = useState<ParticipantItem[]>(participants);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [pointsModalParticipant, setPointsModalParticipant] = useState<any | null>(null);

  const handleBack = onBack || (() => navigate('/dashboard'));
  const handleViewProfile = onViewProfile || ((id: string) => navigate(`/profile/${id}`));
  const handleEdit = onEdit || onEditRequest || ((rec: any) => navigate(`/registration?edit=${rec.dbId || rec.id}`));
  const handleDeleteCallback = onDelete || onDeleteParticipant;


  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceParticipant, setAttendanceParticipant] = useState<ParticipantItem | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Keep local state in sync if parent participants change
  useEffect(() => {
    setItems(participants);
  }, [participants]);

  // Dynamically extract unique Academic Years
  const uniqueYears = useMemo(() => {
    const set = new Set<string>();
    participants.forEach(p => {
      const year = p.data?.educationYear || p.data?.academic_year || (p as any).educationYear || (p as any).academic_year;
      if (year && typeof year === 'string' && year.trim()) {
        set.add(year.trim());
      }
    });
    return Array.from(set).sort();
  }, [participants]);

  // Dynamically extract unique Areas
  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    participants.forEach(p => {
      const area = p.data?.area || p.data?.address_area || (p as any).area || (p as any).address_area;
      if (area && typeof area === 'string' && area.trim()) {
        set.add(area.trim());
      }
    });
    return Array.from(set).sort();
  }, [participants]);

  // Filter participants based on active filters and search
  const filteredParticipants = items.filter((p: any) => {
    // 1. Search Query
    const normalizedSearch = normalizeArabicText(searchQuery);
    const pName = normalizeArabicText(p.name || p.full_name || '');
    const pId = normalizeArabicText(p.participant_id || p.id || '');
    const matchesSearch = !searchQuery || pName.includes(normalizedSearch) || pId.includes(normalizedSearch);

    // 2. Academic Year filter
    const rawYear = String(p.data?.educationYear || p.data?.academic_year || p.educationYear || p.academic_year || '').trim();
    const matchesYear = filterYear === 'all' || rawYear === filterYear;

    // 3. Gender filter
    const rawGender = String(p.gender || p.data?.gender || '').trim();
    let mappedGender = rawGender;
    if (rawGender === 'ذكر' || rawGender === 'male') mappedGender = 'male';
    if (rawGender === 'أنثى' || rawGender === 'female') mappedGender = 'female';
    const matchesGender = filterGender === 'all' || mappedGender === filterGender;

    // 4. Area filter
    const rawArea = String(p.address_area || p.area || p.data?.address_area || p.data?.area || '').trim();
    const matchesArea = filterArea === 'all' || rawArea === filterArea;

    return matchesSearch && matchesYear && matchesGender && matchesArea;
  });

  const handleDelete = async (record: ParticipantItem) => {
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
      setParticipants((prev: any[]) => prev.filter((p: any) => p.id !== participantKey && p.participant_id !== participantKey));
      handleDeleteCallback?.(participantKey);
      toast.success('تم الحذف بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8" dir="rtl">
      {/* Sticky Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform"
              title="الرجوع"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">قائمة المشاركين</h2>
          </div>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {filteredParticipants.length} مشارك
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search & Filters Panel */}
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم أو الرقم التعريفي..."
              className="w-full pl-4 pr-12 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm text-foreground"
            />
          </div>

          {/* Filters Grid: 3 Select Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Academic Year */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">السنة الدراسية</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
              >
                <option value="all">الكل</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">النوع</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
              >
                <option value="all">الكل</option>
                <option value="male">ذكور</option>
                <option value="female">إناث</option>
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">المنطقة</label>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
              >
                <option value="all">الكل</option>
                {uniqueAreas.map(area => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filterYear !== 'all' || filterGender !== 'all' || filterArea !== 'all' || searchQuery) && (
            <div className="flex justify-start">
              <button
                onClick={() => {
                  setFilterYear('all');
                  setFilterGender('all');
                  setFilterArea('all');
                  setSearchQuery('');
                }}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium active:scale-95"
              >
                <XCircle className="w-4 h-4" />
                <span>مسح الفلاتر</span>
              </button>
            </div>
          )}
        </div>

        {/* Participants List */}
        <div className="space-y-2">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-base font-medium">لا توجد نتائج مطابقة للبحث</p>
              <p className="text-xs mt-1">يرجى تعديل الفلاتر أو نص البحث للعثور على المشاركين</p>
            </div>
          ) : (
            filteredParticipants.map(participant => (
              <div
                key={participant.id}
                className="w-full bg-card rounded-xl p-4 border border-border shadow-sm active:scale-[0.99] transition-transform text-right flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left section in RTL (Avatar & Info) */}
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                  onClick={() => handleViewProfile(participant.dbId || participant.id)}
                >
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
                      <img
                        src={participant.photo_url || participant.data?.photo_url}
                        alt={participant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-primary/40" />
                    )}
                  </div>

                  {/* Name and ID */}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-foreground font-medium truncate max-w-full">{participant.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{participant.participant_id || participant.id}</span>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                  {/* Points Badge */}
                  <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-lg">
                    <Coins className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
                    <span className="font-medium text-sm" style={{ color: 'var(--secondary)' }}>
                      {participant.points}
                    </span>
                  </div>

                  {/* Manual Attendance */}
                  <button
                    title="تسجيل حضور يدوي"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttendanceParticipant(participant);
                      setAttendanceDate(new Date().toISOString().split('T')[0]);
                      setAttendanceModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <CalendarCheck className="w-4 h-4" />
                  </button>

                  {/* Manage Points */}
                  <button
                    title="إدارة النقاط"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onManagePoints) {
                        onManagePoints(participant);
                      } else {
                        setPointsModalParticipant(participant);
                      }
                    }}
                    className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    <Coins className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  {canEdit && (
                    <button
                      title="تعديل"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit?.(participant);
                      }}
                      className="p-2 rounded-lg bg-white/10 text-slate-700 hover:bg-muted transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete */}
                  {canDelete && (
                    <button
                      title="حذف"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(participant);
                      }}
                      className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
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
      </div>

      {/* Manual Attendance Modal */}
      {attendanceModalOpen && attendanceParticipant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setAttendanceModalOpen(false)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-border"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5 text-blue-700" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-blue-900">تسجيل حضور يدوي</h3>
                <p className="text-sm text-blue-700 truncate max-w-[220px]">{attendanceParticipant.name}</p>
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
                />
              </div>
            </div>

            <div className="p-4 border-t border-border flex gap-3">
              <button
                onClick={async () => {
                  const matched = storeParticipants.find((p: any) =>
                    p.id === attendanceParticipant.dbId ||
                    p.id === attendanceParticipant.id ||
                    p.participant_id === attendanceParticipant.participant_id ||
                    p.participant_id === attendanceParticipant.id
                  );
                  const targetCandidate = matched?.id || attendanceParticipant.dbId || attendanceParticipant.id;
                  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetCandidate);
                  let targetId = targetCandidate;
                  if (!isUuid) {
                    const fallback = storeParticipants.find((p: any) => p.participant_id === targetCandidate || p.id === targetCandidate);
                    if (fallback?.id) {
                      targetId = fallback.id;
                    }
                  }

                  if (onManualAttendance) {
                    onManualAttendance(targetId, attendanceDate);
                  } else {
                    try {
                      const { data: existingAttendance, error: checkError } = await supabase
                        .from('attendance_logs')
                        .select('id')
                        .eq('participant_id', targetId)
                        .eq('attendance_date', attendanceDate)
                        .maybeSingle();

                      if (checkError) {
                        console.error('Error checking existing attendance log:', checkError);
                      }

                      if (existingAttendance) {
                        toast.info('تم تسجيل حضور هذا المخدوم في هذا اليوم مسبقاً');
                        setAttendanceModalOpen(false);
                        return;
                      }

                      const { error: attendanceError } = await supabase
                        .from('attendance_logs')
                        .insert({
                          participant_id: targetId,
                          servant_id: currentServant?.id || null,
                          attendance_date: attendanceDate,
                        });

                      if (attendanceError) {
                        console.error('Error inserting attendance log into Supabase:', attendanceError);
                        throw attendanceError;
                      }

                      const { data: pData, error: balanceError } = await supabase
                        .from('participants')
                        .select('points_balance')
                        .eq('id', targetId)
                        .single();

                      if (balanceError) {
                        console.error('Error fetching participant balance from Supabase:', balanceError);
                      }
                        
                      const currentBalance = pData?.points_balance || 0;
                      const newBalance = currentBalance + 10;

                      const { error: updateError } = await supabase
                        .from('participants')
                        .update({ points_balance: newBalance })
                        .eq('id', targetId);

                      if (updateError) {
                        console.error('Error updating participant points balance:', updateError);
                        throw updateError;
                      }

                      const { error: txError } = await supabase
                        .from('points_transactions')
                        .insert({
                          participant_id: targetId,
                          servant_id: currentServant?.id || null,
                          transaction_type: 'addition',
                          points_amount: 10,
                          description: `مكافأة حضور يوم ${attendanceDate}`
                        });

                      if (txError) {
                        console.error('Error recording points transaction:', txError);
                      }

                      const today = new Date().toISOString().split('T')[0];

                      // Zustand state mutation using callback signature ensuring no undefined is returned
                      setParticipants((prev: any[]) =>
                        (prev || []).map((p: any) => {
                          if (p?.id === targetId || p?.participant_id === targetId) {
                            const existingDays = Array.isArray(p.attendanceDays) ? p.attendanceDays : [];
                            const updatedDays = existingDays.includes(attendanceDate)
                              ? existingDays
                              : [...existingDays, attendanceDate];
                            return {
                              ...p,
                              points: newBalance,
                              attendanceDays: updatedDays,
                              attended: updatedDays.includes(today),
                            };
                          }
                          return p;
                        })
                      );

                      setItems((prev: ParticipantItem[]) =>
                        (prev || []).map((p: ParticipantItem) => {
                          if (p?.dbId === targetId || p?.id === targetId) {
                            return {
                              ...p,
                              points: newBalance,
                              attended: attendanceDate === today ? true : p.attended,
                            };
                          }
                          return p;
                        })
                      );

                      toast.success('تم تسجيل الحضور وإضافة 10 نقاط بنجاح');
                      await fetchData();
                    } catch (err: any) {
                      console.error('Manual attendance error in ParticipantsPage:', err);
                      toast.error(`حدث خطأ أثناء تسجيل الحضور: ${err?.message || 'خطأ غير متوقع'}`);
                    }
                  }
                  setAttendanceModalOpen(false);
                }}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all"
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

      {/* Manual Points Modal */}
      {pointsModalParticipant && (
        <ManualPointsModal
          participants={items.map(p => ({
            id: p.participant_id || p.id,
            participant_id: p.participant_id,
            dbId: p.dbId || p.id,
            name: p.name,
            points: p.points
          }))}
          initialParticipant={{
            id: pointsModalParticipant.participant_id || pointsModalParticipant.id,
            participant_id: pointsModalParticipant.participant_id,
            dbId: pointsModalParticipant.dbId || pointsModalParticipant.id,
            name: pointsModalParticipant.name,
            points: pointsModalParticipant.points
          }}
          onConfirm={async (participantId, pts, action) => {
            try {
              const target = items.find(p => p.id === participantId || p.participant_id === participantId || p.dbId === participantId);
              const dbId = target?.dbId || target?.id || participantId;
              const amount = action === 'add' ? pts : -pts;

              const { data: pData, error: fetchError } = await supabase
                .from('participants')
                .select('points_balance')
                .eq('id', dbId)
                .single();

              if (fetchError) throw fetchError;

              const newBalance = Math.max(0, (pData?.points_balance || 0) + amount);

              const { error: updateError } = await supabase
                .from('participants')
                .update({ points_balance: newBalance })
                .eq('id', dbId);

              if (updateError) throw updateError;

              await supabase
                .from('points_transactions')
                .insert([{
                  participant_id: dbId,
                  servant_id: currentServant?.id || null,
                  points_amount: amount,
                  transaction_type: 'manual',
                  description: 'تعديل يدوي'
                }]);

              setItems(prev => prev.map(p => (p.id === dbId || p.dbId === dbId) ? { ...p, points: newBalance } : p));
              setParticipants((prev: any[]) => prev.map((p: any) => (p.id === dbId) ? { ...p, points: newBalance } : p));
              toast.success('تم التعديل بنجاح');
              setPointsModalParticipant(null);
            } catch (err: any) {
              console.error('Manual points error:', err);
              toast.error(`حدث خطأ: ${err.message || 'غير متوقع'}`);
            }
          }}
          onCancel={() => setPointsModalParticipant(null)}
        />
      )}
    </div>
  );
}
