import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing/Landing';
import { DashboardLayout } from './pages/Dashboard/Dashboard';
import { Overview } from './components/dashboard/Overview/Overview';
import { TransactionList } from './components/dashboard/TransactionList/TransactionList';
import { BudgetList } from './components/dashboard/BudgetCard/BudgetList';
import { Analytics } from './components/dashboard/Analytics/Analytics';
import { SettingsPage } from './pages/Settings/Settings';
import { LoginForm } from './components/auth/LoginForm/LoginForm';
import { SignupForm } from './components/auth/SignupForm/SignupForm';
import { PageSpinner } from './components/ui/Spinner/Spinner';
import { ToastContainer } from './components/ui/Toast/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import { useAppStore } from './store';
import { setLanguage } from './i18n';

function ProtectedRoute({ children, user, authLoading }: { children: React.ReactNode; user: unknown; authLoading: boolean }) {
  if (authLoading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children, user, authLoading }: { children: React.ReactNode; user: unknown; authLoading: boolean }) {
  if (authLoading) return <PageSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, authLoading } = useAuth();
  const { language } = useAppStore();

  useEffect(() => {
    setLanguage(language);
  }, [language]);

  if (authLoading) return <PageSpinner />;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={
        <PublicRoute user={user} authLoading={authLoading}><LoginForm /></PublicRoute>
      } />

      <Route path="/signup" element={
        <PublicRoute user={user} authLoading={authLoading}><SignupForm /></PublicRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute user={user} authLoading={authLoading}><DashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<Overview />} />
        <Route path="transactions" element={<TransactionList />} />
        <Route path="budgets" element={<BudgetList />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
