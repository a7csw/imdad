import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import type { Product, Category, Brand } from '@/types';
import { getCategoryName } from '@/lib/utils';
import { staggerContainer, revealVariant, getVariant, viewportReveal } from '@/lib/motion';
import ProductCard from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

export default function MarketplacePage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get('search') ?? '');

  const categoryId = params.get('categoryId') ?? '';
  const brandId = params.get('brandId') ?? '';
  const featured = params.get('featured') === 'true';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: {
          page,
          limit: 24,
          search: search || undefined,
          categoryId: categoryId || undefined,
          brandId: brandId || undefined,
          featured: featured || undefined,
        },
      });
      setProducts(res.data.products ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, brandId, featured]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const [catRes, brandRes] = [api.get('/categories'), api.get('/brands')];
    Promise.all([catRes, brandRes]).then(([c, b]) => {
      setCategories(c.data);
      setBrands(b.data);
    }).catch(() => {});
  }, []);

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
    setPage(1);
  }

  function clearFilters() {
    setParams({});
    setSearch('');
    setPage(1);
  }

  const hasFilters = categoryId || brandId || search || featured;
  const totalPages = Math.ceil(total / 24);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        variants={getVariant(revealVariant)}
        initial="hidden"
        whileInView="visible"
        viewport={viewportReveal}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold font-display text-primary">{t('marketplace.title')}</h1>
          {!loading && <p className="text-sm text-secondary mt-1">{t('marketplace.product_count', { count: total })}</p>}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateFilter('search', search)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Select value={categoryId} onChange={(e) => updateFilter('categoryId', e.target.value)} className="sm:w-48">
          <option value="">{t('marketplace.all_categories')}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{getCategoryName(c, i18n.language)}</option>)}
        </Select>
        <Select value={brandId} onChange={(e) => updateFilter('brandId', e.target.value)} className="sm:w-48">
          <option value="">{t('marketplace.all_brands')}</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="md" onClick={clearFilters} className="gap-1.5 whitespace-nowrap">
            <X className="w-4 h-4" /> {t('marketplace.clear_filters')}
          </Button>
        )}
      </div>

      {/* Grid — staggered reveal */}
      <motion.div
        variants={getVariant(staggerContainer(0.06, 0.05))}
        initial="hidden"
        whileInView="visible"
        viewport={viewportReveal}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {loading
          ? Array.from({ length: 24 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p) => <ProductCard key={p.id} product={p} />)}
      </motion.div>

      {/* Empty */}
      {!loading && products.length === 0 && (
        <div className="text-center py-24 text-secondary">
          <SlidersHorizontal className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">{t('marketplace.no_products')}</p>
          <p className="text-sm mt-1">{t('marketplace.try_filters')}</p>
        </div>
      )}

      {/* Pagination */}
      {total > 24 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t('common.previous')}</Button>
          <span className="text-sm text-secondary">{t('common.page')} {page} {t('common.of')} {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>{t('common.next')}</Button>
        </div>
      )}
    </div>
  );
}
