import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchFinanceData, type FinanceData } from '@/lib/finance-api';
import { useAuth } from '@/contexts/AuthContext';

interface FinanceValue extends FinanceData {
  loading: boolean;
  loadFailed: boolean;
  refresh: () => Promise<void>;
}

const EMPTY_DATA: FinanceData = { incomes: [], expenses: [], budgets: [], goals: [] };

const FinanceContext = createContext<FinanceValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [data, setData] = useState<FinanceData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchFinanceData();
      setData(next);
      setLoadFailed(false);
    } catch (error) {
      console.error(error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setData(EMPTY_DATA);
      setLoading(false);
      return;
    }
    setLoading(true);
    void refresh();
  }, [userId, refresh]);

  const value = useMemo<FinanceValue>(
    () => ({ ...data, loading, loadFailed, refresh }),
    [data, loading, loadFailed, refresh],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceValue {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used inside FinanceProvider');
  }
  return context;
}
