import type { Currency, Language } from '@/types/finance';

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  rw: 'en-GB',
  en: 'en-GB',
  fr: 'fr-FR',
};

export function formatMoney(amount: number, currency: Currency, language: Language): string {
  return new Intl.NumberFormat(LOCALE_BY_LANGUAGE[language], {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'RWF' ? 0 : 2,
  }).format(amount);
}

export function formatDate(isoDate: string, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE_BY_LANGUAGE[language], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00`));
}

export function formatMonth(monthKey: string, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE_BY_LANGUAGE[language], {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${monthKey}-01T00:00:00`));
}

export function formatShortMonth(monthKey: string, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE_BY_LANGUAGE[language], { month: 'short' }).format(
    new Date(`${monthKey}-01T00:00:00`),
  );
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function monthKeyOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function currentMonthKey(): string {
  return monthKeyOf(todayIso());
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function lastMonthKeys(endMonthKey: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => shiftMonth(endMonthKey, index - (count - 1)));
}
