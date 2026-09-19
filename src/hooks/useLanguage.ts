'use client';

import { useState, useEffect, useCallback } from 'react';
import { translations, type Language, type TranslationDictionary } from '@/lib/i18n/translations';

export function useLanguage(storageKey: string = 'agnos_lang_patient', defaultLang: Language = 'th') {
  const [lang, setLangState] = useState<Language>(defaultLang);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'th' || saved === 'en') {
        setLangState(saved);
      }
    } catch {
      // localStorage may fail in private mode or SSR
    }
    setIsHydrated(true);
  }, [storageKey]);

  const setLang = useCallback(
    (newLang: Language) => {
      setLangState(newLang);
      try {
        localStorage.setItem(storageKey, newLang);
      } catch {
        // ignore
      }
    },
    [storageKey]
  );

  const t = translations[lang] as TranslationDictionary;

  return {
    lang,
    setLang,
    t,
    isHydrated,
  };
}
