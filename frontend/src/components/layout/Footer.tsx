import { Link } from 'react-router-dom';
import { MessageCircle, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoSrc from '@/assets/brand/logo-primary.svg';

export default function Footer() {
  const { t } = useTranslation();

  const sections = [
    { to: '/marketplace', label: t('marketplace.title') },
    { to: '/stores',      label: t('stores.title') },
    { to: '/about',       label: t('about.title') },
  ];

  const accountLinks = [
    { to: '/login',    label: t('auth.login') },
    { to: '/register', label: t('auth.register') },
    { to: '/orders',   label: t('nav.orders') },
    { to: '/profile',  label: t('nav.profile') },
  ];

  return (
    <footer className="bg-surface-2 border-t border-default mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <img src={logoSrc} alt="Imdad" className="h-10 w-auto" />
            <p className="text-sm text-secondary leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-surface text-secondary hover:text-gold hover:bg-surface-3 transition-all">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-surface text-secondary hover:text-gold hover:bg-surface-3 transition-all">
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-primary text-sm font-display">{t('footer.sections')}</h4>
            <nav className="flex flex-col gap-2">
              {sections.map((link) => (
                <Link key={link.to} to={link.to} className="text-sm text-secondary hover:text-gold transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-primary text-sm font-display">{t('footer.account')}</h4>
            <nav className="flex flex-col gap-2">
              {accountLinks.map((link) => (
                <Link key={link.to} to={link.to} className="text-sm text-secondary hover:text-gold transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-default mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-tertiary">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-tertiary">
            {t('footer.cod_only')}
          </p>
        </div>
      </div>
    </footer>
  );
}
