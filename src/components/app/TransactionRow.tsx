import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { CATEGORY_LABEL_KEYS, SOURCE_LABEL_KEYS } from '@/lib/finance-labels';
import type { ExpenseCategory, IncomeSource } from '@/types/finance';

interface TransactionRowProps {
  kind: 'income' | 'expense';
  category: string;
  amount: number;
  note: string;
  occurred_on: string;
  actions?: ReactNode;
}

export function TransactionRow({ kind, category, amount, note, occurred_on, actions }: TransactionRowProps) {
  const { t, money, date } = useFormatters();
  const isIncome = kind === 'income';
  const label = isIncome
    ? t(SOURCE_LABEL_KEYS[category as IncomeSource])
    : t(CATEGORY_LABEL_KEYS[category as ExpenseCategory]);
  const Icon = isIncome ? TrendingUp : TrendingDown;

  return (
    <li className="flex items-center gap-4 px-4 py-4 transition hover:bg-stone-50 sm:px-6">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
          isIncome ? 'bg-success-50 text-success-700' : 'bg-accent-50 text-accent-700'
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-stone-900">{label}</p>
        <p className="truncate text-sm text-stone-500">
          {note ? `${note} · ${date(occurred_on)}` : date(occurred_on)}
        </p>
      </div>
      <p
        className={`shrink-0 text-right font-bold tabular-nums ${
          isIncome ? 'text-success-700' : 'text-stone-900'
        }`}
      >
        {isIncome ? '+' : '-'}
        {money(amount)}
      </p>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </li>
  );
}
