import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import churchLogo from '../assets/images/AVA Mina Church.png';
import festivalLogo from '../assets/images/Arebsalin Logo.png';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useFestivalStore } from '../store/useFestivalStore';

interface LoginPageProps {
  onLogin?: (servantData: any) => void;
  onNavigateToSignup?: () => void;
}

export function LoginPage({ onLogin, onNavigateToSignup }: LoginPageProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const { setAuth, setCurrentServant, setViewerRole, isAuthenticated, isInitialized } = useFestivalStore();
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isInitialized, isAuthenticated, from, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const email = `${teacherId.trim().toLowerCase()}@aribsalin.com`;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        toast.error('رقم الدخول أو كلمة المرور غير صحيحة');
        return;
      }

      const { data: servantData, error: dbError } = await supabase
        .from('servants')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (dbError || !servantData) {
        toast.error('تعذر تحميل بيانات الخادم');
        return;
      }

      // Prevent pending users from logging in
      if (servantData.status === 'pending') {
        toast.error('حسابك قيد المراجعة. يرجى انتظار موافقة أمين الخدمة.');
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      setAuth(true);
      setCurrentServant(servantData);
      setViewerRole('servant');

      if (onLogin) {
        onLogin(servantData);
      } else {
        navigate(from, { replace: true });
      }
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error) {
      console.error(error);
      toast.error('رقم الدخول أو كلمة المرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Logos */}
      <div className="bg-card border-b-2 border-primary/20 py-4 px-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={churchLogo} alt="Church Logo" className="w-14 h-14 object-contain" />
          </div>
            <img src={festivalLogo} alt="Festival Logo" className="h-14 object-contain" />
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-muted rounded-lg active:scale-95 transition-transform text-foreground"
            title="الرجوع للرئيسية"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl mb-2" style={{ color: 'var(--primary)' }}>
                تسجيل الدخول
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-foreground">
                  رقم الدخول (ID)
                </label>
                <input
                  type="text"
                  required
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring uppercase"
                  placeholder="مثال: T001"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-foreground">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground rounded-xl py-4 shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span className="text-lg">{isLoading ? 'جاري تسجيل الدخول...' : 'دخول'}</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                ليس لديك حساب؟
              </p>
              <button
                onClick={() => {
                  if (onNavigateToSignup) onNavigateToSignup();
                  else navigate('/signup');
                }}
                className="text-primary hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
