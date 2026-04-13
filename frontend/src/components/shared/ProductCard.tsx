import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Shield, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/types';
import { formatIQDSimple, getDiscountPercent, getImageUrl, getCategoryName } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';
import { revealVariant, getVariant } from '@/lib/motion';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const { addItem, items } = useCartStore();
  const inCart = items.some((i) => i.productId === product.id);
  const price = product.discountPriceIQD ?? product.priceIQD;
  const discount = product.discountPriceIQD
    ? getDiscountPercent(product.priceIQD, product.discountPriceIQD)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addItem({
      productId: product.id,
      storeId: product.storeId,
      name: product.name,
      image: product.images[0] ?? '',
      priceIQD: product.priceIQD,
      discountPriceIQD: product.discountPriceIQD,
      quantity: 1,
      stock: product.stock,
    });
  };

  return (
    <motion.article
      variants={getVariant(revealVariant)}
      whileHover={{ y: -10, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className="group relative bg-surface border border-default rounded-2xl overflow-hidden card-glow card-glow-hover"
      style={{ transition: 'box-shadow 0.3s ease' }}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative h-56 bg-surface-2 overflow-hidden">
          <img
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-[400ms] ease-out"
            loading="lazy"
          />
          {/* Badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-1.5">
            {discount && (
              <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                -{discount}%
              </span>
            )}
            {product.authentic && (
              <span className="bg-bg-page/80 backdrop-blur-sm text-gold text-xs px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Shield className="w-3 h-3" /> {t('product.authentic_badge')}
              </span>
            )}
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-bg-page/60 flex items-center justify-center">
              <span className="text-secondary text-sm font-medium">{t('product.out_of_stock')}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2">
          {product.category && (
            <div className="flex items-center gap-1 text-xs text-secondary">
              <Tag className="w-3 h-3" />
              <span>{getCategoryName(product.category, i18n.language)}</span>
            </div>
          )}
          <h3 className="font-semibold text-primary text-sm leading-snug line-clamp-2 font-display">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-xs text-secondary">{product.brand.name}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gold font-bold text-base">{formatIQDSimple(price)}</span>
            {product.discountPriceIQD && (
              <span className="text-tertiary text-xs line-through">
                {formatIQDSimple(product.priceIQD)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart — reveal on hover */}
      <div className="px-4 pb-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          fullWidth
          size="sm"
          variant={inCart ? 'secondary' : 'primary'}
          className="gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          {inCart ? t('product.in_cart') : t('product.add_to_cart')}
        </Button>
      </div>
    </motion.article>
  );
}
