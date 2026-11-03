import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatters } from '@/hooks/useFormatters';
import { toTransactions } from '@/lib/finance-calculations';
import { CATEGORY_LABEL_KEYS, SOURCE_LABEL_KEYS } from '@/lib/finance-labels';
import type { ExpenseCategory, IncomeSource } from '@/types/finance';
import { PageHeader } from '@/components/app/PageHeader';
import { DataState } from '@/components/app/DataState';
import { TransactionRow } from '@/components/app/TransactionRow';

type Filter = 'all' | 'income' | 'expense';

export function TransactionsPage() {
  const { t } = useFormatters();
  const { incomes, expenses, loading, loadFailed, refresh } = useFinance();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const transactions = useMemo(() => toTransactions(incomes, expenses), [incomes, expenses]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return transactions.filter((item) => {
      if (filter !== 'all' && item.kind !== filter) return false;
      if (!needle) return true;
      const label =
        item.kind === 'income'
          ? t(SOURCE_LABEL_KEYS[item.category as IncomeSource])
          : t(CATEGORY_LABEL_KEYS[item.category as ExpenseCategory]);
      return `${label} ${item.note}`.toLowerCase().includes(needle);
    });
  }, [transactions, filter, query, t]);

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: t('filterAll') },
    { value: 'income', label: t('filterIncome') },
    { value: 'expense', label: t('filterExpense') },
  ];

  return (
    <div className="fade-up">
      <PageHeader title={t('transactionsTitle')} subtitle={t('transactionsSubtitle')} />

      <DataState loading={loading} failed={loadFailed} onRetry={() => void refresh()}>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div role="group" aria-label={t('type')} className="inline-flex rounded-xl bg-stone-100 p-1">
              {filters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={filter === option.value}
                  onClick={() => setFilter(option.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    filter === option.value ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="relative block md:w-80">
              <span className="sr-only">{t('search')}</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="field-input pl-10"
              />
            </label>
          </div>

          <section className="card overflow-hidden">
            {transactions.length === 0 ? (
              <p className="p-12 text-center text-stone-500">{t('noTransactions')}</p>
            ) : visible.length === 0 ? (
              <p className="p-12 text-center text-stone-500">{t('noMatches')}</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {visible.map((item) => (
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
      </DataState>
    </div>
  );
}
