import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatters } from '@/hooks/useFormatters';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart, type DonutSlice } from '@/components/charts/DonutChart';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/app/StatCard';
import { PageHeader } from '@/components/app/PageHeader';
import { DataState } from '@/components/app/DataState';
import {
  expenseByCategory,
  monthlyTotals,
  sumForMonth,
} from '@/lib/finance-calculations';
import { CATEGORY_LABEL_KEYS } from '@/lib/finance-labels';
import { currentMonthKey, lastMonthKeys, shiftMonth } from '@/lib/format';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '@/types/finance';
import { exportExcel, exportPdf, type ReportData } from '@/lib/report-export';

export function ReportsPage() {
  const { t, money, date, month, shortMonth } = useFormatters();
  const { incomes, expenses, loading, loadFailed, refresh } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const isCurrentMonth = selectedMonth === currentMonthKey();

  const monthIncome = sumForMonth(incomes, selectedMonth);
  const monthExpense = sumForMonth(expenses, selectedMonth);
  const net = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? Math.max(net, 0) / monthIncome : 0;

  const byCategory = useMemo(() => expenseByCategory(expenses, selectedMonth), [expenses, selectedMonth]);

  const slices: DonutSlice[] = EXPENSE_CATEGORIES.filter((category) => byCategory[category] > 0)
    .map((category) => ({
      key: category,
      label: t(CATEGORY_LABEL_KEYS[category]),
      value: byCategory[category],
      color: CATEGORY_COLORS[category],
    }))
    .sort((a, b) => b.value - a.value);

  const topSlice = slices[0];

  const reportData = useMemo<ReportData>(() => {
    const monthIncomes = incomes.filter((income) => income.occurred_on.startsWith(selectedMonth));
    const monthExpenses = expenses.filter((expense) => expense.occurred_on.startsWith(selectedMonth));

    return {
      title: t('reportsTitle'),
      periodLabel: month(selectedMonth),
      summaryRows: [
        [t('monthIncomeTotal'), money(monthIncome)],
        [t('monthExpenseTotal'), money(monthExpense)],
        [t('netSavings'), money(net)],
        [t('savingsRate'), `${Math.round(savingsRate * 100)}%`],
      ],
      sections: [
        {
          heading: t('categoryBreakdown'),
          columns: [t('category'), t('amount')],
          rows: slices.map((slice) => [slice.label, money(slice.value)]),
        },
        {
          heading: t('incomeTitle'),
          columns: [t('source'), t('amount'), t('date'), t('note')],
          rows: monthIncomes.map((income) => [income.source, money(income.amount), date(income.occurred_on), income.note || '']),
        },
        {
          heading: t('expensesTitle'),
          columns: [t('category'), t('amount'), t('date'), t('note')],
          rows: monthExpenses.map((expense) => [t(CATEGORY_LABEL_KEYS[expense.category]), money(expense.amount), date(expense.occurred_on), expense.note || '']),
        },
      ],
    };
  }, [date, expenses, incomes, month, monthExpense, monthIncome, money, net, savingsRate, selectedMonth, slices, t]);

  const trend = useMemo(
    () =>
      monthlyTotals(incomes, expenses, lastMonthKeys(selectedMonth, 6)).map((row) => ({
        label: shortMonth(row.month),
        income: row.income,
        expense: row.expense,
      })),
    [incomes, expenses, selectedMonth, shortMonth],
  );

  return (
    <div className="fade-up">
      <PageHeader
        title={t('reportsTitle')}
        subtitle={t('reportsSubtitle')}
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="md"
              className="gap-2"
              onClick={() => exportPdf(reportData)}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t('exportPdf')}</span>
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="gap-2"
              onClick={() => exportExcel(reportData)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">{t('exportExcel')}</span>
            </Button>
            <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white p-1 shadow-sm">
            <Button
              variant="ghost"
              size="md"
              className="!rounded-full !px-3"
              aria-label={t('monthPrev')}
              onClick={() => setSelectedMonth((current) => shiftMonth(current, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[9rem] text-center text-sm font-bold capitalize text-stone-900">
              {month(selectedMonth)}
            </span>
            <Button
              variant="ghost"
              size="md"
              className="!rounded-full !px-3"
              aria-label={t('monthNext')}
              disabled={isCurrentMonth}
              onClick={() => setSelectedMonth((current) => shiftMonth(current, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            </div>
          </div>
        }
      />

      <DataState loading={loading} failed={loadFailed} onRetry={() => void refresh()}>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t('monthIncomeTotal')} value={money(monthIncome)} icon={TrendingUp} tone="success" />
            <StatCard label={t('monthExpenseTotal')} value={money(monthExpense)} icon={TrendingDown} tone="accent" />
            <StatCard
              label={t('netSavings')}
              value={money(net)}
              icon={Wallet}
              tone="primary"
              valueClassName={net < 0 ? 'text-error-700' : ''}
            />
            <StatCard
              label={t('savingsRate')}
              value={`${Math.round(savingsRate * 100)}%`}
              hint={t('savingsRateHint')}
              icon={PiggyBank}
              tone="secondary"
            />
          </div>

          {incomes.length === 0 && expenses.length === 0 ? (
            <div className="card p-12 text-center text-stone-500">{t('noReportData')}</div>
          ) : (
            <>
              <section className="card p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-stone-900">{t('incomeVsExpense')}</h2>
                  <p className="text-sm text-stone-500">{t('monthlyTrendHint')}</p>
                </div>
                <BarChart
                  data={trend}
                  incomeLabel={t('income')}
                  expenseLabel={t('expense')}
                  formatValue={(amount) => money(amount)}
                />
              </section>

              <section className="card grid gap-8 p-6 lg:grid-cols-5">
                <div className="lg:col-span-2">
                  <h2 className="text-lg font-bold text-stone-900">{t('categoryBreakdown')}</h2>
                  <p className="mb-6 text-sm text-stone-500">
                    {topSlice ? `${t('topCategory')}: ${topSlice.label}` : t('noSpending')}
                  </p>
                  {slices.length > 0 && (
                    <DonutChart slices={slices} centerLabel={t('monthExpenses')} centerValue={money(monthExpense)} />
                  )}
                </div>
                <ul className="space-y-4 lg:col-span-3">
                  {slices.map((slice) => {
                    const share = monthExpense === 0 ? 0 : slice.value / monthExpense;
                    return (
                      <li key={slice.key} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                            <span className="truncate font-semibold text-stone-800">{slice.label}</span>
                          </span>
                          <span className="shrink-0 tabular-nums text-stone-900">
                            {money(slice.value)} · {Math.round(share * 100)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full transition-[width] duration-700"
                            style={{ width: `${share * 100}%`, backgroundColor: slice.color }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          )}
        </div>
      </DataState>
    </div>
  );
}
