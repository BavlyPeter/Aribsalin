import { Search, User, Coins, Trash2, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { normalizeArabicText } from '../../utils/textUtils';

interface Participant {
  id: string;
  participant_id?: string;
  dbId?: string;
  name: string;
  points: number;
  attended: boolean;
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

  useEffect(() => setItems(participants), [participants]);

  const normalizedSearchQuery = normalizeArabicText(searchQuery);
  const filteredParticipants = items.filter(p => {
    const normalizedName = normalizeArabicText(p.name || '');
    const normalizedId = normalizeArabicText(p.participant_id || p.id || '');

    return normalizedName.includes(normalizedSearchQuery) ||
      normalizedId.includes(normalizedSearchQuery);
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المشارك أو الرقم..."
            className="w-full pr-11 pl-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
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
