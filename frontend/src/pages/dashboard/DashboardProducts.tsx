import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { Product } from '@/types';
import { formatIQDSimple, getImageUrl, getCategoryName } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';

export default function DashboardProducts() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/store/mine')
      .then((res) => setProducts(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm(t('dashboard.delete_product_confirm'))) return;
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-display text-primary">{t('dashboard.products')} ({products.length})</h1>
        <Link to="/dashboard/products/new">
          <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> {t('dashboard.add_product')}</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 text-secondary">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium mb-3">{t('dashboard.no_products')}</p>
          <Link to="/dashboard/products/new"><Button size="sm">{t('dashboard.add_first_product')}</Button></Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-4 p-4 bg-surface border border-default rounded-2xl">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-2">
                <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary truncate">{product.name}</p>
                <p className="text-xs text-secondary mt-0.5">
                  {product.category ? getCategoryName(product.category, i18n.language) : ''} · {product.brand?.name}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-gold font-bold text-sm">{formatIQDSimple(product.discountPriceIQD ?? product.priceIQD)}</span>
                  <Badge variant={product.status === 'ACTIVE' ? 'green' : 'muted'} className="text-xs">
                    {product.status === 'ACTIVE'
                      ? t('dashboard.product_status_active')
                      : product.status === 'OUT_OF_STOCK'
                        ? t('dashboard.product_status_out_of_stock')
                        : t('dashboard.product_status_inactive')}
                  </Badge>
                  <span className="text-xs text-secondary">{t('dashboard.stock_count', { count: product.stock })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/dashboard/products/${product.id}/edit`}>
                  <button className="p-2 rounded-lg text-secondary hover:text-gold hover:bg-surface-2 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 rounded-lg text-secondary hover:text-accent hover:bg-accent/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
