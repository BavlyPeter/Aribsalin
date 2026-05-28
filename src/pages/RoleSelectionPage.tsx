import { Crown, Users } from 'lucide-react';
import churchLogo from '../assets/images/new-church-logo.png';
import festivalLogo from '../assets/images/Arebsalin-1.png';

interface RoleSelectionPageProps {
  onSelectRole: (role: 'servant' | 'student') => void;
}

export function RoleSelectionPage({ onSelectRole }: RoleSelectionPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center mb-12 space-y-6">
        <img src={churchLogo} alt="Church Logo" className="w-24 h-24 object-contain shadow-lg rounded-full" />
        <img src={festivalLogo} alt="Festival Logo" className="h-16 object-contain" />
        <p className="text-muted-foreground text-center">مرحباً بك في نظام إدارة المهرجان</p>
      </div>
      <h2 className="text-2xl font-bold mb-8 text-foreground">من أنت؟</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        <button onClick={() => onSelectRole('servant')} className="bg-card flex flex-col items-center justify-center p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-primary active:scale-95 transition-all">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-primary">خادم</h3>
          <p className="text-sm text-muted-foreground mt-2">تسجيل الدخول للوحة التحكم</p>
        </button>
        <button onClick={() => onSelectRole('student')} className="bg-card flex flex-col items-center justify-center p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-secondary active:scale-95 transition-all">
          <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8" style={{ color: 'var(--secondary)' }} />
          </div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--secondary-foreground)' }}>مخدوم</h3>
          <p className="text-sm text-muted-foreground mt-2">متابعة نقاطي وحضوري</p>
        </button>
      </div>
    </div>
  );
}
