import { Suspense, lazy }                         from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard, AuthGuard }                   from '../components/auth/RoleGuard';
import { AuthInitializer }                        from '../components/auth/AuthInitializer';

// Lazy loading ALL page components with named exports
const RoleSelectionPage = lazy(()        => import('../pages/RoleSelectionPage').then(module => ({ default: module.RoleSelectionPage })));
const LoginPage = lazy(()                => import('../pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(()               => import('../pages/SignupPage').then(module => ({ default: module.SignupPage })));
const StudentPortalLogin = lazy(()       => import('../pages/StudentPortalLogin').then(module => ({ default: module.StudentPortalLogin })));
const Dashboard = lazy(()                => import('../pages/Dashboard').then(module => ({ default: module.Dashboard })));
const ParticipantsPage = lazy(()         => import('../pages/ParticipantsPage').then(module => ({ default: module.ParticipantsPage })));
const QRScanner = lazy(()                => import('../components/shared/QRScanner').then(module => ({ default: module.QRScanner })));
const StatisticsPage = lazy(()           => import('../pages/StatisticsPage').then(module => ({ default: module.StatisticsPage })));
const FinancePage = lazy(()              => import('../pages/FinancePage').then(module => ({ default: module.FinancePage })));
const SessionsManagementPage = lazy(()   => import('../pages/SessionsManagementPage').then(module => ({ default: module.SessionsManagementPage })));
const RegistrationRequestsPage = lazy(() => import('../pages/RegistrationRequestsPage').then(module => ({ default: module.RegistrationRequestsPage })));
const TeachersPage = lazy(()             => import('../pages/TeachersPage').then(module => ({ default: module.TeachersPage })));
const AreasManagementPage = lazy(()      => import('../pages/AreasManagementPage').then(module => ({ default: module.AreasManagementPage })));
const StudentProfile = lazy(()           => import('../pages/StudentProfile').then(module => ({ default: module.StudentProfile })));
const ServantProfile = lazy(()           => import('../pages/ServantProfile').then(module => ({ default: module.ServantProfile })));
const RegistrationPage = lazy(()         => import('../pages/RegistrationPage').then(module => ({ default: module.RegistrationPage })));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground font-medium text-lg">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RoleSelectionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/student-portal" element={<StudentPortalLogin />} />

            {/* Protected Routes (Generic Authentication Guard) */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/participants"
              element={
                <AuthGuard>
                  <ParticipantsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/scanner"
              element={<QRScanner />}
            />

            {/* Admin/Supervisor Only Routes */}
            <Route
              path="/statistics"
              element={
                <RoleGuard allowedRoles={['admin', 'supervisor']}>
                  <StatisticsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/registration"
              element={
                <RoleGuard allowedRoles={['admin', 'supervisor']}>
                  <RegistrationPage />
                </RoleGuard>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/finance"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <FinancePage />
                </RoleGuard>
              }
            />
            <Route
              path="/sessions"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <SessionsManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/requests"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <RegistrationRequestsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/teachers"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <TeachersPage />
                </RoleGuard>
              }
            />
            <Route
              path="/areas-management"
              element={
                <RoleGuard allowedRoles={['admin', 'developer']}>
                  <AreasManagementPage />
                </RoleGuard>
              }
            />

            {/* Profile Detail Routes */}
            <Route path="/profile/:id" element={<StudentProfile />} />
            <Route
              path="/servant-profile/:id"
              element={
                <AuthGuard>
                  <ServantProfile />
                </AuthGuard>
              }
            />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthInitializer>
    </BrowserRouter>
  );
}