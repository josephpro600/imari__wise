import { useState, type FormEvent } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatters } from '@/hooks/useFormatters';
import { setGoalSavedAmount } from '@/lib/finance-api';
import type { SavingsGoal } from '@/types/finance';
import { Button } from '@/components/ui/Button';
import { FormField, parseAmount } from '@/components/ui/FormField';

interface ContributionFormProps {
  goal: SavingsGoal;
  onDone: () => void;
  onCancel: () => void;
}

type Mode = 'deposit' | 'withdraw';

export function ContributionForm({ goal, onDone, onCancel }: ContributionFormProps) {
  const { t, money } = useFormatters();
  const { refresh } = useFinance();

  const [mode, setMode] = useState<Mode>('deposit');
  const [amountText, setAmountText] = useState('');
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
    const nextSaved = mode === 'deposit' ? goal.saved_amount + amount : goal.saved_amount - amount;
    if (nextSaved < 0) {
      setAmountError(t('invalidAmount'));
      return;
    }
    setAmountError(null);
    setFormError(null);
    setSubmitting(true);
    try {
      await setGoalSavedAmount(goal.id, nextSaved);
      await refresh();
      onDone();
    } catch (error) {
      console.error(error);
      setFormError(t('genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  const modeOptions: { value: Mode; label: string }[] = [
    { value: 'deposit', label: t('deposit') },
    { value: 'withdraw', label: t('withdraw') },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <p className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-900">
        {t('savedSoFar')}: <span className="font-bold">{money(goal.saved_amount)}</span>
      </p>

      <div role="group" aria-label={t('addSavings')} className="grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1">
        {modeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={mode === option.value}
            onClick={() => setMode(option.value)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              mode === option.value ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <FormField
        label={mode === 'deposit' ? t('amountToAdd') : t('amountToWithdraw')}
        htmlFor="contribution-amount"
        error={amountError}
      >
        <input
          id="contribution-amount"
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
