import type { ExpenseCategory, IncomeSource } from '@/types/finance';
import type { TranslationKey } from '@/i18n/translations';

export const CATEGORY_LABEL_KEYS: Record<ExpenseCategory, TranslationKey> = {
  food: 'categoryFood',
  transport: 'categoryTransport',
  housing: 'categoryHousing',
  utilities: 'categoryUtilities',
  health: 'categoryHealth',
  education: 'categoryEducation',
  entertainment: 'categoryEntertainment',
  shopping: 'categoryShopping',
  other: 'categoryOther',
};

export const SOURCE_LABEL_KEYS: Record<IncomeSource, TranslationKey> = {
  salary: 'sourceSalary',
  business: 'sourceBusiness',
  freelance: 'sourceFreelance',
  gift: 'sourceGift',
  other: 'sourceOther',
};
