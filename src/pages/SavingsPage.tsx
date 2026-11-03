import { useState } from 'react';
import { CalendarDays, Pencil, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatters } from '@/hooks/useFormatters';
import { deleteGoal } from '@/lib/finance-api';
import type { SavingsGoal } from '@/types/finance';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/app/StatCard';
import { PageHeader } from '@/components/app/PageHeader';
import { DataState } from '@/components/app/DataState';
import { GoalForm } from '@/components/forms/GoalForm';
import { ContributionForm } from '@/components/forms/ContributionForm';

type GoalModal =
  | { type: 'new' }
  | { type: 'edit'; goal: SavingsGoal }
  | { type: 'contribute'; goal: SavingsGoal };

export function SavingsPage() {
  const { t, money, date } = useFormatters();
  const { goals, loading, loadFailed, refresh } = useFinance();
  const [modal, setModal] = useState<GoalModal | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionFailed, setActionFailed] = useState(false);

  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved_amount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;
    setBusyId(id);
    setActionFailed(false);
    try {
      await deleteGoal(id);
      await refresh();
    } catch (error) {
      console.error(error);
      setActionFailed(true);
    } finally {
      setBusyId(null);
    }
  };

  const closeModal = () => setModal(null);

  const modalTitle =
    modal?.type === 'edit' ? t('editGoal') : modal?.type === 'contribute' ? t('addSavingsTitle', { name: modal.goal.name }) : t('newGoal');

  return (
    <div className="fade-up">
      <PageHeader
        title={t('savingsTitle')}
        subtitle={t('savingsSubtitle')}
        action={
          <Button onClick={() => setModal({ type: 'new' })}>
            <Plus className="h-4 w-4" />
            {t('newGoal')}
          </Button>
        }
      />

      <DataState loading={loading} failed={loadFailed} onRetry={() => void refresh()}>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label={t('savedSoFar')} value={money(totalSaved)} icon={PiggyBank} tone="success" />
            <StatCard label={t('targetAmount')} value={money(totalTarget)} icon={PiggyBank} tone="secondary" />
          </div>

          {actionFailed && (
            <p role="alert" className="rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
              {t('genericError')}
            </p>
          )}

          {goals.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-stone-500">{t('savingsEmpty')}</p>
              <Button className="mt-6" variant="secondary" onClick={() => setModal({ type: 'new' })}>
                <Plus className="h-4 w-4" />
                {t('newGoal')}
              </Button>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {goals.map((goal) => {
                const ratio = goal.target_amount === 0 ? 0 : goal.saved_amount / goal.target_amount;
                const reached = goal.saved_amount >= goal.target_amount;
                return (
                  <li key={goal.id} className="card flex flex-col gap-5 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-stone-900">{goal.name}</h2>
                        {goal.target_date && (
                          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-stone-500">
                            <CalendarDays className="h-4 w-4" />
                            {t('dueOn', { date: date(goal.target_date) })}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setModal({ type: 'edit', goal })}
                          aria-label={t('edit')}
                          disabled={busyId === goal.id}
                          className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(goal.id)}
                          aria-label={t('delete')}
                          disabled={busyId === goal.id}
                          className="rounded-full p-2 text-stone-500 transition hover:bg-error-50 hover:text-error-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-end justify-between gap-3">
                        <p className="text-2xl font-extrabold tracking-tight text-stone-900">{money(goal.saved_amount)}</p>
                        <p className="text-sm text-stone-500">/ {money(goal.target_amount)}</p>
                      </div>
                      <ProgressBar ratio={ratio} tone={reached ? 'success' : 'primary'} label={goal.name} />
                      <p className="text-sm font-medium text-stone-600">
                        {reached
                          ? t('goalComplete')
                          : `${t('percentSaved', { percent: Math.floor(ratio * 100) })} · ${t('leftToSave', { amount: money(goal.target_amount - goal.saved_amount) })}`}
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      className="mt-auto w-full"
                      onClick={() => setModal({ type: 'contribute', goal })}
                    >
                      {t('addSavings')}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DataState>

      <Modal open={modal !== null} title={modalTitle} onClose={closeModal}>
        {modal?.type === 'contribute' && (
          <ContributionForm goal={modal.goal} onDone={closeModal} onCancel={closeModal} />
        )}
        {modal?.type === 'edit' && <GoalForm initial={modal.goal} onDone={closeModal} onCancel={closeModal} />}
        {modal?.type === 'new' && <GoalForm initial={null} onDone={closeModal} onCancel={closeModal} />}
      </Modal>
    </div>
  );
}
