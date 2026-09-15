import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useFestivalStore } from '../../store/useFestivalStore';
import { Toaster } from 'sonner';
import { WelcomeScreen } from '../shared/WelcomeScreen';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const { initializeAuth, fetchData, isAuthenticated, setAuth, setCurrentServant, setViewerRole } = useFestivalStore();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    initializeAuth();
    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setAuth(false);
        setCurrentServant(null);
        setViewerRole('servant');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const hasVisited = localStorage.getItem('arribsalin-visited');
      if (!hasVisited) {
        setShowWelcome(true);
      }
    }
  }, [isAuthenticated]);

  const handleCloseWelcome = () => {
    localStorage.setItem('arribsalin-visited', 'true');
    setShowWelcome(false);
  };

  return (
    <>
      <Toaster
        position="top-center"
        dir="rtl"
        toastOptions={{
          style: {
            fontFamily: 'Tajawal, Cairo, sans-serif'
          }
        }}
      />
      {showWelcome && <WelcomeScreen onClose={handleCloseWelcome} />}
      {children}
    </>
  );
}

export default AuthInitializer;
