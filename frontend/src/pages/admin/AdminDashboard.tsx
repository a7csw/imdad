import { useEffect, useState } from 'react';
import { Store, Users, Package, ShoppingBag, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

interface AdminStats {
  totalStores: number;
  pendingStores: number;
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [storesRes, usersRes, productsRes, ordersRes] = await Promise.all([
          api.get('/stores/admin/all'),
          api.get('/users', { params: { limit: 1 } }),
          api.get('/products', { params: { limit: 1 } }),
          api.get('/orders/admin/all', { params: { limit: 1 } }),
        ]);
        const stores = storesRes.data ?? [];
        setStats({
          totalStores: stores.length,
          pendingStores: stores.filter((s: any) => s.status === 'PENDING').length,
          totalUsers: usersRes.data.total ?? 0,
          totalProducts: productsRes.data.total ?? 0,
          totalOrders: ordersRes.data.total ?? 0,
        });
      } catch {
        setStats({ totalStores: 0, pendingStores: 0, totalUsers: 0, totalProducts: 0, totalOrders: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const cards = [
    { label: t('admin.stores'), value: stats?.totalStores, icon: Store, to: '/admin/stores', color: 'text-blue-400', note: stats?.pendingStores ? t('admin.pending_count', { count: stats.pendingStores }) : undefined },
    { label: t('admin.users'), value: stats?.totalUsers, icon: Users, to: '/admin/users', color: 'text-purple-400' },
    { label: t('admin.products'), value: stats?.totalProducts, icon: Package, to: '/admin/products', color: 'text-gold' },
    { label: t('admin.orders'), value: stats?.totalOrders, icon: ShoppingBag, to: '/admin/orders', color: 'text-green-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-display text-primary mb-8">{t('admin.title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <Link
            key={i}
            to={card.to}
            className="block bg-surface border border-default rounded-2xl p-5 hover:border-gold/20 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-secondary text-sm">{card.label}</span>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-3xl font-bold font-display text-primary">{card.value ?? 0}</div>
            {card.note && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-yellow-400">
                <Clock className="w-3 h-3" /> {card.note}
              </div>
            )}
          </Link>
        ))}
      </div>

      {stats?.pendingStores ? (
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-5">
          <p className="text-yellow-400 font-semibold mb-2">{t('admin.new_store_applications')}</p>
          <p className="text-secondary text-sm mb-3">
            {t('admin.pending_stores_notice', { count: stats.pendingStores })}
          </p>
          <Link to="/admin/stores" className="text-gold text-sm font-medium hover:text-gold-light">
            {t('admin.review_applications')} ←
          </Link>
        </div>
      ) : null}
    </div>
  );
}
