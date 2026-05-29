import { Users, CheckSquare, ShoppingBag, UserPlus, Plus, Settings, FileText, Wallet, BarChart3 } from 'lucide-react';
import { ParticipantsList } from '../components/shared/ParticipantsList';
import churchLogo from '../assets/images/new-church-logo.png';
import festivalLogo from '../assets/images/Arebsalin-1.png';

interface DashboardProps {
  onNavigate: (view: 'scanner' | 'registration' | 'market' | 'addPoints' | 'manualPoints' | 'profile' | 'viewDetails' | 'finance' | 'statistics' | 'teachers') => void;
  onViewProfile: (participantId: string) => void;
  onLogout: () => void | Promise<void>;
  currentServant: any;
  participants?: Array<{ id: string; name: string; points: number; attended: boolean }>;
}

export function Dashboard({
  onNavigate,
  onViewProfile,
  onLogout,
  currentServant,
  participants = []
}: DashboardProps) {
  const roleLabels: Record<string, string> = {
    'normal': 'خادم',
    'supervisor': 'أمين فصل',
    'admin': 'أمين الخدمة'
  };

  const stageLabels: Record<string, string> = {
    'kg': 'حضانة',
    'primary_12': 'ابتدائي (الصف الأول والثاني)',
    'primary_34': 'ابتدائي (الصف الثالث والرابع)',
    'primary_56': 'ابتدائي (الصف الخامس والسادس)',
    'preparatory': 'إعدادي',
    'secondary': 'ثانوي',
    'university_graduate': 'جامعيين وخريجين'
  };

  const servant = currentServant || { full_name: 'خادم تجريبي', gender: 'male', role: 'supervisor', class_stage: 'primary_34' };
  const title = servant.gender === 'male' ? 'باصون' : 'تاسوني';
  const servantRole = servant?.role || 'normal';
  const roleText = roleLabels[servantRole] || 'خادم';
  const stageKey = servant?.class_stage || servant?.classStage;
  const stageText = stageKey ? (stageLabels[stageKey] || stageKey) : '';

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header with Logos */}
      <div className="bg-card border-b-2 border-primary/20 py-4 px-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <img src={churchLogo} alt="Church Logo" className="w-14 h-14 object-contain" />
          <img src={festivalLogo} alt="Festival Logo" className="h-14 object-contain" />
          <div className="w-14" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="p-4">
        {/* Welcome Banner */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-right mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            مرحباً {title} {servant.full_name || servant.fullName}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            {servantRole === 'admin'
              ? roleText
              : stageText
                ? `${roleText} - ${stageText}`
                : roleText
            }
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => onNavigate('scanner')}
            className="w-full bg-primary text-primary-foreground rounded-xl p-5 shadow-lg active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div className="text-lg">تسجيل الحضور</div>
            <div className="text-sm opacity-90 mt-1">مسح كود QR للحضور</div>
          </button>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('market')}
              className="rounded-xl p-5 shadow-lg active:scale-[0.98] transition-transform"
              style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
            >
              <div className="flex items-center justify-center mb-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="text-base">مسح السوق</div>
              <div className="text-xs opacity-90 mt-1">خصم النقاط</div>
            </button>

            <button
              onClick={() => onNavigate('addPoints')}
              className="rounded-xl p-5 shadow-lg active:scale-[0.98] transition-transform bg-green-600 text-white"
            >
              <div className="flex items-center justify-center mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-base">إضافة نقاط</div>
              <div className="text-xs opacity-90 mt-1">مسح لإضافة</div>
            </button>

            <button
              onClick={() => onNavigate('viewDetails')}
              className="rounded-xl p-5 shadow-lg active:scale-[0.98] transition-transform bg-blue-600 text-white"
            >
              <div className="flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-base">عرض التفاصيل</div>
              <div className="text-xs opacity-90 mt-1">الملف الشخصي</div>
            </button>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => onNavigate('registration')}
            className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-center gap-3">
              <UserPlus className="w-5 h-5 text-primary" />
              <span>تسجيل مشارك جديد</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('manualPoints')}
            className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-center gap-3">
              <Settings className="w-5 h-5 text-primary" />
              <span>إدارة النقاط يدوياً</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('finance')}
            className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-center gap-3">
              <Wallet className="w-5 h-5 text-primary" />
              <span>الإدارة المالية</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('statistics')}
            className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-center gap-3">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>إحصائيات المهرجان</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('teachers')}
            className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <span>إدارة الخدام</span>
            </div>
          </button>

          <button
            onClick={() => void onLogout()}
            className="w-full rounded-xl p-4 shadow-sm border border-red-200 bg-red-50 text-red-700 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-center gap-3">
              <span>تسجيل الخروج</span>
            </div>
          </button>
        </div>

        {/* Participants List */}
        {participants.length > 0 && (
          <div>
            <ParticipantsList
              participants={participants.map(p => ({
                ...p,
                onClick: () => onViewProfile(p.id)
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
