import { Wallet } from 'lucide-react';

interface LogoProps {
  light?: boolean;
}

export function Logo({ light = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-400 text-stone-900 shadow-sm">
        <Wallet className="h-5 w-5" strokeWidth={2.4} />
      </span>
      <span
        className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-stone-900'}`}
      >
        imariwise
      </span>
    </span>
  );
}
