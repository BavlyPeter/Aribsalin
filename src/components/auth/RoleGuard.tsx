import React, { useRef, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFestivalStore } from '../../store/useFestivalStore';
import { toast } from 'sonner';

export interface RoleGuardProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { isAuthenticated, currentServant, isInitialized, logout } = useFestivalStore();
  const location = useLocation();
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && currentServant?.status === 'pending') {
      if (logout) logout();
    }
  }, [isAuthenticated, currentServant, logout]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentServant?.status === 'pending') {
    if (!toastShownRef.current) {
      toast.error('حسابك لا يزال قيد المراجعة، يرجى انتظار موافقة أمين الخدمة.');
      toastShownRef.current = true;
    }
    return <Navigate replace to="/login"/>;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!currentServant) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground font-medium">جاري التحميل...</p>
          </div>
        </div>
      );
    }

    const userRole = currentServant.role || 'normal';
    // The 'developer' role acts as a Super Admin / God Mode and bypasses all restrictions
    if (userRole !== 'developer' && !allowedRoles.includes(userRole)) {
      if (!toastShownRef.current) {
        toast.error('غير مصرح لك بالدخول لهذه الصفحة');
        toastShownRef.current = true;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>;
}

export default RoleGuard;
