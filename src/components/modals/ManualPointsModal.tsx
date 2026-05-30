import { useEffect, useState } from 'react';
import { X, Search, Plus, Minus, User } from 'lucide-react';
import { normalizeArabicText } from '../../utils/textUtils';

interface Participant {
  id: string;
  participant_id?: string;
  dbId?: string;
  name: string;
  points: number;
}

interface ManualPointsModalProps {
  participants: Participant[];
  onConfirm: (participantId: string, points: number, action: 'add' | 'subtract') => void;
  onCancel: () => void;
  initialParticipant?: Participant | null;
}

export function ManualPointsModal({ participants, onConfirm, onCancel, initialParticipant }: ManualPointsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(initialParticipant ?? null);
  const [points, setPoints] = useState('');
  const [action, setAction] = useState<'add' | 'subtract'>('add');

  useEffect(() => {
    if (initialParticipant) {
      setSelectedParticipant(initialParticipant);
      setSearchQuery('');
      setPoints('');
      setAction('add');
    }
  }, [initialParticipant]);

  const normalizedSearchQuery = normalizeArabicText(searchQuery);
  const filteredParticipants = participants.filter(p => {
    const normalizedName = normalizeArabicText(p.name || '');
    const normalizedId = normalizeArabicText(p.participant_id || p.id || '');

    return normalizedName.includes(normalizedSearchQuery) ||
      normalizedId.includes(normalizedSearchQuery);
  });

  const handleConfirm = () => {
    if (selectedParticipant && points && parseInt(points) > 0) {
      if (action === 'subtract' && parseInt(points) > selectedParticipant.points) {
        return; // Don't allow subtracting more than available
      }
      onConfirm(selectedParticipant.id, parseInt(points), action);
    }
  };

  const isValid = selectedParticipant && points && parseInt(points) > 0 &&
    (action === 'add' || parseInt(points) <= selectedParticipant.points);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-t-3xl sm:rounded-2xl w-full max-w-md mx-auto shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-border">
          <button
            onClick={onCancel}
            className="absolute left-4 top-4 p-2 hover:bg-muted rounded-lg active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center pt-2">
            <h3 className="text-xl text-primary mb-1">إدارة النقاط يدوياً</h3>
            <p className="text-sm text-muted-foreground">إضافة أو خصم النقاط من المشاركين</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!selectedParticipant ? (
            <>
              {!initialParticipant && (
                <>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن مشارك..."
                      className="w-full pr-11 pl-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                  </div>

                  {/* Participants List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredParticipants.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>لا توجد نتائج</p>
                      </div>
                    ) : (
                      filteredParticipants.map(participant => (
                        <button
                          key={participant.id}
                          onClick={() => setSelectedParticipant(participant)}
                          className="w-full bg-muted/30 hover:bg-muted/50 rounded-lg p-4 border border-border active:scale-[0.98] transition-all text-right"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{participant.name}</div>
                                <div className="text-xs text-muted-foreground">{participant.id}</div>
                              </div>
                            </div>
                            <div className="text-sm font-medium" style={{ color: 'var(--secondary)' }}>
                              {participant.points} نقطة
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Selected Participant */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedParticipant.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedParticipant.id}</div>
                    </div>
                  </div>
                  {!initialParticipant && (
                    <button
                      onClick={() => {
                        setSelectedParticipant(null);
                        setPoints('');
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      تغيير
                    </button>
                  )}
                </div>
                <div className="text-center pt-3 border-t border-border">
                  <div className="text-sm text-muted-foreground">الرصيد الحالي</div>
                  <div className="text-2xl" style={{ color: 'var(--primary)' }}>
                    {selectedParticipant.points} نقطة
                  </div>
                </div>
              </div>

              {/* Action Selection */}
              <div>
                <label className="block mb-2 text-sm text-foreground">نوع العملية</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAction('add')}
                    className={`py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      action === 'add'
                        ? 'border-green-500 bg-green-500/10 text-green-700'
                        : 'border-border bg-input-background'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    <span>إضافة نقاط</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction('subtract')}
                    className={`py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      action === 'subtract'
                        ? 'border-red-500 bg-red-500/10 text-red-700'
                        : 'border-border bg-input-background'
                    }`}
                  >
                    <Minus className="w-5 h-5" />
                    <span>خصم نقاط</span>
                  </button>
                </div>
              </div>

              {/* Points Input */}
              <div>
                <label className="block mb-2 text-sm text-foreground">عدد النقاط</label>
                <input
                  type="number"
                  min="1"
                  max={action === 'subtract' ? selectedParticipant.points : undefined}
                  step="1"
                  value={points}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow positive integers
                    if (value === '' || (parseInt(value) > 0 && !value.includes('-') && !value.includes('.'))) {
                      setPoints(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent minus, plus, dot, and 'e' keys
                    if (e.key === '-' || e.key === '+' || e.key === '.' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-4 py-4 bg-input-background rounded-xl border-2 border-border focus:border-primary focus:outline-none text-lg text-center"
                  placeholder="0"
                  autoFocus
                />
                {action === 'subtract' && points && parseInt(points) > selectedParticipant.points && (
                  <p className="text-destructive text-sm mt-2">النقاط المطلوبة أكبر من الرصيد المتاح</p>
                )}
                {points && parseInt(points) <= 0 && (
                  <p className="text-destructive text-sm mt-2">يجب إدخال رقم موجب</p>
                )}
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  أدخل عدد صحيح موجب فقط
                </p>
              </div>

              {/* Preview */}
              {points && isValid && (
                <div className={`rounded-xl p-4 text-center border-2 ${
                  action === 'add'
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}>
                  <div className="text-sm text-muted-foreground mb-1">الرصيد بعد العملية</div>
                  <div className={`text-2xl ${
                    action === 'add' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {action === 'add'
                      ? selectedParticipant.points + parseInt(points)
                      : selectedParticipant.points - parseInt(points)
                    } نقطة
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {selectedParticipant && (
          <div className="p-6 pt-0 space-y-3 border-t border-border">
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className={`w-full py-4 rounded-xl text-lg transition-all active:scale-[0.98] ${
                isValid
                  ? action === 'add'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-red-500 text-white shadow-lg'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {action === 'add' ? 'إضافة النقاط' : 'خصم النقاط'}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3 rounded-xl text-foreground bg-transparent border border-border active:scale-[0.98] transition-transform"
            >
              إلغاء
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
