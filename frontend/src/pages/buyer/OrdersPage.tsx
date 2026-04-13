import { useEffect, useState } from 'react';
import { Package, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { Order } from '@/types';
import { formatIQDSimple, getOrderStatusColor } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

export default function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold font-display text-primary mb-8">{t('orders.title')}</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 text-secondary">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">{t('orders.empty')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-surface border border-default rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-secondary font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                  {order.store && <p className="font-semibold text-primary">{order.store.name}</p>}
                  <div className="flex items-center gap-1.5 text-xs text-secondary mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div className="text-end">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                    {t(`orders.status.${order.status}`)}
                  </span>
                  <p className="text-gold font-bold text-lg mt-2 font-display">{formatIQDSimple(order.totalIQD)}</p>
                </div>
              </div>
              {order.items.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-1.5">
                      <span className="text-xs text-primary">{item.product?.name ?? t('common.not_found')}</span>
                      <span className="text-xs text-secondary">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
