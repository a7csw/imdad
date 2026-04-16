import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';

export type Dir = 'ltr' | 'rtl';

const getDir = (lang: string): Dir => (lang === 'en' ? 'ltr' : 'rtl');

export function useLanguageDirection() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const prevLangRef = useRef<string>(currentLang);

  const currentDir = getDir(currentLang);
  const prevDir = getDir(prevLangRef.current);

  useEffect(() => {
    prevLangRef.current = currentLang;
  }, [currentLang]);

  // AR ↔ KU (both RTL) → neutral fade with no horizontal slide.
  const sameDirection = currentDir === prevDir;
  const exitX = sameDirection ? 0 : currentDir === 'ltr' ? 60 : -60;
  const enterX = sameDirection ? 0 : currentDir === 'ltr' ? -60 : 60;

  return { currentLang, currentDir, prevDir, exitX, enterX };
}
