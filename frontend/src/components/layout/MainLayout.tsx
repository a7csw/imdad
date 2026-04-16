import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import { useLanguageDirection } from '@/hooks/useLanguageDirection';
import { prefersReducedMotion } from '@/lib/motion';

export default function MainLayout() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const { enterX, exitX } = useLanguageDirection();

  const transitionKey = `${location.pathname}-${i18n.language}`;
  const initialX = prefersReducedMotion ? 0 : enterX;
  const exitXVal = prefersReducedMotion ? 0 : exitX;
  const dur = prefersReducedMotion ? 0 : 0.35;

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Header />
      <main className="flex-1" style={{ overflowX: 'hidden', width: '100%' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={transitionKey}
            initial={{ opacity: 0, x: initialX }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: exitXVal }}
            transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
