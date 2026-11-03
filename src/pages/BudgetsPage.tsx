import { useMemo, useState } from 'react';
import { Pencil, PieChart, Plus, Trash2 } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatters } from '@/hooks/useFormatters';
import { deleteBudget } from '@/lib/finance-api';
import { budgetUsage, expenseByCategory } from '@/lib/finance-calculations';
import { CATEGORY_LABEL_KEYS } from '@/lib/finance-labels';
import { currentMonthKey } from '@/lib/format';
import type { Budget } from '@/types/finance';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/app/StatCard';
import { PageHeader } from '@/components/app/PageHeader';
import { DataState } from '@/components/app/DataState';
import { BudgetForm } from '@/components/forms/BudgetForm';

export function BudgetsPage() {
  const { t, money, month } = useFormatters();
  const { budgets, expenses, loading, loadFailed, refresh } = useFinance();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionFailed, setActionFailed] = useState(false);

  const currentMonth = currentMonthKey();
  const spentByCategory = useMemo(() => expenseByCategory(expenses, currentMonth), [expenses, currentMonth]);

  const totalLimit = budgets.reduce((sum, budget) => sum + budget.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + spentByCategory[budget.category], 0);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;
    setBusyId(id);
    setActionFailed(false);
    try {
      await deleteBudget(id);
      await refresh();
    } catch (error) {
      console.error(error);
      setActionFailed(true);
    } finally {
      setBusyId(null);
    }
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="fade-up">
      <PageHeader
        title={t('budgetsTitle')}
        subtitle={`${t('budgetsSubtitle')} · ${month(currentMonth)}`}
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            {t('setBudget')}
          </Button>
        }
      />

      <DataState loading={loading} failed={loadFailed} onRetry={() => void refresh()}>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label={t('budgetLimit')} value={money(totalLimit)} icon={PieChart} tone="secondary" />
            <StatCard label={t('spent')} value={money(totalSpent)} icon={PieChart} tone="accent" />
          </div>

          {actionFailed && (
            <p role="alert" className="rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
              {t('genericError')}
            </p>
          )}

          {budgets.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-stone-500">{t('budgetsEmpty')}</p>
              <Button className="mt-6" variant="secondary" onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" />
                {t('setBudget')}
              </Button>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {budgets.map((budget) => {
                const spent = spentByCategory[budget.category];
                const ratio = budgetUsage(budget, spent);
                const tone = ratio > 1 ? 'error' : ratio >= 0.8 ? 'warning' : 'primary';
                const label = t(CATEGORY_LABEL_KEYS[budget.category]);
                return (
                  <li key={budget.id} className="card space-y-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-stone-900">{label}</h2>
                        <p className="text-sm text-stone-500">
                          {t('budgetLimit')}: {money(budget.monthly_limit)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(budget)}
                          aria-label={t('edit')}
                          disabled={busyId === budget.id}
                          className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(budget.id)}
                          aria-label={t('delete')}
                          disabled={busyId === budget.id}
                          className="rounded-full p-2 text-stone-500 transition hover:bg-error-50 hover:text-error-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <ProgressBar ratio={ratio} tone={tone} label={label} />

                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-stone-600">
                        {t('spent')}: <span className="font-semibold text-stone-900">{money(spent)}</span>
                      </span>
                      {ratio > 1 ? (
                        <span className="font-semibold text-error-700">
                          {t('overBudget', { amount: money(spent - budget.monthly_limit) })}
                        </span>
                      ) : (
                        <span className="text-stone-600">
                          {t('remaining')}: {money(budget.monthly_limit - spent)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DataState>

      <Modal open={creating || editing !== null} title={editing ? t('editBudget') : t('setBudget')} onClose={closeModal}>
        {(creating || editing) && <BudgetForm initial={editing} onDone={closeModal} onCancel={closeModal} />}
      </Modal>
    </div>
  );
}
