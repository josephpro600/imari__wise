export type Language = 'rw' | 'en' | 'fr';
export type Currency = 'RWF' | 'USD' | 'EUR';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'utilities'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'shopping'
  | 'other';

export type IncomeSource = 'salary' | 'business' | 'freelance' | 'gift' | 'other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'food',
  'transport',
  'housing',
  'utilities',
  'health',
  'education',
  'entertainment',
  'shopping',
  'other',
];

export const INCOME_SOURCES: IncomeSource[] = ['salary', 'business', 'freelance', 'gift', 'other'];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: '#0f766e',
  transport: '#0ea5e9',
  housing: '#f59e0b',
  utilities: '#6366f1',
  health: '#f43f5e',
  education: '#10b981',
  entertainment: '#f97316',
  shopping: '#84cc16',
  other: '#78716c',
};

export interface Profile {
  user_id: string;
  full_name: string;
  language: Language;
  currency: Currency;
}

export interface Income {
  id: string;
  amount: number;
  source: IncomeSource;
  note: string;
  occurred_on: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  note: string;
  occurred_on: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthly_limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
}

export interface EntryInput {
  amount: number;
  note: string;
  occurred_on: string;
}

export interface IncomeInput extends EntryInput {
  source: IncomeSource;
}

export interface ExpenseInput extends EntryInput {
  category: ExpenseCategory;
}
