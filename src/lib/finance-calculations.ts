import type { Budget, Expense, ExpenseCategory, Income } from '@/types/finance';
import { EXPENSE_CATEGORIES } from '@/types/finance';
import { monthKeyOf } from '@/lib/format';

export interface Transaction {
  id: string;
  kind: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  occurred_on: string;
}

export interface MonthlyTotals {
  month: string;
  income: number;
  expense: number;
}

export function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function sumForMonth<T extends { amount: number; occurred_on: string }>(
  items: T[],
  monthKey: string,
): number {
  return sumAmounts(items.filter((item) => monthKeyOf(item.occurred_on) === monthKey));
}

export function monthlyTotals(
  incomes: Income[],
  expenses: Expense[],
  monthKeys: string[],
): MonthlyTotals[] {
  return monthKeys.map((month) => ({
    month,
    income: sumForMonth(incomes, month),
    expense: sumForMonth(expenses, month),
  }));
}

export function expenseByCategory(expenses: Expense[], monthKey: string): Record<ExpenseCategory, number> {
  const totals = Object.fromEntries(EXPENSE_CATEGORIES.map((category) => [category, 0])) as Record<
    ExpenseCategory,
    number
  >;
  for (const expense of expenses) {
    if (monthKeyOf(expense.occurred_on) === monthKey) {
      totals[expense.category] += expense.amount;
    }
  }
  return totals;
}

export function budgetUsage(budget: Budget, spent: number): number {
  return budget.monthly_limit === 0 ? 0 : spent / budget.monthly_limit;
}

export function toTransactions(incomes: Income[], expenses: Expense[]): Transaction[] {
  const incomeRows: Transaction[] = incomes.map((income) => ({
    id: income.id,
    kind: 'income',
    amount: income.amount,
    category: income.source,
    note: income.note,
    occurred_on: income.occurred_on,
  }));
  const expenseRows: Transaction[] = expenses.map((expense) => ({
    id: expense.id,
    kind: 'expense',
    amount: expense.amount,
    category: expense.category,
    note: expense.note,
    occurred_on: expense.occurred_on,
  }));
  return [...incomeRows, ...expenseRows].sort((a, b) =>
    b.occurred_on.localeCompare(a.occurred_on),
  );
}
