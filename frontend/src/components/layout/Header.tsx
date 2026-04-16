import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, Package,
  Sun, Moon, Monitor, Globe, ChevronDown, Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useThemeStore, applyLanguage } from '@/store/theme.store';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useLangTransitionStore } from '@/lib/langTransition';
import logoDarkSrc from '@/assets/brand/logo-primary.svg';
import logoLightSrc from '@/assets/brand/logo-light.svg';
import Button from '../ui/Button';
import CartDrawer from '@/features/cart/CartDrawer';
import { fadeUp, staggerContainer } from '@/lib/motion';

const LANGUAGES = [
  { code: 'ar' as const, flag: '🇮🇶', label: 'العربية', short: 'AR' },
  { code: 'en' as const, flag: '🌐', label: 'English',  short: 'EN' },
  { code: 'ku' as const, flag: '🏔️', label: 'کوردی',    short: 'KU' },
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { totalItems } = useCartStore();
  const { theme, language, setTheme, setLanguage } = useThemeStore();
  const { trigger: triggerLangTransition } = useLangTransitionStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const themeMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close theme menu on outside click (existing inline pattern — unchanged)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close language dropdown on outside click
  useClickOutside(langMenuRef as React.RefObject<HTMLElement>, () => setLangMenuOpen(false));

  const cartCount = totalItems();

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  function changeLanguage(code: 'ar' | 'en' | 'ku') {
    if (code === language) { setLangMenuOpen(false); return; }
    setLangMenuOpen(false);
    triggerLangTransition(language, code, () => {
      setLanguage(code);
      i18n.changeLanguage(code);
      applyLanguage(code);
    });
  }

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  // Determine background colors based on theme
  const isLight =
    theme === 'light' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: light)').matches);

  const bgScrolled    = isLight ? 'rgba(248,246,240,0.88)' : 'rgba(8,8,16,0.88)';
  const bgClear       = isLight ? 'rgba(248,246,240,0)'    : 'rgba(8,8,16,0)';
  const borderScrolled = isLight ? 'rgba(0,0,0,0.08)'     : 'rgba(255,255,255,0.07)';
  const borderClear    = 'rgba(0,0,0,0)';

  const navLinks = [
    { to: '/marketplace', label: t('nav.marketplace') },
    { to: '/stores',      label: t('nav.stores') },
    { to: '/about',       label: t('nav.about') },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors duration-200 pb-0.5 ${
      isActive
        ? 'text-primary border-b-2 border-gold'
        : 'text-secondary hover:text-primary'
    }`;

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 border-b ${isScrolled ? 'backdrop-blur-xl shadow-xl' : ''}`}
        animate={{
          backgroundColor: isScrolled ? bgScrolled : bgClear,
          borderBottomColor: isScrolled ? borderScrolled : borderClear,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src={isLight ? logoLightSrc : logoDarkSrc} alt="Imdad" className="h-9" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">

              {/* Theme toggle dropdown (unchanged) */}
              <div className="relative" ref={themeMenuRef}>
                <button
                  onClick={() => setThemeMenuOpen((v) => !v)}
                  className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-2 transition-all"
                  aria-label="Theme"
                >
                  {theme === 'light'
                    ? <Sun className="w-4 h-4" />
                    : theme === 'system'
                    ? <Monitor className="w-4 h-4" />
                    : <Moon className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {themeMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute end-0 top-full mt-2 w-36 bg-surface border border-default rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      {([
                        ['light',  t('theme.light'),  Sun],
                        ['dark',   t('theme.dark'),   Moon],
                        ['system', t('theme.system'), Monitor],
                      ] as const).map(([val, label, Icon]) => (
                        <button
                          key={val}
                          onClick={() => { setTheme(val); setThemeMenuOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-surface-2 ${theme === val ? 'text-gold' : 'text-secondary'}`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" /> {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language dropdown */}
              <div className="relative hidden md:block" ref={langMenuRef}>
                <button
                  onClick={() => setLangMenuOpen((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 text-sm font-medium ${
                    langMenuOpen
                      ? 'border-gold text-gold'
                      : 'border-default text-secondary hover:border-gold hover:text-gold'
                  }`}
                >
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-wide inline-block overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={i18n.language}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="inline-block"
                      >
                        {currentLang.short}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${langMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {langMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0,  scale: 1 }}
                      exit={{ opacity: 0,    y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute end-0 top-full mt-2 w-40 bg-surface-2 border border-strong rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.3)] z-50 p-1.5"
                    >
                      {LANGUAGES.map((lang) => {
                        const isActive = language === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? 'text-gold'
                                : 'text-secondary hover:bg-surface-3 hover:text-primary'
                            }`}
                          >
                            <span>{lang.flag}</span>
                            <span
                              style={{
                                fontFamily:
                                  lang.code === 'en'
                                    ? 'Inter, sans-serif'
                                    : 'Cairo, sans-serif',
                              }}
                              className="flex-1 text-start"
                            >
                              {lang.label}
                            </span>
                            {isActive && (
                              <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-2 transition-all"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -end-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </button>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-2 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
                      <span className="text-dark-900 font-bold text-sm">
                        {user?.name[0].toUpperCase()}
                      </span>
                    </div>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute end-0 top-full mt-2 w-52 bg-surface border border-default rounded-2xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-default">
                          <p className="font-semibold text-primary text-sm">{user?.name}</p>
                          <p className="text-xs text-secondary">{user?.email}</p>
                        </div>
                        <div className="p-1">
                          {user?.role === 'BUYER' && (
                            <>
                              <MenuLink to="/profile" icon={<User className="w-4 h-4" />} label={t('nav.profile')} onClick={() => setUserMenuOpen(false)} />
                              <MenuLink to="/orders" icon={<Package className="w-4 h-4" />} label={t('nav.orders')} onClick={() => setUserMenuOpen(false)} />
                            </>
                          )}
                          {user?.role === 'STORE_OWNER' && (
                            <MenuLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label={t('nav.dashboard')} onClick={() => setUserMenuOpen(false)} />
                          )}
                          {user?.role === 'ADMIN' && (
                            <MenuLink to="/admin" icon={<LayoutDashboard className="w-4 h-4" />} label={t('nav.admin')} onClick={() => setUserMenuOpen(false)} />
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-accent hover:bg-accent/10 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            {t('nav.logout')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                    {t('nav.login')}
                  </Button>
                  <Button size="sm" onClick={() => navigate('/register')}>
                    {t('nav.register')}
                  </Button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-secondary hover:bg-surface-2"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Full-screen mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-bg-page flex flex-col"
          >
            {/* Close button row */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-default">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <img src={isLight ? logoLightSrc : logoDarkSrc} alt="Imdad" className="h-9" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-secondary hover:bg-surface-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.div
              variants={staggerContainer(0.07, 0.1)}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-1 p-6 flex-1 overflow-y-auto"
            >
              {/* Nav links */}
              {navLinks.map((link) => (
                <motion.div key={link.to} variants={fadeUp}>
                  <NavLink
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                        isActive
                          ? 'text-gold bg-gold/10'
                          : 'text-primary hover:bg-surface-2'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}

              {/* Language selector */}
              <motion.div variants={fadeUp} className="mt-4">
                <div className="border-t border-default pt-4">
                  <p className="text-xs text-tertiary font-medium uppercase tracking-wider px-4 mb-2">
                    {t('nav.language') ?? 'Language'}
                  </p>
                  <div className="flex flex-col gap-1">
                    {LANGUAGES.map((lang) => {
                      const isActive = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => { changeLanguage(lang.code); setMobileOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors border-s-2 ${
                            isActive
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-transparent text-primary hover:bg-surface-2'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span
                            style={{
                              fontFamily:
                                lang.code === 'en'
                                  ? 'Inter, sans-serif'
                                  : 'Cairo, sans-serif',
                            }}
                          >
                            {lang.label}
                          </span>
                          <span className="ms-auto text-sm opacity-50">{lang.short}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Auth buttons */}
              {!isAuthenticated && (
                <motion.div variants={fadeUp} className="flex flex-col gap-3 mt-4">
                  <Button variant="ghost" fullWidth onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                    {t('nav.login')}
                  </Button>
                  <Button fullWidth onClick={() => { navigate('/register'); setMobileOpen(false); }}>
                    {t('nav.register')}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function MenuLink({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-2 rounded-xl transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
