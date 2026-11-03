import type { ReactNode } from 'react';
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  PieChart,
  PiggyBank,
  Receipt,
  Settings,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { Link, useRouter } from '@/lib/router';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import { Logo } from '@/components/ui/Logo';
import type { TranslationKey } from '@/i18n/translations';

interface NavEntry {
  to: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
}

const NAV_ENTRIES: NavEntry[] = [
  { to: '/app/dashboard', labelKey: 'navDashboard', icon: LayoutDashboard },
  { to: '/app/income', labelKey: 'navIncome', icon: TrendingUp },
  { to: '/app/expenses', labelKey: 'navExpenses', icon: TrendingDown },
  { to: '/app/budgets', labelKey: 'navBudgets', icon: PieChart },
  { to: '/app/savings', labelKey: 'navSavings', icon: PiggyBank },
  { to: '/app/reports', labelKey: 'navReports', icon: BarChart3 },
  { to: '/app/transactions', labelKey: 'navTransactions', icon: Receipt },
  { to: '/app/settings', labelKey: 'navSettings', icon: Settings },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { path, navigate } = useRouter();
  const { t } = useLanguage();
  const { profile, user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut()
      .then(() => navigate('/', { replace: true }))
      .catch((error: unknown) => console.error(error));
  };

  const displayName = profile?.full_name || user?.email || '';

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-stone-200 bg-white p-6 lg:flex">
        <Link to="/app/dashboard" aria-label={t('appName')}>
          <Logo />
        </Link>

        <nav className="mt-10 flex flex-col gap-1" aria-label="Main">
          {NAV_ENTRIES.map((entry) => (
            <NavItem key={entry.to} entry={entry} active={path === entry.to} label={t(entry.labelKey)} />
          ))}
        </nav>

        <div className="mt-auto space-y-4 border-t border-stone-200 pt-6">
          <LanguageSwitcher />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900">{displayName}</p>
            <p className="truncate text-xs text-stone-500">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
          >
            <LogOut className="h-4 w-4" />
            {t('signOut')}
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4 px-4 pt-4">
            <Link to="/app/dashboard" aria-label={t('appName')}>
              <Logo />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label={t('signOut')}
              className="rounded-full p-2 text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 py-3" aria-label="Main">
            {NAV_ENTRIES.map((entry) => (
              <MobileNavItem key={entry.to} entry={entry} active={path === entry.to} label={t(entry.labelKey)} />
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

interface NavItemProps {
  entry: NavEntry;
  active: boolean;
  label: string;
}

function NavItem({ entry, active, label }: NavItemProps) {
  const Icon = entry.icon;
  return (
    <Link
      to={entry.to}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition duration-200 ${
        active
          ? 'bg-primary-50 text-primary-800'
          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

function MobileNavItem({ entry, active, label }: NavItemProps) {
  const Icon = entry.icon;
  return (
    <Link
      to={entry.to}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? 'bg-primary-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
