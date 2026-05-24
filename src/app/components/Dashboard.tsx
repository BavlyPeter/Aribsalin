import { Users, CheckSquare, ShoppingBag, UserPlus, QrCode } from 'lucide-react';
import { useState } from 'react';
import { TestQRCode } from './TestQRCode';
import { ParticipantsList } from './ParticipantsList';

interface DashboardProps {
  onNavigate: (view: 'scanner' | 'registration' | 'market') => void;
  totalParticipants: number;
  todayAttendance: number;
  participants?: Array<{ id: string; name: string; points: number; attended: boolean }>;
}

export function Dashboard({ onNavigate, totalParticipants, todayAttendance, participants = [] }: DashboardProps) {
  const [showTestQR, setShowTestQR] = useState<{ id: string; name: string } | null>(null);
  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      {/* Header */}
      <div className="text-center mb-8 pt-4">
        <div className="mb-3">
          <div className="w-20 h-20 bg-primary rounded-full mx-auto flex items-center justify-center shadow-lg">
            <span className="text-3xl text-primary-foreground">†</span>
          </div>
        </div>
        <h1 className="text-2xl mb-1" style={{ color: 'var(--primary)' }}>اريبصالين</h1>
        <p className="text-muted-foreground">مهرجان الصيف - الكنيسة القبطية الأرثوذكسية</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" style={{ color: 'var(--secondary)' }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1" style={{ color: 'var(--primary)' }}>{totalParticipants}</div>
            <div className="text-sm text-muted-foreground">إجمالي المشاركين</div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1" style={{ color: 'var(--primary)' }}>{todayAttendance}</div>
            <div className="text-sm text-muted-foreground">الحضور اليوم</div>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="space-y-4 mb-6">
        <button
          onClick={() => onNavigate('scanner')}
          className="w-full bg-primary text-primary-foreground rounded-xl p-6 shadow-lg active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div className="text-xl">تسجيل الحضور</div>
          <div className="text-sm opacity-90 mt-1">مسح كود QR للحضور</div>
        </button>

        <button
          onClick={() => onNavigate('market')}
          className="w-full rounded-xl p-6 shadow-lg active:scale-[0.98] transition-transform"
          style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="text-xl">مسح السوق</div>
          <div className="text-sm opacity-90 mt-1">خصم النقاط من رصيد المشارك</div>
        </button>
      </div>

      {/* Secondary Action */}
      <button
        onClick={() => onNavigate('registration')}
        className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-center gap-3">
          <UserPlus className="w-5 h-5 text-primary" />
          <span>تسجيل مشارك جديد</span>
        </div>
      </button>

      {/* Participants List */}
      {participants.length > 0 && (
        <ParticipantsList participants={participants} />
      )}

      {/* Test QR Codes Section */}
      {participants.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm text-muted-foreground mb-3 text-center">أكواد QR للاختبار</h3>
          <div className="grid grid-cols-1 gap-2">
            {participants.slice(0, 3).map(participant => (
              <button
                key={participant.id}
                onClick={() => setShowTestQR({ id: participant.id, name: participant.name })}
                className="bg-muted/50 rounded-lg p-3 border border-border active:scale-[0.98] transition-transform flex items-center justify-between"
              >
                <span className="text-sm">{participant.name}</span>
                <QrCode className="w-5 h-5 text-primary" />
              </button>
            ))}
          </div>
        </div>
      )}

      {showTestQR && (
        <TestQRCode
          participantId={showTestQR.id}
          participantName={showTestQR.name}
          onClose={() => setShowTestQR(null)}
        />
      )}
    </div>
  );
}
