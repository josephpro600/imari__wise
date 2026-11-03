import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string | null;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-stone-700">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-sm font-medium text-error-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function parseAmount(raw: string): number | null {
  const value = Number(raw.replace(/\s/g, '').replace(/,/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
}
