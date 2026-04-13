import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cart.store';
import { formatIQDSimple, getImageUrl } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { t } = useTranslation();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg-page/70 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 end-0 h-full w-full max-w-md bg-surface-2 border-s border-default z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-default">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-gold" />
                <h2 className="font-bold text-primary font-display">{t('cart.title')}</h2>
                {items.length > 0 && (
                  <span className="bg-gold/20 text-gold text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-surface transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-tertiary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">{t('cart.empty')}</p>
                    <p className="text-sm text-secondary">{t('cart.empty_desc')}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={onClose}>
                    {t('cart.continue_shopping')}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3 p-3 bg-surface rounded-xl border border-default">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary line-clamp-2">{item.name}</p>
                        <p className="text-sm text-gold font-bold mt-1">
                          {formatIQDSimple(item.discountPriceIQD ?? item.priceIQD)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-3 transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold text-primary w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-3 transition-all disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 rounded-lg text-tertiary hover:text-accent hover:bg-accent/10 transition-all self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-default flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-secondary text-sm">{t('cart.total')}</span>
                  <span className="text-gold font-bold text-lg">{formatIQDSimple(totalPrice())}</span>
                </div>
                <Link to="/checkout" onClick={onClose}>
                  <Button fullWidth size="lg">
                    {t('cart.checkout')}
                  </Button>
                </Link>
                <button onClick={clearCart} className="text-xs text-tertiary hover:text-accent text-center transition-colors">
                  مسح السلة
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
