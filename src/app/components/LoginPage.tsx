import { useState } from 'react';
import { LogIn } from 'lucide-react';
import churchLogo from '../../imports/meni_Logo.png';
import festivalLogo from '../../imports/Arebsalin-1.png';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onNavigateToSignup: () => void;
}

export function LoginPage({ onLogin, onNavigateToSignup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Logos */}
      <div className="bg-card border-b-2 border-primary/20 py-4 px-4">
        <div className="flex items-center justify-between">
          <img src={churchLogo} alt="Church Logo" className="w-14 h-14 object-contain" />
          <img src={festivalLogo} alt="Festival Logo" className="h-14 object-contain" />
          <div className="w-14" /> {/* Spacer for centering */}
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
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="example@email.com"
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
                className="w-full bg-primary text-primary-foreground rounded-xl py-4 shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span className="text-lg">دخول</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                ليس لديك حساب؟
              </p>
              <button
                onClick={onNavigateToSignup}
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
