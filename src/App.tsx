import { useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from '@/lib/router';
import { AppShell } from '@/components/app/AppShell';
import { Logo } from '@/components/ui/Logo';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EntriesPage } from '@/pages/EntriesPage';
import { BudgetsPage } from '@/pages/BudgetsPage';
import { SavingsPage } from '@/pages/SavingsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { SettingsPage } from '@/pages/SettingsPage';

const DASHBOARD_PATH = '/app/dashboard';

const APP_PAGES: Record<string, ReactNode> = {
  '/app/dashboard': <DashboardPage />,
  '/app/income': <EntriesPage kind="income" />,
  '/app/expenses': <EntriesPage kind="expense" />,
  '/app/budgets': <BudgetsPage />,
  '/app/savings': <SavingsPage />,
  '/app/reports': <ReportsPage />,
  '/app/transactions': <TransactionsPage />,
  '/app/settings': <SettingsPage />,
};

const PUBLIC_PATHS = ['/', '/login', '/register'];

function FullScreenLoader() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-stone-50">
      <Logo />
      <div className="flex items-center gap-3 text-stone-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">{t('loading')}</span>
      </div>
    </div>
  );
}

export default function App() {
  const { path, navigate } = useRouter();
  const { user, loading } = useAuth();

  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, '') : path;
  const isAppPath = normalizedPath.startsWith('/app');
  const isAuthPath = normalizedPath === '/login' || normalizedPath === '/register';
  const appPage = APP_PAGES[normalizedPath];

  useEffect(() => {
    if (loading) return;
    if (isAppPath) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (!appPage) {
        navigate(DASHBOARD_PATH, { replace: true });
      }
      return;
    }
    if (isAuthPath && user) {
      navigate(DASHBOARD_PATH, { replace: true });
      return;
    }
    if (!PUBLIC_PATHS.includes(normalizedPath)) {
      navigate('/', { replace: true });
    }
  }, [loading, isAppPath, isAuthPath, appPage, user, normalizedPath, navigate]);

  if (normalizedPath === '/') {
    return <LandingPage />;
  }

  if (isAuthPath) {
    if (loading) return <FullScreenLoader />;
    if (user) return null;
    return <AuthPage mode={normalizedPath === '/login' ? 'login' : 'register'} />;
  }

  if (isAppPath) {
    if (loading) return <FullScreenLoader />;
    if (!user || !appPage) return null;
    return <AppShell>{appPage}</AppShell>;
  }

  return null;
}
