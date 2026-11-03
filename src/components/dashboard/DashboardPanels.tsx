import { Link } from '@/lib/router';
import { useFormatters } from '@/hooks/useFormatters';
import { useFinance } from '@/contexts/FinanceContext';
import { budgetUsage } from '@/lib/finance-calculations';
import { CATEGORY_LABEL_KEYS } from '@/lib/finance-labels';
import type { Budget, ExpenseCategory } from '@/types/finance';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface BudgetStatusCardProps {
  budgets: Budget[];
  spentByCategory: Record<ExpenseCategory, number>;
}

export function BudgetStatusCard({ budgets, spentByCategory }: BudgetStatusCardProps) {
  const { t, money } = useFormatters();

  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-stone-900">{t('budgetStatus')}</h2>
        <Link to="/app/budgets" className="text-sm font-semibold text-primary-700 hover:text-primary-900">
          {t('viewAll')}
        </Link>
      </div>

      {budgets.length === 0 ? (
        <p className="text-sm text-stone-500">{t('noBudgets')}</p>
      ) : (
        <ul className="space-y-5">
          {budgets.map((budget) => {
            const spent = spentByCategory[budget.category];
            const ratio = budgetUsage(budget, spent);
            const tone = ratio > 1 ? 'error' : ratio >= 0.8 ? 'warning' : 'primary';
            return (
              <li key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-stone-800">{t(CATEGORY_LABEL_KEYS[budget.category])}</span>
                  <span className="tabular-nums text-stone-600">
                    {money(spent)} / {money(budget.monthly_limit)}
                  </span>
                </div>
                <ProgressBar ratio={ratio} tone={tone} label={t(CATEGORY_LABEL_KEYS[budget.category])} />
                {ratio > 1 && (
                  <p className="text-xs font-semibold text-error-700">
                    {t('overBudget', { amount: money(spent - budget.monthly_limit) })}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function SavingsSummaryCard() {
  const { t, money } = useFormatters();
  const { goals } = useFinance();

  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved_amount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const overallRatio = totalTarget === 0 ? 0 : totalSaved / totalTarget;

  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-stone-900">{t('savingsProgress')}</h2>
        <Link to="/app/savings" className="text-sm font-semibold text-primary-700 hover:text-primary-900">
          {t('viewAll')}
        </Link>
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-stone-500">{t('noGoals')}</p>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-stone-900">{Math.round(overallRatio * 100)}%</p>
            <p className="mt-1 text-sm text-stone-600">
              {t('savingsProgressText', { saved: money(totalSaved), target: money(totalTarget) })}
            </p>
          </div>
          <ProgressBar ratio={overallRatio} tone="success" label={t('savingsProgress')} />
          <ul className="space-y-3 border-t border-stone-100 pt-4">
            {goals.slice(0, 3).map((goal) => (
              <li key={goal.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-stone-800">{goal.name}</span>
                <span className="shrink-0 tabular-nums text-stone-600">
                  {Math.round((goal.target_amount === 0 ? 0 : goal.saved_amount / goal.target_amount) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
