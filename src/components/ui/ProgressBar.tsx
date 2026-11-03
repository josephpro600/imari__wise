type Tone = 'primary' | 'warning' | 'error' | 'success';

const TONE_CLASSES: Record<Tone, string> = {
  primary: 'bg-primary-600',
  warning: 'bg-warning-500',
  error: 'bg-error-600',
  success: 'bg-success-600',
};

interface ProgressBarProps {
  ratio: number;
  tone?: Tone;
  label: string;
}

export function ProgressBar({ ratio, tone = 'primary', label }: ProgressBarProps) {
  const percent = Math.max(0, Math.min(ratio, 1)) * 100;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${TONE_CLASSES[tone]}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
