import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.mn;
}

const LS_KEY = 'goy-house-lang';

const getInitialLang = (): Language => {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === 'en' || stored === 'mn') return stored;
  } catch {
    // localStorage not available (SSR / private mode)
  }
  return 'mn';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLang);

  const setLanguage = (lang: Language) => {
    try {
      localStorage.setItem(LS_KEY, lang);
    } catch {
      // ignore
    }
    setLanguageState(lang);
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
