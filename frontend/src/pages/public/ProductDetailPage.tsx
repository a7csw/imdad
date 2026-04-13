import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ShoppingCart, Minus, Plus, Store, Tag, Globe, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cart.store';
import { formatIQDSimple, getDiscountPercent, getImageUrl, getCategoryName } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function ProductDetailPage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const { addItem, items } = useCartStore();
  const inCart = product ? items.some((i) => i.productId === product.id) : false;

  useEffect(() => {
    api.get(`/products/${slug}`)
      .then((res) => setProduct(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-96 bg-surface rounded-3xl animate-pulse" />
        <div className="flex flex-col gap-4">
          {[60, 40, 80, 40, 100].map((w, i) => (
            <div key={i} className="h-4 bg-surface rounded-lg animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="text-center py-32 text-secondary">
        <p className="text-xl font-semibold">{t('product.not_found')}</p>
        <Link to="/marketplace" className="text-gold mt-4 inline-block">{t('product.back_to_marketplace')}</Link>
      </div>
    );
  }

  const price = product.discountPriceIQD ?? product.priceIQD;
  const discount = product.discountPriceIQD ? getDiscountPercent(product.priceIQD, product.discountPriceIQD) : null;

  function handleAdd() {
    addItem({
      productId: product!.id,
      storeId: product!.storeId,
      name: product!.name,
      image: product!.images[0] ?? '',
      priceIQD: product!.priceIQD,
      discountPriceIQD: product!.discountPriceIQD,
      quantity: qty,
      stock: product!.stock,
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-3xl overflow-hidden bg-surface mb-3"
          >
            <img
              src={getImageUrl(product.images[activeImage])}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-gold' : 'border-default hover:border-strong'}`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-secondary">
            <Link to="/marketplace" className="hover:text-gold">{t('marketplace.title')}</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link to={`/marketplace?categoryId=${product.categoryId}`} className="hover:text-gold">
                  {getCategoryName(product.category, i18n.language)}
                </Link>
              </>
            )}
          </div>

          <h1 className="text-2xl font-bold font-display text-primary">{product.name}</h1>
          {product.nameAr && product.nameAr !== product.name && (
            <p className="text-secondary">{product.nameAr}</p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.authentic && (
              <Badge variant="gold" className="gap-1.5">
                <Shield className="w-3 h-3" /> {t('product.authentic')}
              </Badge>
            )}
            {product.brand && <Badge variant="muted">{product.brand.name}</Badge>}
            {product.origin && (
              <Badge variant="muted" className="gap-1">
                <Globe className="w-3 h-3" /> {product.origin}
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gold font-display">{formatIQDSimple(price)}</span>
            {discount && (
              <>
                <span className="text-secondary line-through text-lg">{formatIQDSimple(product.priceIQD)}</span>
                <Badge variant="accent">-{discount}%</Badge>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`text-sm font-medium ${product.stock > 0 ? 'text-green-400' : 'text-accent'}`}>
            {product.stock > 0
              ? `✓ ${t('product.in_stock_count', { count: product.stock })}`
              : `✗ ${t('product.out_of_stock')}`}
          </div>

          {/* Details grid */}
          {(product.flavor || product.size || product.servings) && (
            <div className="grid grid-cols-3 gap-3">
              {product.flavor && <DetailChip label={t('product.flavor')} value={product.flavor} />}
              {product.size && <DetailChip label={t('product.size')} value={product.size} />}
              {product.servings && <DetailChip label={t('product.servings')} value={String(product.servings)} />}
            </div>
          )}

          {/* Qty + Add */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 bg-surface border border-default rounded-xl px-3 py-2">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-secondary hover:text-primary transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-primary font-semibold w-8 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock} className="text-secondary hover:text-primary transition-colors disabled:opacity-40">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={handleAdd}
              disabled={product.stock === 0}
              size="lg"
              variant={inCart ? 'secondary' : 'primary'}
              className="flex-1 gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {inCart ? t('product.in_cart') : t('product.add_to_cart')}
            </Button>
          </div>

          {/* Store link */}
          {product.store && (
            <Link
              to={`/stores/${product.store.slug}`}
              className="flex items-center gap-3 p-3 bg-surface border border-default rounded-xl hover:border-gold/30 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center">
                {product.store.logo ? (
                  <img src={product.store.logo} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Store className="w-5 h-5 text-gold" />
                )}
              </div>
              <div>
                <p className="text-xs text-secondary">{t('product.store')}</p>
                <p className="text-sm font-semibold text-primary">{product.store.name}</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Description & Details */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {product.descriptionFull && (
          <div>
            <h3 className="font-bold text-primary font-display mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-gold" /> {t('product.description')}
            </h3>
            <p className="text-secondary text-sm leading-relaxed whitespace-pre-line">{product.descriptionFull}</p>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {product.ingredients && (
            <DetailSection title={t('product.ingredients')} content={product.ingredients} />
          )}
          {product.usage && (
            <DetailSection title={t('product.usage')} content={product.usage} />
          )}
          {product.warnings && (
            <DetailSection title={t('product.warnings')} content={product.warnings} accent />
          )}
          {product.goalTags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4 text-gold" />{t('product.goal_tags')}</h4>
              <div className="flex flex-wrap gap-2">
                {product.goalTags.map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2.5 bg-surface border border-default rounded-xl text-center">
      <span className="text-xs text-secondary">{label}</span>
      <span className="text-sm font-semibold text-primary">{value}</span>
    </div>
  );
}

function DetailSection({ title, content, accent }: { title: string; content: string; accent?: boolean }) {
  return (
    <div>
      <h4 className={`text-sm font-semibold mb-1.5 ${accent ? 'text-accent' : 'text-primary'}`}>{title}</h4>
      <p className="text-xs text-secondary leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}
