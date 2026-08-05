'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
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

const translations = {
  en,
  si,
  ta,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [hasChosenLanguage, setHasChosenLanguageState] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved language from localStorage
    const saved = localStorage.getItem('mediscan-language') as Language | null;
    const chosen = localStorage.getItem('mediscan-language-chosen') === 'true';
    if (saved && ['en', 'si', 'ta'].includes(saved)) {
      setLanguageState(saved);
    }
    setHasChosenLanguageState(chosen);
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setHasChosenLanguageState(true);
    setShowLanguageModal(false);
    localStorage.setItem('mediscan-language', lang);
    localStorage.setItem('mediscan-language-chosen', 'true');
  };

  const setHasChosenLanguage = (chosen: boolean) => {
    setHasChosenLanguageState(chosen);
    localStorage.setItem('mediscan-language-chosen', chosen ? 'true' : 'false');
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
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
