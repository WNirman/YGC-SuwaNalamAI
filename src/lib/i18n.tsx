'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useSyncExternalStore,
} from 'react';
import en from './translations/en.json';
import si from './translations/si.json';
import ta from './translations/ta.json';

export type Language = 'en' | 'si' | 'ta';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  hasChosenLanguage: boolean;
  setHasChosenLanguage: (chosen: boolean) => void;
  showLanguageModal: boolean;
  setShowLanguageModal: (show: boolean) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Record<string, unknown>> = {
  en,
  si,
  ta,
};

const LANG_KEY = 'mediscan-language';
const CHOSEN_KEY = 'mediscan-language-chosen';

const listeners = new Set<() => void>();
function emitChange() {
  listeners.forEach((l) => l());
}
function subscribe(callback: () => void) {
  listeners.add(callback);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', callback);
    }
  };
}

function getStoredLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'si' || saved === 'ta') return saved;
  } catch {
    /* ignore storage errors */
  }
  return 'en';
}

function getStoredHasChosen(): boolean {
  try {
    return localStorage.getItem(CHOSEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore<Language>(
    subscribe,
    getStoredLanguage,
    () => 'en'
  );
  const hasChosenLanguage = useSyncExternalStore<boolean>(
    subscribe,
    getStoredHasChosen,
    () => false
  );
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.setAttribute('data-lang', language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setShowLanguageModal(false);
    try {
      localStorage.setItem(LANG_KEY, lang);
      localStorage.setItem(CHOSEN_KEY, 'true');
    } catch {
      /* ignore storage errors */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('data-lang', lang);
    }
    emitChange();
  };

  const setHasChosenLanguage = (chosen: boolean) => {
    try {
      localStorage.setItem(CHOSEN_KEY, chosen ? 'true' : 'false');
    } catch {
      /* ignore storage errors */
    }
    emitChange();
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        hasChosenLanguage,
        setHasChosenLanguage,
        showLanguageModal,
        setShowLanguageModal,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
