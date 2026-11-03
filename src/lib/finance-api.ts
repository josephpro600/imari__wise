import { supabase } from '@/lib/supabase';
import type {
  Budget,
  Expense,
  ExpenseCategory,
  ExpenseInput,
  Income,
  IncomeInput,
  SavingsGoal,
} from '@/types/finance';

export interface FinanceData {
  incomes: Income[];
  expenses: Expense[];
  budgets: Budget[];
  goals: SavingsGoal[];
}

interface QueryResult {
  data: unknown;
  error: { message: string } | null;
}

function unwrap<T>(result: QueryResult): T {
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data as T;
}

async function run(query: PromiseLike<{ error: { message: string } | null }>): Promise<void> {
  const { error } = await query;
  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchFinanceData(): Promise<FinanceData> {
  const [incomes, expenses, budgets, goals] = await Promise.all([
    supabase
      .from('incomes')
      .select('id, amount, source, note, occurred_on')
      .order('occurred_on', { ascending: false }),
    supabase
      .from('expenses')
      .select('id, amount, category, note, occurred_on')
      .order('occurred_on', { ascending: false }),
    supabase.from('budgets').select('id, category, monthly_limit').order('category'),
    supabase
      .from('savings_goals')
      .select('id, name, target_amount, saved_amount, target_date')
      .order('created_at', { ascending: true }),
  ]);

  return {
    incomes: unwrap<Income[]>(incomes),
    expenses: unwrap<Expense[]>(expenses),
    budgets: unwrap<Budget[]>(budgets),
    goals: unwrap<SavingsGoal[]>(goals),
  };
}

export async function insertIncome(input: IncomeInput): Promise<void> {
  await run(supabase.from('incomes').insert(input));
}

export async function updateIncome(id: string, input: IncomeInput): Promise<void> {
  await run(supabase.from('incomes').update(input).eq('id', id));
}

export async function deleteIncome(id: string): Promise<void> {
  await run(supabase.from('incomes').delete().eq('id', id));
}

export async function insertExpense(input: ExpenseInput): Promise<void> {
  await run(supabase.from('expenses').insert(input));
}

export async function updateExpense(id: string, input: ExpenseInput): Promise<void> {
  await run(supabase.from('expenses').update(input).eq('id', id));
}

export async function deleteExpense(id: string): Promise<void> {
  await run(supabase.from('expenses').delete().eq('id', id));
}

export async function upsertBudget(category: ExpenseCategory, monthlyLimit: number): Promise<void> {
  await run(
    supabase
      .from('budgets')
      .upsert({ category, monthly_limit: monthlyLimit }, { onConflict: 'user_id,category' }),
  );
}

export async function deleteBudget(id: string): Promise<void> {
  await run(supabase.from('budgets').delete().eq('id', id));
}

export interface GoalInput {
  name: string;
  target_amount: number;
  target_date: string | null;
}

export async function insertGoal(input: GoalInput): Promise<void> {
  await run(supabase.from('savings_goals').insert({ ...input, saved_amount: 0 }));
}

export async function updateGoal(id: string, input: GoalInput): Promise<void> {
  await run(supabase.from('savings_goals').update(input).eq('id', id));
}

export async function setGoalSavedAmount(id: string, savedAmount: number): Promise<void> {
  await run(supabase.from('savings_goals').update({ saved_amount: savedAmount }).eq('id', id));
}

export async function deleteGoal(id: string): Promise<void> {
  await run(supabase.from('savings_goals').delete().eq('id', id));
}
