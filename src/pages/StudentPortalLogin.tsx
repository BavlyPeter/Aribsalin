import { ArrowRight, QrCode, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFestivalStore } from '../store/useFestivalStore';
import { toast } from 'sonner';

interface StudentPortalLoginProps {
  onBack?: () => void;
  onLoginById?: (id: string) => void;
  onOpenScanner?: () => void;
}

export function StudentPortalLogin({ onBack, onLoginById, onOpenScanner }: StudentPortalLoginProps = {}) {
  const navigate = useNavigate();
  const { participants, setViewerRole } = useFestivalStore();
  const [studentId, setStudentId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = studentId.trim().toUpperCase();
    if (!cleanId) return;

    if (onLoginById) {
      onLoginById(cleanId);
    } else {
      const normalized = cleanId;
      const participant = participants.find(p =>
        String(p.id || '').trim().toUpperCase() === normalized ||
        String(p.participant_id || '').trim().toUpperCase() === normalized
      );

      if (!participant) {
        toast.error('لم يتم العثور على المشارك', {
          description: `الرقم ${cleanId} غير موجود`
        });
        return;
      }

      setViewerRole('student');
      navigate(`/profile/${participant.id}`);
    }
  };

  const handleBack = onBack || (() => navigate('/'));

  const handleOpenScanner = () => {
    setViewerRole('student');
    if (onOpenScanner) {
      onOpenScanner();
    } else {
      navigate('/scanner?mode=viewDetails');
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h2 className="text-xl">دخول المخدومين</h2>
        </div>
      </div>
      <div className="p-4 flex flex-col items-center justify-center mt-12">
        <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-lg border border-border">
          <h3 className="text-lg font-bold text-primary mb-6 text-center">الوصول للملف الشخصي</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-foreground mb-2">رقم المشارك (ID)</label>
              <div className="relative">
                <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="مثال: P001" className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary pl-10 uppercase" />
                <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <button type="submit" disabled={!studentId.trim()} className="w-full bg-primary text-primary-foreground rounded-xl py-3 shadow-md disabled:opacity-50 active:scale-95 transition-transform">دخول</button>
          </form>
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-border"></div>
            <span className="mx-4 text-sm text-muted-foreground">أو</span>
            <div className="flex-grow border-t border-border"></div>
          </div>
          <button onClick={handleOpenScanner} className="w-full flex items-center justify-center gap-3 bg-card border-2 border-secondary text-secondary-foreground rounded-xl py-4 shadow-sm active:scale-95 transition-transform hover:bg-secondary/10" style={{ borderColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
            <QrCode className="w-6 h-6" />
            <span className="text-lg font-medium">امسح الكود (QR Code)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
