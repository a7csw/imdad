import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { applyTheme, applyLanguage } from './store/theme.store';
import LanguageTransitionOverlay from './components/layout/LanguageTransitionOverlay';
import './lib/i18n';
import './styles/globals.css';

// Apply persisted theme and language on startup
try {
  const stored = localStorage.getItem('imdad-theme');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.theme) applyTheme(state.theme);
    if (state?.language) applyLanguage(state.language);
  } else {
    applyTheme('dark');
    applyLanguage('ar');
  }
} catch {
  applyTheme('dark');
  applyLanguage('ar');
}

// Keep system theme in sync with OS preference changes
const mq = window.matchMedia('(prefers-color-scheme: dark)');
mq.addEventListener('change', () => {
  try {
    const stored = localStorage.getItem('imdad-theme');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.theme === 'system') applyTheme('system');
    }
  } catch { /* ignore */ }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <RouterProvider router={router} />
      <LanguageTransitionOverlay />
    </>
  </StrictMode>
);
