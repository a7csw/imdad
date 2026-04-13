import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';
export type Language = 'ar' | 'en' | 'ku';

interface ThemeState {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  resolvedTheme: () => 'dark' | 'light';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'ar',

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      setLanguage: (language) => {
        set({ language });
        applyLanguage(language);
      },

      resolvedTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
      },
    }),
    { name: 'imdad-theme' }
  )
);

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;
  root.classList.remove('dark', 'light');
  root.classList.add(resolved);
}

export function applyLanguage(language: Language) {
  const root = document.documentElement;
  root.setAttribute('lang', language);
  root.setAttribute('dir', language === 'en' ? 'ltr' : 'rtl');
}
