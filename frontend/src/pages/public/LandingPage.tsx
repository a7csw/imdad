import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Truck, Wallet, Headphones, ChevronRight, Star, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/shared/ProductCard';
import StoreCard from '@/components/shared/StoreCard';
import { ProductCardSkeleton, StoreCardSkeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import type { Product, Store, Category } from '@/types';
import {
  fadeUp, fadeIn, staggerContainer, slideLeft, slideRight,
  scaleIn, lineReveal, revealVariant, getVariant,
  CINEMA_EASE, prefersReducedMotion, viewportReveal,
} from '@/lib/motion';
import { useCountUp } from '@/hooks/useCountUp';
import { getCategoryName } from '@/lib/utils';

const categoryIcons: Record<string, string> = {
  protein: '💪',
  creatine: '⚡',
  'pre-workout': '🔥',
  'mass-gainer': '🏋️',
  bcaa: '🧬',
  vitamins: '💊',
  'fat-burners': '🔥',
  accessories: '🎽',
};

const MARQUEE_TEXT =
  'AUTHENTIC  •  FAST DELIVERY  •  18 PROVINCES  •  500+ PRODUCTS  •  TRUSTED STORES  •  ';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { numericValue: 500,   suffix: '+',  label: t('home.stats_products_label') },
    { numericValue: 50,    suffix: '+',  label: t('home.stats_stores_label') },
    { numericValue: 10000, suffix: '',   label: t('home.stats_orders_label') },
    { numericValue: 18,    suffix: '',   label: t('home.stats_provinces') },
  ];

  const whyItems = [
    { icon: Shield,     titleKey: 'home.why_authentic', descKey: 'home.why_authentic_desc', color: 'text-gold' },
    { icon: Truck,      titleKey: 'home.why_delivery',  descKey: 'home.why_delivery_desc',  color: 'text-blue-400' },
    { icon: Wallet,     titleKey: 'home.why_cod',       descKey: 'home.why_cod_desc',       color: 'text-green-400' },
    { icon: Headphones, titleKey: 'home.why_support',   descKey: 'home.why_support_desc',   color: 'text-purple-400' },
  ] as const;

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes, storeRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?featured=true&limit=8'),
          api.get('/stores?limit=4'),
        ]);
        setCategories(catRes.data);
        setFeatured(prodRes.data.products ?? []);
        setStores(storeRes.data.stores ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const isRtl = ['ar', 'ku'].includes(i18n.language);

  return (
    <div className="flex flex-col">
      {/* ── HERO — Cinematic Split Entrance ──────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background — fades in last */}
        <motion.div
          className="absolute inset-0"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="absolute inset-0 bg-page" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%)' }}
          />
          <div className="absolute top-0 end-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 start-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl animate-float-slow" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Hero text — each element has its own cinematic delay */}
          <div className="max-w-3xl">
            {/* Badge: delay 0 */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0 }}
              className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold text-sm px-4 py-1.5 rounded-full mb-6"
            >
              <Zap className="w-4 h-4" />
              <span>منصة المكملات الغذائية الأولى في العراق</span>
            </motion.div>

            {/* Headline line 1: delay 0.15s, slides up from y:60 */}
            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: CINEMA_EASE }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display leading-tight mb-2"
            >
              {t('home.hero_title')}
            </motion.h1>

            {/* Headline line 2 (highlighted): delay 0.3s */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: CINEMA_EASE }}
              className="mb-6"
            >
              <span className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display leading-tight text-gradient-gold">
                {t('home.hero_title_highlight')}
              </span>
            </motion.div>

            {/* Subheadline: delay 0.45s */}
            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: CINEMA_EASE }}
              className="text-lg sm:text-xl text-secondary leading-relaxed mb-10 max-w-2xl"
            >
              {t('home.hero_subtitle')}
            </motion.p>

            {/* CTA buttons: staggered delay 0.6 / 0.7s */}
            <div className="flex flex-wrap gap-4">
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: CINEMA_EASE }}
              >
                <Link to="/marketplace">
                  <Button size="lg" className="gap-2 shadow-[0_0_30px_rgba(201,168,76,0.3)]">
                    {t('home.cta_browse')}
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: CINEMA_EASE }}
              >
                <Link to="/stores">
                  <Button size="lg" variant="secondary">
                    {t('home.cta_stores')}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Stats — staggered, scroll-triggered */}
          <motion.div
            variants={getVariant(staggerContainer(0.1, 0.1))}
            initial="hidden"
            whileInView="visible"
            viewport={viewportReveal}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ────────────────────────────────────────── */}
      <div className="overflow-hidden py-4 bg-surface-2 border-y border-default" aria-hidden>
        <div
          className="marquee-track"
          style={{ animationDirection: isRtl ? 'reverse' : 'normal' }}
        >
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="flex-shrink-0 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-gold/70 px-12"
            >
              {Array(6).fill(MARQUEE_TEXT).join('   ')}
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <SectionHeader title={t('home.categories_title')} viewAllLabel={t('home.view_all')} to="/marketplace" />
        <motion.div
          variants={getVariant(staggerContainer(0.06, 0.05))}
          initial="hidden"
          whileInView="visible"
          viewport={viewportReveal}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={getVariant(scaleIn)}>
              <Link
                to={`/marketplace?categoryId=${cat.id}`}
                className="flex flex-col items-center gap-2 p-3 bg-surface border border-default rounded-2xl hover:border-gold/30 hover:bg-surface-2 transition-all group"
              >
                <span className="text-2xl">{categoryIcons[cat.slug] ?? '📦'}</span>
                <span className="text-xs font-medium text-secondary group-hover:text-primary text-center">{getCategoryName(cat, i18n.language)}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <SectionHeader title={t('home.featured_title')} viewAllLabel={t('home.view_all')} to="/marketplace?featured=true" />
        <motion.div
          variants={getVariant(staggerContainer(0.06, 0.05))}
          initial="hidden"
          whileInView="visible"
          viewport={viewportReveal}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </motion.div>
        {!loading && featured.length === 0 && (
          <div className="text-center py-16 text-secondary">
            <p>{t('home.no_featured')}</p>
          </div>
        )}
      </section>

      {/* ── WHY IMDAD ────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-2 border-y border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={getVariant(revealVariant)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportReveal}
            className="text-3xl font-bold text-center font-display mb-12"
          >
            {t('home.why_title')}
          </motion.h2>
          <motion.div
            variants={getVariant(staggerContainer(0.1, 0.05))}
            initial="hidden"
            whileInView="visible"
            viewport={viewportReveal}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {whyItems.map(({ icon: Icon, titleKey, descKey, color }, i) => (
              <motion.div
                key={titleKey}
                variants={getVariant(i % 2 === 0 ? slideLeft : slideRight)}
                className="flex flex-col items-center text-center gap-4 p-6 bg-surface rounded-2xl border border-default hover:border-gold/20 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-primary font-display">{t(titleKey)}</h3>
                  <p className="text-sm text-secondary mt-1">{t(descKey)}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TOP STORES ───────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <SectionHeader title={t('home.stores_title')} viewAllLabel={t('home.view_all')} to="/stores" />
        <motion.div
          variants={getVariant(staggerContainer(0.08, 0.05))}
          initial="hidden"
          whileInView="visible"
          viewport={viewportReveal}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <StoreCardSkeleton key={i} />)
            : stores.map((s) => <StoreCard key={s.id} store={s} />)}
        </motion.div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={getVariant(scaleIn)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportReveal}
            className="relative bg-gradient-to-r from-surface to-surface-2 border border-gold/20 rounded-3xl p-10 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent" />
            <div className="relative">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-gold text-gold" />)}
              </div>
              <h2 className="text-3xl font-bold font-display mb-4">
                {t('home.cta_title')}
              </h2>
              <p className="text-secondary mb-8 max-w-xl mx-auto">
                {t('home.cta_subtitle')}
              </p>
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  {t('home.cta_register')}
                  <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ numericValue, suffix, label }: { numericValue: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(numericValue, 1800);
  return (
    <motion.div variants={getVariant(fadeUp)} className="text-center">
      <div
        ref={ref}
        className="text-5xl font-bold text-gradient-gold font-numeric tracking-wide"
      >
        {count}{suffix}
      </div>
      <div className="text-sm text-secondary mt-1">{label}</div>
    </motion.div>
  );
}

function SectionHeader({ title, viewAllLabel, to }: { title: string; viewAllLabel: string; to: string }) {
  return (
    <motion.div
      variants={getVariant(revealVariant)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportReveal}
      className="flex items-start justify-between mb-6"
    >
      <div>
        <h2 className="text-2xl font-bold font-display text-primary">{title}</h2>
        <motion.div
          variants={lineReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="h-[2px] w-14 bg-gradient-gold rounded-full mt-2"
        />
      </div>
      <Link to={to} className="flex items-center gap-1 text-sm text-gold hover:text-gold-light transition-colors mt-1">
        {viewAllLabel}
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
      </Link>
    </motion.div>
  );
}
