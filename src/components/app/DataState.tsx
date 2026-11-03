import type { ReactNode } from 'react';
import { useFormatters } from '@/hooks/useFormatters';
import { Button } from '@/components/ui/Button';

interface DataStateProps {
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
  children: ReactNode;
}

export function DataState({ loading, failed, onRetry, children }: DataStateProps) {
  const { t } = useFormatters();

  if (loading) {
    return (
      <div className="card flex items-center justify-center p-12">
        <p className="text-sm font-medium text-stone-500">{t('loading')}</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="card flex flex-col items-center gap-4 p-12 text-center">
        <p className="font-semibold text-stone-800">{t('genericError')}</p>
        <Button variant="secondary" onClick={onRetry}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
