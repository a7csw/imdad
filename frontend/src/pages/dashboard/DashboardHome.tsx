import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { formatIQDSimple, getOrderStatusColor } from '@/lib/utils';
import type { Order } from '@/types';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

interface DashStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function DashboardHome() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const storePending = user?.store?.status === 'PENDING';
  const storeRejected = user?.store?.status === 'REJECTED';
  const storeSuspended = user?.store?.status === 'SUSPENDED';

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, orderRes] = await Promise.all([
          api.get('/products/store/mine'),
          api.get('/orders/store/mine'),
        ]);
        const products = prodRes.data ?? [];
        const orders: Order[] = orderRes.data ?? [];
        const pending = orders.filter((o) => o.status === 'PENDING').length;
        const revenue = orders.filter((o) => o.status === 'DELIVERED').reduce((sum, o) => sum + o.totalIQD, 0);
        setStats({ totalProducts: products.length, totalOrders: orders.length, pendingOrders: pending, totalRevenue: revenue });
        setRecentOrders(orders.slice(0, 5));
      } catch {
        setStats({ totalProducts: 0, totalOrders: 0, pendingOrders: 0, totalRevenue: 0 });
      } finally {
        setLoading(false);
      }
    }
    if (!storePending && !storeRejected && !storeSuspended) fetchData();
    else setLoading(false);
  }, [storePending, storeRejected, storeSuspended]);

  if (storePending) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center max-w-sm">
          <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold font-display text-primary mb-2">{t('dashboard.pending_notice')}</h2>
          <p className="text-secondary text-sm">{t('dashboard.pending_desc')}</p>
        </div>
      </div>
    );
  }

  if (storeRejected || storeSuspended) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-xl font-bold font-display text-primary mb-2">
            {t('dashboard.rejected_suspended_notice')}
          </h2>
          <p className="text-secondary text-sm">{t('dashboard.rejected_suspended_desc')}</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const statCards = [
    { label: t('dashboard.total_products'), value: stats?.totalProducts ?? 0, icon: Package, color: 'text-blue-400', to: '/dashboard/products' },
    { label: t('dashboard.total_orders'), value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: 'text-purple-400', to: '/dashboard/orders' },
    { label: t('dashboard.pending_orders'), value: stats?.pendingOrders ?? 0, icon: Clock, color: 'text-yellow-400', to: '/dashboard/orders' },
    { label: t('dashboard.revenue'), value: formatIQDSimple(stats?.totalRevenue ?? 0), icon: TrendingUp, color: 'text-gold', to: '/dashboard/analytics' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-primary">{t('dashboard.welcome', { name: user?.name })}</h1>
          <p className="text-secondary text-sm mt-1">{user?.store?.name}</p>
        </div>
        <Link to="/dashboard/products/new">
          <Button size="sm">+ {t('dashboard.add_product')}</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={card.to} className="block bg-surface border border-default rounded-2xl p-5 hover:border-gold/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-secondary text-sm">{card.label}</span>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold font-display text-primary">{card.value}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary font-display">{t('dashboard.recent_orders')}</h2>
            <Link to="/dashboard/orders" className="text-sm text-gold hover:text-gold-light">{t('home.view_all')}</Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-surface border border-default rounded-xl">
                <div>
                  <p className="text-xs text-secondary font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-primary">{order.buyer?.name}</p>
                  <p className="text-xs text-secondary">{new Date(order.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'ar-IQ')}</p>
                </div>
                <div className="text-end">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                    {t(`orders.status.${order.status}`)}
                  </span>
                  <p className="text-gold font-bold mt-1">{formatIQDSimple(order.totalIQD)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
