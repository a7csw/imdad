import { motion } from 'framer-motion';
import { Shield, Truck, Wallet, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { staggerContainer, revealVariant, getVariant, scaleIn, viewportReveal } from '@/lib/motion';
import logoSrc from '@/assets/brand/logo-primary.svg';

export default function AboutPage() {
  const { t } = useTranslation();

  const cards = [
    { icon: Shield, titleKey: 'about.card1_title', descKey: 'about.card1_desc', color: 'text-gold' },
    { icon: Truck,  titleKey: 'about.card2_title', descKey: 'about.card2_desc', color: 'text-blue-400' },
    { icon: Wallet, titleKey: 'about.card3_title', descKey: 'about.card3_desc', color: 'text-green-400' },
    { icon: Users,  titleKey: 'about.card4_title', descKey: 'about.card4_desc', color: 'text-purple-400' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero block — wipe up on scroll */}
      <motion.div
        variants={getVariant(revealVariant)}
        initial="hidden"
        whileInView="visible"
        viewport={viewportReveal}
        className="text-center mb-16"
      >
        <img src={logoSrc} alt="Imdad" className="h-14 mx-auto mb-6" />
        <h1 className="text-4xl font-bold font-display text-primary mb-4">{t('about.title')}</h1>
        <p className="text-lg text-secondary leading-relaxed max-w-2xl mx-auto">
          {t('about.subtitle')}
        </p>
      </motion.div>

      {/* Cards — staggered reveal */}
      <motion.div
        variants={getVariant(staggerContainer(0.1, 0.05))}
        initial="hidden"
        whileInView="visible"
        viewport={viewportReveal}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {cards.map(({ icon: Icon, titleKey, descKey, color }) => (
          <motion.div
            key={titleKey}
            variants={getVariant(revealVariant)}
            className="flex gap-4 p-6 bg-surface border border-default rounded-2xl"
          >
            <div className={`w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-primary font-display mb-1">{t(titleKey)}</h3>
              <p className="text-sm text-secondary leading-relaxed">{t(descKey)}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Vision block */}
      <motion.div
        variants={getVariant(scaleIn)}
        initial="hidden"
        whileInView="visible"
        viewport={viewportReveal}
        className="mt-16 p-8 bg-surface border border-gold/20 rounded-3xl text-center"
      >
        <h2 className="text-2xl font-bold font-display mb-3 text-gradient-gold">{t('about.vision_title')}</h2>
        <p className="text-secondary leading-relaxed">
          {t('about.vision_desc')}
        </p>
      </motion.div>
    </div>
  );
}
