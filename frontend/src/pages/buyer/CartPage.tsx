import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cart.store';
import CartDrawer from '@/features/cart/CartDrawer';
import Button from '@/components/ui/Button';

export default function CartPage() {
  const { t } = useTranslation();
  const { items } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-tertiary mb-4" />
          <h1 className="text-xl font-bold text-primary font-display mb-2">{t('cart.empty')}</h1>
          <p className="text-secondary mb-6">{t('cart.empty_desc')}</p>
          <Link to="/marketplace">
            <Button size="lg">{t('cart.browse_products')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold font-display text-primary mb-6">{t('cart.title')}</h1>
      <div className="bg-surface border border-default rounded-3xl overflow-hidden">
        <CartDrawer open={true} onClose={() => {}} />
      </div>
    </div>
  );
}
