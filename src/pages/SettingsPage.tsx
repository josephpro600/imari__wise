import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFormatters } from '@/hooks/useFormatters';
import { PageHeader } from '@/components/app/PageHeader';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import type { Currency } from '@/types/finance';

const CURRENCIES: Currency[] = ['RWF', 'USD', 'EUR'];

export function SettingsPage() {
  const { t } = useFormatters();
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [currency, setCurrency] = useState<Currency>(profile?.currency ?? 'RWF');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');
    try {
      await updateProfile({ full_name: fullName.trim(), currency });
      setStatus('saved');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="fade-up">
      <PageHeader title={t('settingsTitle')} subtitle={t('settingsSubtitle')} />

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="card space-y-6 p-6 lg:col-span-2 sm:p-8" noValidate>
          <h2 className="text-lg font-bold text-stone-900">{t('profile')}</h2>

          <FormField label={t('fullName')} htmlFor="settings-name">
            <input
              id="settings-name"
              type="text"
              value={fullName}
              maxLength={80}
              onChange={(event) => {
                setFullName(event.target.value);
                setStatus('idle');
              }}
              className="field-input"
            />
          </FormField>

          <FormField label={t('currency')} htmlFor="settings-currency">
            <select
              id="settings-currency"
              value={currency}
              onChange={(event) => {
                setCurrency(event.target.value as Currency);
                setStatus('idle');
              }}
              className="field-input"
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <p className="text-sm text-stone-500">{t('currencyHint')}</p>
          </FormField>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p role="status" className="text-sm font-medium text-success-700">
              {status === 'saved' ? t('profileSaved') : ''}
            </p>
            <Button type="submit" disabled={status === 'saving'}>
              {status === 'saving' ? t('loading') : t('saveChanges')}
            </Button>
          </div>
          {status === 'error' && (
            <p role="alert" className="rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
              {t('genericError')}
            </p>
          )}
        </form>

        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <h2 className="text-lg font-bold text-stone-900">{t('preferences')}</h2>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-stone-700">{t('language')}</p>
              <LanguageSwitcher />
            </div>
          </section>

          <section className="card space-y-3 p-6">
            <h2 className="text-lg font-bold text-stone-900">{t('account')}</h2>
            <p className="text-sm text-stone-600">
              {t('accountEmail')}: <span className="font-semibold text-stone-900">{user?.email}</span>
            </p>
            <p className="text-sm text-stone-500">{t('signOutHint')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
