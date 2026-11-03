import { useMemo, useState } from 'react';
import { PiggyBank, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatters } from '@/hooks/useFormatters';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/app/StatCard';
import { DataState } from '@/components/app/DataState';
import { TransactionRow } from '@/components/app/TransactionRow';
import { PageHeader } from '@/components/app/PageHeader';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart, type DonutSlice } from '@/components/charts/DonutChart';
import { EntryForm } from '@/components/forms/EntryForm';
import { BudgetStatusCard, SavingsSummaryCard } from '@/components/dashboard/DashboardPanels';
import {
  expenseByCategory,
  monthlyTotals,
  sumAmounts,
  sumForMonth,
  toTransactions,
} from '@/lib/finance-calculations';
import { CATEGORY_LABEL_KEYS } from '@/lib/finance-labels';
import { currentMonthKey, lastMonthKeys } from '@/lib/format';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '@/types/finance';
import { Link } from '@/lib/router';

export function DashboardPage() {
  const { t, money, month, shortMonth } = useFormatters();
  const { user, profile } = useAuth();
  const { incomes, expenses, budgets, loading, loadFailed, refresh } = useFinance();
  const [quickAdd, setQuickAdd] = useState<'income' | 'expense' | null>(null);

  const currentMonth = currentMonthKey();
  const firstName = (profile?.full_name || user?.email?.split('@')[0] || '').split(' ')[0];

  const balance = sumAmounts(incomes) - sumAmounts(expenses);
  const monthIncome = sumForMonth(incomes, currentMonth);
  const monthExpense = sumForMonth(expenses, currentMonth);
  const monthNet = monthIncome - monthExpense;

  const trend = useMemo(
    () =>
      monthlyTotals(incomes, expenses, lastMonthKeys(currentMonth, 6)).map((row) => ({
        label: shortMonth(row.month),
        income: row.income,
        expense: row.expense,
      })),
    [incomes, expenses, currentMonth, shortMonth],
  );

  const spentByCategory = useMemo(() => expenseByCategory(expenses, currentMonth), [expenses, currentMonth]);

  const slices: DonutSlice[] = EXPENSE_CATEGORIES.filter((category) => spentByCategory[category] > 0).map(
    (category) => ({
      key: category,
      label: t(CATEGORY_LABEL_KEYS[category]),
      value: spentByCategory[category],
      color: CATEGORY_COLORS[category],
    }),
  );

  const recent = toTransactions(incomes, expenses).slice(0, 5);

  return (
    <div className="fade-up">
      <PageHeader
        title={t('dashWelcome', { name: firstName || t('appName') })}
        subtitle={t('dashSubtitle', { month: month(currentMonth) })}
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => setQuickAdd('income')}>
              <Plus className="h-4 w-4" />
              {t('addIncome')}
            </Button>
            <Button variant="secondary" onClick={() => setQuickAdd('expense')}>
              <Plus className="h-4 w-4" />
              {t('addExpense')}
            </Button>
          </div>
        }
      />

      <DataState loading={loading} failed={loadFailed} onRetry={() => void refresh()}>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t('balance')}
              value={money(balance)}
              hint={t('balanceHint')}
              icon={Wallet}
              tone="primary"
              valueClassName={balance < 0 ? 'text-error-700' : ''}
            />
            <StatCard label={t('monthIncome')} value={money(monthIncome)} icon={TrendingUp} tone="success" />
            <StatCard label={t('monthExpenses')} value={money(monthExpense)} icon={TrendingDown} tone="accent" />
            <StatCard
              label={t('monthNet')}
              value={money(monthNet)}
              icon={PiggyBank}
              tone="secondary"
              valueClassName={monthNet < 0 ? 'text-error-700' : ''}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="card p-6 lg:col-span-2">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">{t('monthlyTrend')}</h2>
                  <p className="text-sm text-stone-500">{t('monthlyTrendHint')}</p>
                </div>
              </div>
              <BarChart
                data={trend}
                incomeLabel={t('income')}
                expenseLabel={t('expense')}
                formatValue={(amount) => money(amount)}
              />
            </section>

            <section className="card p-6">
              <h2 className="text-lg font-bold text-stone-900">{t('spendingByCategory')}</h2>
              <p className="mb-6 text-sm text-stone-500">{month(currentMonth)}</p>
              {slices.length === 0 ? (
                <p className="py-10 text-center text-sm text-stone-500">{t('noSpending')}</p>
              ) : (
                <>
                  <DonutChart slices={slices} centerLabel={t('monthExpenses')} centerValue={money(monthExpense)} />
                  <ul className="mt-6 space-y-2.5">
                    {slices.map((slice) => (
                      <li key={slice.key} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                          <span className="truncate text-stone-700">{slice.label}</span>
                        </span>
                        <span className="shrink-0 font-semibold tabular-nums text-stone-900">
                          {money(slice.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <BudgetStatusCard budgets={budgets} spentByCategory={spentByCategory} />
            <SavingsSummaryCard />
            <section className="card p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-stone-900">{t('recentTransactions')}</h2>
                <Link to="/app/transactions" className="text-sm font-semibold text-primary-700 hover:text-primary-900">
                  {t('viewAll')}
                </Link>
              </div>
              {recent.length === 0 ? (
                <p className="text-sm text-stone-500">{t('noTransactions')}</p>
              ) : (
                <ul className="-mx-4 divide-y divide-stone-100 sm:-mx-6">
                  {recent.map((item) => (
                    <TransactionRow
                      key={`${item.kind}-${item.id}`}
                      kind={item.kind}
                      category={item.category}
                      amount={item.amount}
                      note={item.note}
                      occurred_on={item.occurred_on}
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </DataState>

      <Modal
        open={quickAdd !== null}
        title={quickAdd === 'income' ? t('newIncome') : t('newExpense')}
        onClose={() => setQuickAdd(null)}
      >
        {quickAdd && (
          <EntryForm kind={quickAdd} initial={null} onDone={() => setQuickAdd(null)} onCancel={() => setQuickAdd(null)} />
        )}
      </Modal>
    </div>
  );
}
