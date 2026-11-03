import type { LucideIcon } from 'lucide-react';

type Tone = 'primary' | 'secondary' | 'accent' | 'error' | 'success';

const ICON_TONE: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary-700',
  secondary: 'bg-secondary-50 text-secondary-700',
  accent: 'bg-accent-50 text-accent-700',
  error: 'bg-error-50 text-error-700',
  success: 'bg-success-50 text-success-700',
};

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
  valueClassName?: string;
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'primary', valueClassName = '' }: StatCardProps) {
  return (
    <div className="card p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-stone-600">{label}</p>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${ICON_TONE[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className={`mt-3 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl ${valueClassName}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-sm text-stone-500">{hint}</p>}
    </div>
  );
}
