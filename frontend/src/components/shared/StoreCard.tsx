import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Store } from '@/types';
import { getImageUrl } from '@/lib/utils';
import { revealVariant, getVariant } from '@/lib/motion';

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  const { t } = useTranslation();

  return (
    <motion.article
      variants={getVariant(revealVariant)}
      whileHover={{ y: -10, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className="group bg-surface border border-default rounded-2xl overflow-hidden card-glow card-glow-hover"
      style={{ transition: 'box-shadow 0.3s ease' }}
    >
      <Link to={`/stores/${store.slug}`} className="block">
        {/* Full-height banner with gradient overlay */}
        <div className="relative h-40 bg-surface-2 overflow-hidden">
          {store.banner ? (
            <img
              src={store.banner}
              alt={store.name}
              className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-[400ms] ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center">
              <span className="text-gold/30 font-bold text-6xl font-display select-none">
                {store.name[0]}
              </span>
            </div>
          )}

          {/* Gradient overlay — text sits over this */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Logo — top-start */}
          <div className="absolute top-3 start-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/20 bg-surface shadow-md">
              {store.logo ? (
                <img src={getImageUrl(store.logo)} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center">
                  <span className="text-gold font-bold text-sm font-display">{store.name[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product count badge — top-end */}
          {store._count && (
            <div className="absolute top-3 end-3">
              <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white/80 text-xs px-2 py-0.5 rounded-full">
                <Package className="w-3 h-3" />
                {t('common.store_products', { count: store._count.products })}
              </span>
            </div>
          )}

          {/* Store name + city over gradient */}
          <div className="absolute bottom-0 start-0 end-0 p-4">
            <h3 className="font-bold text-white font-display leading-tight">{store.name}</h3>
            <div className="flex items-center gap-1 mt-0.5 text-white/70 text-xs">
              <MapPin className="w-3 h-3" /> {store.city}
            </div>
          </div>
        </div>

        {/* Description (if present) */}
        {store.description && (
          <div className="px-4 py-3">
            <p className="text-xs text-secondary line-clamp-2">{store.description}</p>
          </div>
        )}
      </Link>
    </motion.article>
  );
}
