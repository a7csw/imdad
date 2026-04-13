import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { MapPin, Phone, FileText, Wallet, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { formatIQDSimple, getImageUrl } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const schema = z.object({
  deliveryAddress: z.string().min(5),
  deliveryCity: z.string().min(2),
  deliveryPhone: z.string().min(10),
  notes: z.string().max(300).optional(),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, getStoreId } = useCartStore();
  const { user } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { deliveryCity: user?.city },
  });

  const storeId = getStoreId();

  if (items.length === 0 && !success) {
    navigate('/marketplace');
    return null;
  }

  async function onSubmit(data: FormData) {
    try {
      await api.post('/orders', {
        storeId,
        ...data,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      clearCart();
      setSuccess(true);
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message ?? t('common.try_again') });
    }
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-display text-primary mb-2">{t('checkout.success_title')}</h1>
          <p className="text-secondary mb-6">{t('checkout.success_desc')}</p>
          <Button onClick={() => navigate('/orders')}>{t('checkout.view_orders')}</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold font-display text-primary mb-8">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="bg-surface border border-default rounded-3xl p-6">
            <h2 className="font-bold text-primary font-display mb-5 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold" /> {t('checkout.delivery_info')}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input label={t('checkout.address_label')} placeholder="..." leftIcon={<MapPin className="w-4 h-4" />} error={errors.deliveryAddress?.message} {...register('deliveryAddress')} />
              <Input label={t('checkout.city_label')} placeholder="..." leftIcon={<MapPin className="w-4 h-4" />} error={errors.deliveryCity?.message} {...register('deliveryCity')} />
              <Input label={t('checkout.delivery_phone')} type="tel" placeholder="07701234567" leftIcon={<Phone className="w-4 h-4" />} error={errors.deliveryPhone?.message} {...register('deliveryPhone')} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-primary flex items-center gap-2"><FileText className="w-4 h-4" /> {t('checkout.notes')}</label>
                <textarea rows={3} placeholder="..." className="w-full bg-surface border border-default text-primary placeholder:text-tertiary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 resize-none" {...register('notes')} />
              </div>

              {/* Payment method */}
              <div className="p-4 bg-surface-2 border border-gold/30 rounded-xl flex items-center gap-3">
                <Wallet className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-sm font-semibold text-primary">{t('checkout.cod')}</p>
                  <p className="text-xs text-secondary">{t('checkout.cod_desc')}</p>
                </div>
              </div>

              {errors.root && (
                <p className="text-sm text-accent bg-accent/10 rounded-xl px-3 py-2 text-center">{errors.root.message}</p>
              )}

              <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
                {t('checkout.place_order')}
              </Button>
            </form>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-default rounded-3xl p-6 sticky top-20">
            <h2 className="font-bold text-primary font-display mb-4">{t('checkout.order_summary')}</h2>
            <div className="flex flex-col gap-3 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary line-clamp-2">{item.name}</p>
                    <p className="text-xs text-secondary">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gold whitespace-nowrap">
                    {formatIQDSimple((item.discountPriceIQD ?? item.priceIQD) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-default pt-4 flex items-center justify-between">
              <span className="font-semibold text-primary">{t('checkout.grand_total')}</span>
              <span className="text-xl font-bold text-gold font-display">{formatIQDSimple(totalPrice())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
