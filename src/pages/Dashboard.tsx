import { Users, CheckSquare, ShoppingBag, UserPlus, Plus, FileText, Wallet, BarChart3, LogOut, User, UserCheck, BookOpen } from 'lucide-react';
import { ParticipantsList } from '../components/shared/ParticipantsList';
import churchLogo from '../assets/images/new-church-logo.png';
import festivalLogo from '../assets/images/Arebsalin-1.png';

interface DashboardProps {
  onNavigate: (view: 'scanner' | 'registration' | 'market' | 'addPoints' | 'profile' | 'viewDetails' | 'finance' | 'statistics' | 'teachers' | 'registrationRequests' | 'sessions' ) => void;
  onViewProfile: (participantId: string) => void;
  onViewServantProfile?: (id: string) => void; // <-- ADD THIS
  onLogout: () => void | Promise<void>;
  currentServant: any;
  participants?: Array<{ id: string; participant_id?: string; dbId?: string; name: string; points: number; attended: boolean; data?: any; photo_url?: string }>;
  onEditRequest?: (rec: any) => void;
  onManagePoints?: (rec: any) => void;
  onDeleteParticipant?: (id: string) => void;
  onManualAttendance?: (participantId: string, date: string) => void;
}

export function Dashboard({
  onNavigate,
  onViewProfile,
  onViewServantProfile,
  onLogout,
  currentServant,
  participants = [],
  onEditRequest,
  onManagePoints,
  onDeleteParticipant,
  onManualAttendance
}: DashboardProps) {
  
  // Define roles based on currentServant.role
  const userRole = currentServant?.role || 'normal';
  const isAdmin = userRole === 'admin';
  const isSupervisor = userRole === 'supervisor';
  const canManageParticipants = isAdmin || isSupervisor; // Admin & Supervisor can add, edit, delete

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
        {/* Servant Info Card */}
        <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border mb-6">
          <div className="flex w-full items-center justify-between gap-3 sm:gap-4">
            {/* Part 1 (Starts Left): Avatar and Name Info (grouped together) */}
            <div 
              className="flex items-center gap-3 text-right min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                if (currentServant?.id && onViewServantProfile) {
                  onViewServantProfile(currentServant.id);
                }
              }}
            >
              {/* Avatar Icon / Image */}
              <div className="w-11 h-11 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
                {currentServant?.photo_url ? (
                  <img src={currentServant.photo_url} alt={currentServant.name || currentServant.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-primary/60" />
                )}
              </div>

              {/* Name and Role Details */}
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-foreground truncate mb-1">
                  مرحباً بك، {currentServant.name || currentServant.full_name}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
                  {servantRole === 'admin' 
                    ? roleText 
                    : stageText 
                      ? `${roleText} - ${stageText}` 
                      : roleText
                  }
                </p>
              </div>
            </div>

            {/* Part 2 (Pushed Right): Small Logout Button directly across from the name */}
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                  void onLogout();
                }
              }}
              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium active:scale-95 shrink-0"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
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
          {/* Add Participant Button - Only Admin & Supervisor */}
          {canManageParticipants && (
            <button
              onClick={() => onNavigate('registration')}
              className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-center gap-3">
                <UserPlus className="w-5 h-5 text-primary" />
                <span>تسجيل مشارك جديد</span>
              </div>
            </button>
          )}

          {(isAdmin || isSupervisor) && (
            <button
              onClick={() => onNavigate('statistics')}
              className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-center gap-3">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>إحصائيات المهرجان</span>
              </div>
            </button>
          )}

          {/* Admin Only Buttons: Finance, Statistics, Teachers */}
          {isAdmin && (
            <>
              <button
                onClick={() => onNavigate('registrationRequests')}
                className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-center gap-3">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <span>طلبات التسجيل</span>
                </div>
              </button>

              <button
                onClick={() => onNavigate('sessions')}
                className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>إدارة الحصص</span>
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
                onClick={() => onNavigate('teachers')}
                className="w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span>إدارة الخدام</span>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Participants List */}
        {participants.length > 0 && (
          <div>
            <ParticipantsList
              participants={participants.map(p => ({
                ...p,
                onClick: () => onViewProfile(p.id)
              }))}
              onEdit={(p) => onEditRequest?.(p)}
              onManagePoints={(p) => onManagePoints?.(p)}
              onDelete={(id) => onDeleteParticipant?.(id)}
              onManualAttendance={onManualAttendance}
              canEdit={canManageParticipants}
              canDelete={canManageParticipants}
            />
          </div>
        )}
      </div>
    </div>
  );
}
