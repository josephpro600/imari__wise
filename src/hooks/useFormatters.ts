import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, formatMonth, formatMoney, formatShortMonth } from '@/lib/format';

export function useFormatters() {
  const { language, t } = useLanguage();
  const { profile } = useAuth();
  const currency = profile?.currency ?? 'RWF';

  return useMemo(
    () => ({
      language,
      t,
      currency,
      money: (amount: number) => formatMoney(amount, currency, language),
      date: (isoDate: string) => formatDate(isoDate, language),
      month: (monthKey: string) => formatMonth(monthKey, language),
      shortMonth: (monthKey: string) => formatShortMonth(monthKey, language),
    }),
    [language, t, currency],
  );
}
