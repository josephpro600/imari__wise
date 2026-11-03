import { useState, type FormEvent } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatters } from '@/hooks/useFormatters';
import { insertExpense, insertIncome, updateExpense, updateIncome } from '@/lib/finance-api';
import { CATEGORY_LABEL_KEYS, SOURCE_LABEL_KEYS } from '@/lib/finance-labels';
import { todayIso } from '@/lib/format';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, type Expense, type ExpenseCategory, type Income, type IncomeSource } from '@/types/finance';
import { Button } from '@/components/ui/Button';
import { FormField, parseAmount } from '@/components/ui/FormField';

interface EntryFormProps {
  kind: 'income' | 'expense';
  initial: Income | Expense | null;
  onDone: () => void;
  onCancel: () => void;
}

export function EntryForm({ kind, initial, onDone, onCancel }: EntryFormProps) {
  const { t } = useFormatters();
  const { refresh } = useFinance();
  const isIncome = kind === 'income';

  const initialChoice = initial
    ? 'source' in initial
      ? initial.source
      : initial.category
    : isIncome
      ? 'salary'
      : 'food';

  const [amountText, setAmountText] = useState(initial ? String(initial.amount) : '');
  const [choice, setChoice] = useState<string>(initialChoice);
  const [note, setNote] = useState(initial?.note ?? '');
  const [occurredOn, setOccurredOn] = useState(initial?.occurred_on ?? todayIso());
  const [amountError, setAmountError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = parseAmount(amountText);
    if (amount === null) {
      setAmountError(t('invalidAmount'));
      return;
    }
    setAmountError(null);
    setFormError(null);
    setSubmitting(true);
    try {
      const base = { amount, note: note.trim(), occurred_on: occurredOn };
      if (isIncome) {
        const input = { ...base, source: choice as IncomeSource };
        if (initial) await updateIncome(initial.id, input);
        else await insertIncome(input);
      } else {
        const input = { ...base, category: choice as ExpenseCategory };
        if (initial) await updateExpense(initial.id, input);
        else await insertExpense(input);
      }
      await refresh();
      onDone();
    } catch (error) {
      console.error(error);
      setFormError(t('genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputId = `${kind}-amount`;
  const choiceId = `${kind}-choice`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormField label={t('amount')} htmlFor={inputId} error={amountError}>
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={amountText}
          onChange={(event) => setAmountText(event.target.value)}
          placeholder="0"
          className="field-input text-lg font-semibold"
          autoFocus
        />
      </FormField>

      <FormField label={isIncome ? t('source') : t('category')} htmlFor={choiceId}>
        <select id={choiceId} value={choice} onChange={(event) => setChoice(event.target.value)} className="field-input">
          {isIncome
            ? INCOME_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {t(SOURCE_LABEL_KEYS[source])}
                </option>
              ))
            : EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {t(CATEGORY_LABEL_KEYS[category])}
                </option>
              ))}
        </select>
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label={t('date')} htmlFor={`${kind}-date`}>
          <input
            id={`${kind}-date`}
            type="date"
            value={occurredOn}
            onChange={(event) => setOccurredOn(event.target.value)}
            className="field-input"
          />
        </FormField>
        <FormField label={t('note')} htmlFor={`${kind}-note`}>
          <input
            id={`${kind}-note`}
            type="text"
            value={note}
            maxLength={200}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t('notePlaceholder')}
            className="field-input"
          />
        </FormField>
      </div>

      {formError && (
        <p role="alert" className="rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
          {formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? t('loading') : t('save')}
        </Button>
      </div>
    </form>
  );
}
