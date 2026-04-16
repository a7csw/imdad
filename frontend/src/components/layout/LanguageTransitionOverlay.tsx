import { useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useLangTransitionStore, type TransitionDir } from '@/lib/langTransition';
import type { Language } from '@/store/theme.store';
import { CINEMA_EASE } from '@/lib/motion';

// ── Font per language ────────────────────────────────────────────────────────
const FONT: Record<Language, string> = {
  ar: "'Cairo', sans-serif",
  en: "'Inter', sans-serif",
  ku: "'Cairo', sans-serif",
};

// ── Off-screen entry position ────────────────────────────────────────────────
function enterVec(dir: TransitionDir) {
  if (dir === 'from-right') return { x: '106%',  y: '0%'   };
  if (dir === 'from-left')  return { x: '-106%', y: '0%'   };
  return                           { x: '0%',    y: '106%'  };
}

// ── Off-screen exit position ─────────────────────────────────────────────────
function exitVec(dir: TransitionDir) {
  if (dir === 'from-right') return { x: '-106%', y: '0%'   };
  if (dir === 'from-left')  return { x: '106%',  y: '0%'   };
  return                           { x: '0%',    y: '-106%' };
}

// ── Leading-edge shimmer (gold line on the advancing edge of the panel) ──────
function shimmerStyle(dir: TransitionDir): React.CSSProperties {
  const vertGrad = 'linear-gradient(to bottom, transparent 0%, #C9A84C 40%, #E2C06A 50%, #C9A84C 60%, transparent 100%)';
  const horizGrad = 'linear-gradient(to right, transparent 0%, #C9A84C 40%, #E2C06A 50%, #C9A84C 60%, transparent 100%)';
  if (dir === 'from-right')
    return { position: 'absolute', left:   0, top: 0, bottom: 0, width:  2, background: vertGrad,  pointerEvents: 'none' };
  if (dir === 'from-left')
    return { position: 'absolute', right:  0, top: 0, bottom: 0, width:  2, background: vertGrad,  pointerEvents: 'none' };
  return   { position: 'absolute', top:    0, left: 0, right:  0, height: 2, background: horizGrad, pointerEvents: 'none' };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function LanguageTransitionOverlay() {
  const { active, direction, targetLang, targetLabel, _fire, _done } =
    useLangTransitionStore();

  const panelCtrl = useAnimationControls();
  const labelCtrl = useAnimationControls();
  const lineCtrl  = useAnimationControls();
  const isRunning = useRef(false);

  useEffect(() => {
    if (!active || isRunning.current) return;
    isRunning.current = true;

    const ep = enterVec(direction);
    const xp = exitVec(direction);

    void (async () => {
      // ── Reset all elements to start state ──────────────────────────────
      panelCtrl.set(ep);
      labelCtrl.set({ opacity: 0, scale: 0.78, y: 40,  filter: 'blur(14px)' });
      lineCtrl.set({  scaleX: 0, opacity: 0 });

      // ① Panel sweeps in (covers screen)
      await panelCtrl.start({
        x: '0%', y: '0%',
        transition: { duration: 0.54, ease: CINEMA_EASE },
      });

      // ② Language change fires while panel covers everything
      _fire();

      // ③ Gold rules draw from center
      void lineCtrl.start({
        scaleX: 1, opacity: 1,
        transition: { duration: 0.3, ease: CINEMA_EASE },
      });

      // ④ Language label blooms in with blur-dissolve
      await labelCtrl.start({
        opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 0.36, ease: CINEMA_EASE, delay: 0.08 },
      });

      // ⑤ Hold at peak
      await new Promise<void>((r) => setTimeout(r, 400));

      // ⑥ Label + rules fade out
      void labelCtrl.start({
        opacity: 0, scale: 0.93, y: -22, filter: 'blur(8px)',
        transition: { duration: 0.24 },
      });
      await lineCtrl.start({
        scaleX: 0, opacity: 0,
        transition: { duration: 0.24 },
      });

      // ⑦ Panel sweeps out to reveal updated page
      await panelCtrl.start({
        ...xp,
        transition: { duration: 0.54, ease: CINEMA_EASE },
      });

      isRunning.current = false;
      _done();
    })();
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      animate={panelCtrl}
      initial={{ x: '106%', y: '0%' }}
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ${
        active ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* ── Dark base panel ─────────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #05050c 0%, #0a0a17 55%, #060610 100%)',
        }}
      />

      {/* ── Radial gold ambient glow ─────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(201,168,76,0.13) 0%, rgba(201,168,76,0.03) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Leading-edge shimmer line ────────────────────────────────────── */}
      <div style={shimmerStyle(direction)} />

      {/* ── Centred content ─────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center gap-6 select-none text-center">

        {/* Top gold rule */}
        <motion.div
          animate={lineCtrl}
          initial={{ scaleX: 0, opacity: 0 }}
          style={{ originX: 0.5 }}
          className="w-32 h-px"
        >
          <div
            className="w-full h-full"
            style={{
              background: 'linear-gradient(to right, transparent 0%, #C9A84C 35%, #E2C06A 50%, #C9A84C 65%, transparent 100%)',
            }}
          />
        </motion.div>

        {/* Language name */}
        <motion.div
          animate={labelCtrl}
          initial={{ opacity: 0, scale: 0.78, y: 40 }}
        >
          <span
            dir={targetLang === 'en' ? 'ltr' : 'rtl'}
            style={{
              fontFamily: FONT[targetLang],
              color: '#C9A84C',
              fontSize: 'clamp(3.5rem, 9vw, 7.5rem)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              display: 'block',
              // subtle text glow
              textShadow: '0 0 60px rgba(201,168,76,0.35), 0 0 120px rgba(201,168,76,0.15)',
            }}
          >
            {targetLabel}
          </span>
        </motion.div>

        {/* Bottom gold rule */}
        <motion.div
          animate={lineCtrl}
          initial={{ scaleX: 0, opacity: 0 }}
          style={{ originX: 0.5 }}
          className="w-32 h-px"
        >
          <div
            className="w-full h-full"
            style={{
              background: 'linear-gradient(to right, transparent 0%, #C9A84C 35%, #E2C06A 50%, #C9A84C 65%, transparent 100%)',
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
