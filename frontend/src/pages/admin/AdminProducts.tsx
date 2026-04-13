import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { Product } from '@/types';
import { formatIQDSimple, getImageUrl, getCategoryName } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

export default function AdminProducts() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products', { params: { limit: 50 } })
      .then((res) => { setProducts(res.data.products ?? []); setTotal(res.data.total ?? 0); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-xl font-bold font-display text-primary mb-6">{t('admin.products')} ({total})</h1>
      <div className="flex flex-col gap-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-4 p-4 bg-surface border border-default rounded-xl">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
              <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-primary truncate">{product.name}</p>
              <p className="text-xs text-secondary">
                {product.store?.name}{product.category ? ` · ${getCategoryName(product.category, i18n.language)}` : ''}
              </p>
            </div>
            <span className="text-gold font-bold text-sm whitespace-nowrap">{formatIQDSimple(product.discountPriceIQD ?? product.priceIQD)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
