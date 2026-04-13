import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Package, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { Store, Product } from '@/types';
import ProductCard from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { getImageUrl } from '@/lib/utils';

export default function StoreDetailPage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [storeRes] = await Promise.all([
          api.get(`/stores/${slug}`),
        ]);
        const s: Store = storeRes.data;
        setStore(s);
        const p = await api.get('/products', { params: { storeId: s.id, limit: 24 } });
        setProducts(p.data.products ?? []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-48 bg-surface rounded-3xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="text-center py-32 text-secondary">
        <p className="text-xl font-semibold">{t('stores.not_found')}</p>
        <Link to="/stores" className="text-gold mt-4 inline-block">{t('stores.back')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Store Banner */}
      <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden bg-surface mb-8">
        {store.banner ? (
          <img src={store.banner} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-600 to-dark-800 flex items-center justify-center">
            <span className="text-6xl font-bold text-gold/20 font-display">{store.name[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
      </div>

      {/* Store Info */}
      <div className="flex flex-col sm:flex-row gap-6 mb-10">
        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-default bg-surface-2 flex-shrink-0 -mt-14 ms-4 relative z-10">
          {store.logo ? (
            <img src={getImageUrl(store.logo)} alt={store.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center">
              <span className="text-gold font-bold text-2xl font-display">{store.name[0]}</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-display text-primary">{store.name}</h1>
          {store.description && <p className="text-secondary text-sm mt-1">{store.description}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-secondary">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {store.city}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {store.phone}</span>
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              {t('common.store_products', { count: store._count?.products ?? 0 })}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(store.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-IQ' : i18n.language === 'ku' ? 'ar-IQ' : 'en-GB')}
            </span>
          </div>
        </div>
      </div>

      {/* Products */}
      <h2 className="text-xl font-bold font-display text-primary mb-5">{t('stores.products_title')}</h2>
      {products.length === 0 ? (
        <div className="text-center py-16 text-secondary">{t('stores.no_products')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
