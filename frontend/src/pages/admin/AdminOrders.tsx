import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { Order, OrderStatus } from '@/types';
import { formatIQDSimple, getOrderStatusColor } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Select from '@/components/ui/Select';

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/orders/admin/all', { params: statusFilter ? { status: statusFilter } : {} })
      .then((res) => { setOrders(res.data.orders ?? []); setTotal(res.data.total ?? 0); })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-display text-primary">{t('admin.orders')} ({total})</h1>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="">{t('admin.all')}</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{t(`orders.status.${s}`)}</option>)}
        </Select>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-16 text-secondary">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('admin.no_orders')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-surface border border-default rounded-xl">
              <div>
                <p className="text-xs font-mono text-secondary">#{order.id.slice(-8).toUpperCase()}</p>
                <p className="font-medium text-primary">{order.buyer?.name}</p>
                <p className="text-xs text-secondary">{order.store?.name}</p>
                <p className="text-xs text-secondary">{new Date(order.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'ar-IQ')}</p>
              </div>
              <div className="text-end">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                  {t(`orders.status.${order.status}`)}
                </span>
                <p className="text-gold font-bold mt-1">{formatIQDSimple(order.totalIQD)}</p>
                <p className="text-xs text-secondary">{t('common.store_products', { count: (order as any)._count?.items ?? 0 })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
