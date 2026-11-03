import { useState, type FormEvent } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatters } from '@/hooks/useFormatters';
import { insertGoal, updateGoal } from '@/lib/finance-api';
import { todayIso } from '@/lib/format';
import type { SavingsGoal } from '@/types/finance';
import { Button } from '@/components/ui/Button';
import { FormField, parseAmount } from '@/components/ui/FormField';

interface GoalFormProps {
  initial: SavingsGoal | null;
  onDone: () => void;
  onCancel: () => void;
}

export function GoalForm({ initial, onDone, onCancel }: GoalFormProps) {
  const { t } = useFormatters();
  const { refresh } = useFinance();

  const [name, setName] = useState(initial?.name ?? '');
  const [targetText, setTargetText] = useState(initial ? String(initial.target_amount) : '');
  const [targetDate, setTargetDate] = useState(initial?.target_date ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const target = parseAmount(targetText);
    setNameError(trimmedName ? null : t('required'));
    setTargetError(target === null ? t('invalidAmount') : null);
    if (!trimmedName || target === null) return;

    setFormError(null);
    setSubmitting(true);
    try {
      const input = {
        name: trimmedName,
        target_amount: target,
        target_date: targetDate || null,
      };
      if (initial) await updateGoal(initial.id, input);
      else await insertGoal(input);
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
      <FormField label={t('goalName')} htmlFor="goal-name" error={nameError}>
        <input
          id="goal-name"
          type="text"
          value={name}
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('goalNamePlaceholder')}
          className="field-input"
          autoFocus
        />
      </FormField>

      <FormField label={t('targetAmount')} htmlFor="goal-target" error={targetError}>
        <input
          id="goal-target"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={targetText}
          onChange={(event) => setTargetText(event.target.value)}
          placeholder="0"
          className="field-input text-lg font-semibold"
        />
      </FormField>

      <FormField label={t('targetDate')} htmlFor="goal-date">
        <input
          id="goal-date"
          type="date"
          min={todayIso()}
          value={targetDate}
          onChange={(event) => setTargetDate(event.target.value)}
          className="field-input"
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
