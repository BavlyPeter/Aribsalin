import { useState } from 'react';
import { X, Coins, Minus } from 'lucide-react';

interface MarketModalProps {
  participantName: string;
  currentPoints: number;
  onConfirm: (pointsToDeduct: number) => void;
  onCancel: () => void;
}

export function MarketModal({ participantName, currentPoints, onConfirm, onCancel }: MarketModalProps) {
  const [pointsToDeduct, setPointsToDeduct] = useState<string>('');

  const handleConfirm = () => {
    const points = parseInt(pointsToDeduct);
    if (points > 0 && points <= currentPoints) {
      onConfirm(points);
    }
  };

  const remainingPoints = currentPoints - (parseInt(pointsToDeduct) || 0);
  const isValid = pointsToDeduct && parseInt(pointsToDeduct) > 0 && parseInt(pointsToDeduct) <= currentPoints;

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
            <div className="w-16 h-16 bg-secondary/20 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Coins className="w-8 h-8" style={{ color: 'var(--secondary)' }} />
            </div>
            <h3 className="text-xl text-primary mb-1">خصم نقاط من السوق</h3>
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
            <label className="block mb-2 text-sm text-foreground">قيمة المنتج بالنقاط</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={currentPoints}
                step="1"
                value={pointsToDeduct}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow positive integers
                  if (value === '' || (parseInt(value) > 0 && !value.includes('-') && !value.includes('.'))) {
                    setPointsToDeduct(value);
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent minus, plus, dot, and 'e' keys
                  if (e.key === '-' || e.key === '+' || e.key === '.' || e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                  }
                }}
                className="w-full px-4 py-4 pr-12 bg-input-background rounded-xl border-2 border-border focus:border-primary focus:outline-none text-lg text-center"
                placeholder="0"
                autoFocus
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Minus className="w-5 h-5" />
              </div>
            </div>
            {pointsToDeduct && parseInt(pointsToDeduct) > currentPoints && (
              <p className="text-destructive text-sm mt-2">النقاط المطلوبة أكبر من الرصيد المتاح</p>
            )}
            {pointsToDeduct && parseInt(pointsToDeduct) <= 0 && (
              <p className="text-destructive text-sm mt-2">يجب إدخال رقم موجب</p>
            )}
            <p className="text-xs text-muted-foreground mt-2 text-center">
              أدخل عدد صحيح موجب فقط
            </p>
          </div>

          {/* Remaining Points Preview */}
          {pointsToDeduct && isValid && (
            <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">الرصيد بعد الخصم</div>
              <div className="text-2xl" style={{ color: 'var(--primary)' }}>
                {remainingPoints}
                <span className="text-base mr-2">نقطة</span>
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
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            تأكيد الخصم
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
