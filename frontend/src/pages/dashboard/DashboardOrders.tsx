import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { Order, OrderStatus } from '@/types';
import { formatIQDSimple, getOrderStatusColor } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

const nextStatuses: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
};

export default function DashboardOrders() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/store/mine')
      .then((res) => setOrders(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    await api.patch(`/orders/${orderId}/status`, { status });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-xl font-bold font-display text-primary mb-6">{t('dashboard.orders')} ({orders.length})</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 text-secondary">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">{t('dashboard.no_orders')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-surface border border-default rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-secondary font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="font-semibold text-primary">{order.buyer?.name}</p>
                  <p className="text-xs text-secondary">{order.buyer?.phone}</p>
                  <p className="text-xs text-secondary mt-0.5">{order.deliveryCity} — {order.deliveryAddress}</p>
                </div>
                <div className="text-end">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                    {t(`orders.status.${order.status}`)}
                  </span>
                  <p className="text-gold font-bold mt-1 font-display">{formatIQDSimple(order.totalIQD)}</p>
                  <p className="text-xs text-secondary">{new Date(order.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'ar-IQ')}</p>
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-2 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="bg-surface-2 rounded-lg px-2 py-1 text-xs text-secondary">
                    {item.product?.name ?? t('common.not_found')} x{item.quantity}
                  </div>
                ))}
              </div>

              {/* Status update */}
              {nextStatuses[order.status] && (
                <div className="flex items-center gap-2 pt-3 border-t border-default">
                  <span className="text-xs text-secondary">{t('dashboard.change_status')}</span>
                  <div className="flex gap-2">
                    {nextStatuses[order.status]!.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(order.id, s)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          s === 'CANCELLED' ? 'bg-accent/10 text-accent hover:bg-accent/20' : 'bg-gold/10 text-gold hover:bg-gold/20'
                        }`}
                      >
                        {t(`orders.status.${s}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {order.notes && (
                <p className="text-xs text-secondary mt-2 pt-2 border-t border-default">
                  {t('dashboard.order_note', { note: order.notes })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
