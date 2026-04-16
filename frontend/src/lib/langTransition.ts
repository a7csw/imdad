import { create } from 'zustand';
import type { Language } from '@/store/theme.store';

export type TransitionDir = 'from-right' | 'from-left' | 'from-bottom';

export const LANG_LABELS: Record<Language, string> = {
  ar: 'العربية',
  en: 'English',
  ku: 'کوردی',
};

function resolveDir(from: Language, to: Language): TransitionDir {
  const fromRtl = from !== 'en';
  const toRtl   = to   !== 'en';
  if (fromRtl && !toRtl) return 'from-right'; // AR/KU → EN: panel sweeps from right
  if (!fromRtl && toRtl) return 'from-left';  // EN → AR/KU: panel sweeps from left
  return 'from-bottom';                         // AR ↔ KU:   vertical wipe
}

interface State {
  active:          boolean;
  direction:       TransitionDir;
  targetLang:      Language;
  targetLabel:     string;
  pendingCallback: (() => void) | null;
  trigger:         (from: Language, to: Language, cb: () => void) => void;
  _fire:           () => void;
  _done:           () => void;
}

export const useLangTransitionStore = create<State>((set, get) => ({
  active:          false,
  direction:       'from-right',
  targetLang:      'ar',
  targetLabel:     '',
  pendingCallback: null,

  trigger(from, to, cb) {
    if (get().active) return; // already transitioning — drop rapid repeat
    set({
      active:          true,
      direction:       resolveDir(from, to),
      targetLang:      to,
      targetLabel:     LANG_LABELS[to],
      pendingCallback: cb,
    });
  },

  _fire() {
    get().pendingCallback?.();
    set({ pendingCallback: null });
  },

  _done() {
    set({ active: false });
  },
}));
