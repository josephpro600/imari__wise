import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatters } from '@/hooks/useFormatters';
import { deleteExpense, deleteIncome } from '@/lib/finance-api';
import { sumAmounts, sumForMonth } from '@/lib/finance-calculations';
import { currentMonthKey } from '@/lib/format';
import type { Expense, Income } from '@/types/finance';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/app/StatCard';
import { PageHeader } from '@/components/app/PageHeader';
import { DataState } from '@/components/app/DataState';
import { TransactionRow } from '@/components/app/TransactionRow';
import { EntryForm } from '@/components/forms/EntryForm';
import { TrendingDown, TrendingUp } from 'lucide-react';

type EntryKind = 'income' | 'expense';

interface EntriesPageProps {
  kind: EntryKind;
}

export function EntriesPage({ kind }: EntriesPageProps) {
  const { t, money, month } = useFormatters();
  const { incomes, expenses, loading, loadFailed, refresh } = useFinance();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Income | Expense | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionFailed, setActionFailed] = useState(false);

  const isIncome = kind === 'income';
  const entries: (Income | Expense)[] = isIncome ? incomes : expenses;
  const currentMonth = currentMonthKey();

  const allTimeTotal = useMemo(() => sumAmounts(entries), [entries]);
  const monthTotal = useMemo(() => sumForMonth(entries, currentMonth), [entries, currentMonth]);

  const removeEntry = isIncome ? deleteIncome : deleteExpense;

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;
    setBusyId(id);
    setActionFailed(false);
    try {
      await removeEntry(id);
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

  const title = isIncome ? t('incomeTitle') : t('expensesTitle');
  const newLabel = isIncome ? t('newIncome') : t('newExpense');
  const emptyLabel = isIncome ? t('incomeEmpty') : t('expensesEmpty');

  return (
    <div className="fade-up">
      <PageHeader
        title={title}
        subtitle={isIncome ? t('incomeSubtitle') : t('expensesSubtitle')}
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            {newLabel}
          </Button>
        }
      />

      <DataState loading={loading} failed={loadFailed} onRetry={() => void refresh()}>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label={month(currentMonth)}
              value={money(monthTotal)}
              icon={isIncome ? TrendingUp : TrendingDown}
              tone={isIncome ? 'success' : 'accent'}
            />
            <StatCard
              label={isIncome ? t('incomeTotal') : t('expensesTotal')}
              value={money(allTimeTotal)}
              icon={isIncome ? TrendingUp : TrendingDown}
              tone="secondary"
            />
          </div>

          {actionFailed && (
            <p role="alert" className="rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
              {t('genericError')}
            </p>
          )}

          <section className="card overflow-hidden">
            {entries.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-stone-500">{emptyLabel}</p>
                <Button className="mt-6" variant="secondary" onClick={() => setCreating(true)}>
                  <Plus className="h-4 w-4" />
                  {newLabel}
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {entries.map((entry) => (
                  <TransactionRow
                    key={entry.id}
                    kind={kind}
                    category={'source' in entry ? entry.source : entry.category}
                    amount={entry.amount}
                    note={entry.note}
                    occurred_on={entry.occurred_on}
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={() => setEditing(entry)}
                          aria-label={t('edit')}
                          disabled={busyId === entry.id}
                          className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(entry.id)}
                          aria-label={t('delete')}
                          disabled={busyId === entry.id}
                          className="rounded-full p-2 text-stone-500 transition hover:bg-error-50 hover:text-error-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    }
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </DataState>

      <Modal open={creating || editing !== null} title={editing ? (isIncome ? t('editIncome') : t('editExpense')) : newLabel} onClose={closeModal}>
        {(creating || editing) && (
          <EntryForm kind={kind} initial={editing} onDone={closeModal} onCancel={closeModal} />
        )}
      </Modal>
    </div>
  );
}
