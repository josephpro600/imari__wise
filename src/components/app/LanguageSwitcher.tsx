import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/types/finance';

const OPTIONS: { value: Language; short: string; name: string }[] = [
  { value: 'rw', short: 'RW', name: 'Ikinyarwanda' },
  { value: 'en', short: 'EN', name: 'English' },
  { value: 'fr', short: 'FR', name: 'Français' },
];

interface LanguageSwitcherProps {
  tone?: 'light' | 'dark';
}

export function LanguageSwitcher({ tone = 'dark' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const isLight = tone === 'light';

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-full p-1 text-xs font-bold ${
        isLight ? 'bg-white/15 backdrop-blur' : 'bg-stone-100'
      }`}
    >
      {OPTIONS.map((option) => {
        const active = option.value === language;
        return (
          <button
            key={option.value}
            type="button"
            title={option.name}
            aria-pressed={active}
            onClick={() => setLanguage(option.value)}
            className={`rounded-full px-3 py-1.5 transition duration-200 ${
              active
                ? 'bg-white text-stone-900 shadow-sm'
                : isLight
                  ? 'text-white hover:bg-white/20'
                  : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {option.short}
          </button>
        );
      })}
    </div>
  );
}
