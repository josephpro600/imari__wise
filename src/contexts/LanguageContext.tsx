import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { translations, type TranslationKey } from '@/i18n/translations';
import type { Language } from '@/types/finance';

const STORAGE_KEY = 'imariwise-language';
const DEFAULT_LANGUAGE: Language = 'rw';

interface LanguageValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageValue | null>(null);

function readStoredLanguage(): Language {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'en' || stored === 'fr' || stored === 'rw' ? stored : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useAuth();
  const [stored, setStored] = useState<Language>(readStoredLanguage);
  const language = profile?.language ?? stored;

  const setLanguage = useCallback(
    (next: Language) => {
      window.localStorage.setItem(STORAGE_KEY, next);
      setStored(next);
      if (profile) {
        updateProfile({ language: next }).catch((error: unknown) => console.error(error));
      }
    },
    [profile, updateProfile],
  );

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let text: string = translations[language][key];
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replace(`{${name}}`, String(value));
        }
      }
      return text;
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
