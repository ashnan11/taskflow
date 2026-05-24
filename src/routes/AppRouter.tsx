import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AuthPage } from '../pages/AuthPage';
import { ProfilePage } from '../pages/ProfilePage';
import { useAuth } from '../context/AuthContext';

const AuthPageLazy = lazy(() => Promise.resolve({ default: AuthPage }));
const ProfilePageLazy = lazy(() => Promise.resolve({ default: ProfilePage }));

function AppShell() {
  return (
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  );
}

export function AppRouter() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />} />
        <Route
          path="/auth"
          element={
            <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
              <AuthPageLazy />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
              <ProfilePageLazy />
            </Suspense>
          }
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
