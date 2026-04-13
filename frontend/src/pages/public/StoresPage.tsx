import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import type { Store } from '@/types';
import { staggerContainer, revealVariant, getVariant, viewportReveal } from '@/lib/motion';
import StoreCard from '@/components/shared/StoreCard';
import { StoreCardSkeleton } from '@/components/ui/Skeleton';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function StoresPage() {
  const { t } = useTranslation();
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchStores(p = 1, q = '') {
    setLoading(true);
    try {
      const res = await api.get('/stores', { params: { page: p, limit: 20, search: q || undefined } });
      setStores(res.data.stores ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStores(1, ''); }, []);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        variants={getVariant(revealVariant)}
        initial="hidden"
        whileInView="visible"
        viewport={viewportReveal}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold font-display text-primary">{t('stores.title')}</h1>
          {!loading && <p className="text-sm text-secondary mt-1">{t('stores.count', { count: total })}</p>}
        </div>
        <div className="w-full sm:w-80">
          <Input
            placeholder={t('stores.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStores(1, search)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </motion.div>

      <motion.div
        variants={getVariant(staggerContainer(0.07, 0.05))}
        initial="hidden"
        whileInView="visible"
        viewport={viewportReveal}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <StoreCardSkeleton key={i} />)
          : stores.map((s) => <StoreCard key={s.id} store={s} />)}
      </motion.div>

      {!loading && stores.length === 0 && (
        <div className="text-center py-24 text-secondary">
          <p className="text-lg font-medium">{t('stores.empty')}</p>
        </div>
      )}

      {total > 20 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => { setPage(p => p - 1); fetchStores(page - 1, search); }}>{t('common.previous')}</Button>
          <span className="text-sm text-secondary">{t('common.page')} {page} {t('common.of')} {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); fetchStores(page + 1, search); }}>{t('common.next')}</Button>
        </div>
      )}
    </div>
  );
}
