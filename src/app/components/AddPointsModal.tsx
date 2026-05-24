import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface AddPointsModalProps {
  participantName: string;
  currentPoints: number;
  onConfirm: (pointsToAdd: number) => void;
  onCancel: () => void;
}

export function AddPointsModal({ participantName, currentPoints, onConfirm, onCancel }: AddPointsModalProps) {
  const [pointsToAdd, setPointsToAdd] = useState<string>('');

  const handleConfirm = () => {
    const points = parseInt(pointsToAdd);
    if (points > 0) {
      onConfirm(points);
    }
  };

  const newTotal = currentPoints + (parseInt(pointsToAdd) || 0);
  const isValid = pointsToAdd && parseInt(pointsToAdd) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-t-3xl sm:rounded-2xl w-full max-w-md mx-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-border">
          <button
            onClick={onCancel}
            className="absolute left-4 top-4 p-2 hover:bg-muted rounded-lg active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center pt-2">
            <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Plus className="w-8 h-8 text-green-700" />
            </div>
            <h3 className="text-xl text-primary mb-1">إضافة نقاط</h3>
            <p className="text-sm text-muted-foreground">المشارك: {participantName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Points Display */}
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">الرصيد الحالي</div>
            <div className="text-3xl" style={{ color: 'var(--primary)' }}>
              {currentPoints}
              <span className="text-lg mr-2">نقطة</span>
            </div>
          </div>

          {/* Points Input */}
          <div>
            <label className="block mb-2 text-sm text-foreground">عدد النقاط المراد إضافتها</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={pointsToAdd}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow positive integers
                  if (value === '' || (parseInt(value) > 0 && !value.includes('-') && !value.includes('.'))) {
                    setPointsToAdd(value);
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent minus, plus, dot, and 'e' keys
                  if (e.key === '-' || e.key === '+' || e.key === '.' || e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                  }
                }}
                className="w-full px-4 py-4 pr-12 bg-input-background rounded-xl border-2 border-border focus:border-green-500 focus:outline-none text-lg text-center"
                placeholder="0"
                autoFocus
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600">
                <Plus className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              أدخل عدد صحيح موجب فقط
            </p>
          </div>

          {/* New Total Preview */}
          {pointsToAdd && isValid && (
            <div className="bg-green-500/5 rounded-xl p-4 text-center border-2 border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">الرصيد الجديد</div>
              <div className="text-2xl text-green-700">
                {newTotal}
                <span className="text-base mr-2">نقطة</span>
              </div>
              <div className="text-xs text-green-600 mt-2">
                +{pointsToAdd} نقطة
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`w-full py-4 rounded-xl text-lg transition-all active:scale-[0.98] ${
              isValid
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            إضافة النقاط
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl text-foreground bg-transparent border border-border active:scale-[0.98] transition-transform"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
