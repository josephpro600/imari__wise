import { useState, type FormEvent } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatters } from '@/hooks/useFormatters';
import { upsertBudget } from '@/lib/finance-api';
import { CATEGORY_LABEL_KEYS } from '@/lib/finance-labels';
import { EXPENSE_CATEGORIES, type Budget, type ExpenseCategory } from '@/types/finance';
import { Button } from '@/components/ui/Button';
import { FormField, parseAmount } from '@/components/ui/FormField';

interface BudgetFormProps {
  initial: Budget | null;
  onDone: () => void;
  onCancel: () => void;
}

export function BudgetForm({ initial, onDone, onCancel }: BudgetFormProps) {
  const { t } = useFormatters();
  const { budgets, refresh } = useFinance();

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (category) => !budgets.some((budget) => budget.category === category),
  );
  const categories = initial ? [initial.category] : availableCategories;

  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? categories[0] ?? 'food');
  const [limitText, setLimitText] = useState(initial ? String(initial.monthly_limit) : '');
  const [limitError, setLimitError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const limit = parseAmount(limitText);
    if (limit === null) {
      setLimitError(t('invalidAmount'));
      return;
    }
    setLimitError(null);
    setFormError(null);
    setSubmitting(true);
    try {
      await upsertBudget(category, limit);
      await refresh();
      onDone();
    } catch (error) {
      console.error(error);
      setFormError(t('genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormField label={t('budgetCategory')} htmlFor="budget-category">
        <select
          id="budget-category"
          value={category}
          disabled={Boolean(initial)}
          onChange={(event) => setCategory(event.target.value as ExpenseCategory)}
          className="field-input disabled:bg-stone-50 disabled:text-stone-500"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {t(CATEGORY_LABEL_KEYS[item])}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={t('budgetLimit')} htmlFor="budget-limit" error={limitError}>
        <input
          id="budget-limit"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={limitText}
          onChange={(event) => setLimitText(event.target.value)}
          placeholder="0"
          className="field-input text-lg font-semibold"
          autoFocus
        />
      </FormField>

      {formError && (
        <p role="alert" className="rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
          {formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={submitting || categories.length === 0}>
          {submitting ? t('loading') : t('save')}
        </Button>
      </div>
    </form>
  );
}
