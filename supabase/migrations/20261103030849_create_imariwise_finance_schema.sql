/*
# Create imariwise personal finance schema

Plain-English summary: adds everything the personal finance app needs to store
data per user. Each person who signs up only ever sees and changes their own
money records, profile, budgets and savings goals.

1. New Tables
- `profiles`: one row per user with display name, preferred language
  (rw = Kinyarwanda default, en, fr) and currency.
- `incomes`: money received (amount, source, note, date).
- `expenses`: money spent (amount, category, note, date).
- `budgets`: a monthly spending limit per expense category, one per user and category.
- `savings_goals`: named savings targets with target amount, amount saved so far and optional target date.

2. Automation
- When a new account is created, a profile row is added automatically with the
  name typed at sign-up.

3. Security
- Row level security is enabled on every new table.
- Every table is readable and writable only by its owner (`auth.uid()`).
- Only the signed-in role (`authenticated`) is granted access. Anonymous visitors get nothing.
- The automation function is not callable by app users.

4. Important notes
- Owner columns default to the signed-in user so inserts do not need to pass it.
- Amounts are stored as numbers with 2 decimal places and must be greater than zero.
- Categories are restricted to a fixed list so reports stay consistent.
- Statements are idempotent and safe to re-run.
*/

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'rw' CHECK (language IN ('rw', 'en', 'fr')),
  currency text NOT NULL DEFAULT 'RWF' CHECK (currency IN ('RWF', 'USD', 'EUR')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  source text NOT NULL CHECK (source IN ('salary', 'business', 'freelance', 'gift', 'other')),
  note text NOT NULL DEFAULT '',
  occurred_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  category text NOT NULL CHECK (category IN ('food', 'transport', 'housing', 'utilities', 'health', 'education', 'entertainment', 'shopping', 'other')),
  note text NOT NULL DEFAULT '',
  occurred_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('food', 'transport', 'housing', 'utilities', 'health', 'education', 'entertainment', 'shopping', 'other')),
  monthly_limit numeric(14,2) NOT NULL CHECK (monthly_limit > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) > 0),
  target_amount numeric(14,2) NOT NULL CHECK (target_amount > 0),
  saved_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incomes_user_date_idx ON incomes (user_id, occurred_on);
CREATE INDEX IF NOT EXISTS expenses_user_date_idx ON expenses (user_id, occurred_on);
CREATE INDEX IF NOT EXISTS budgets_user_idx ON budgets (user_id);
CREATE INDEX IF NOT EXISTS savings_goals_user_idx ON savings_goals (user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON incomes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON savings_goals TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_incomes" ON incomes;
CREATE POLICY "select_own_incomes" ON incomes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_incomes" ON incomes;
CREATE POLICY "insert_own_incomes" ON incomes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_incomes" ON incomes;
CREATE POLICY "update_own_incomes" ON incomes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_incomes" ON incomes;
CREATE POLICY "delete_own_incomes" ON incomes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_expenses" ON expenses;
CREATE POLICY "select_own_expenses" ON expenses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_expenses" ON expenses;
CREATE POLICY "insert_own_expenses" ON expenses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_expenses" ON expenses;
CREATE POLICY "update_own_expenses" ON expenses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_expenses" ON expenses;
CREATE POLICY "delete_own_expenses" ON expenses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_budgets" ON budgets;
CREATE POLICY "select_own_budgets" ON budgets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_budgets" ON budgets;
CREATE POLICY "insert_own_budgets" ON budgets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_budgets" ON budgets;
CREATE POLICY "update_own_budgets" ON budgets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_budgets" ON budgets;
CREATE POLICY "delete_own_budgets" ON budgets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_savings_goals" ON savings_goals;
CREATE POLICY "select_own_savings_goals" ON savings_goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_savings_goals" ON savings_goals;
CREATE POLICY "insert_own_savings_goals" ON savings_goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_savings_goals" ON savings_goals;
CREATE POLICY "update_own_savings_goals" ON savings_goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_savings_goals" ON savings_goals;
CREATE POLICY "delete_own_savings_goals" ON savings_goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
