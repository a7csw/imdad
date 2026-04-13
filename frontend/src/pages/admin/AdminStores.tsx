import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { getStoreStatusColor } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Select from '@/components/ui/Select';

type StoreStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export default function AdminStores() {
  const { t } = useTranslation();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/stores/admin/all', { params: filter ? { status: filter } : {} })
      .then((res) => setStores(res.data ?? []))
      .finally(() => setLoading(false));
  }, [filter]);

  async function updateStatus(id: string, status: StoreStatus) {
    await api.patch(`/stores/admin/${id}/status`, { status });
    setStores((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-display text-primary">{t('admin.stores')} ({stores.length})</h1>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
          <option value="">{t('admin.all')}</option>
          <option value="PENDING">{t('store.status.PENDING')}</option>
          <option value="APPROVED">{t('store.status.APPROVED')}</option>
          <option value="REJECTED">{t('store.status.REJECTED')}</option>
          <option value="SUSPENDED">{t('store.status.SUSPENDED')}</option>
        </Select>
      </div>

      {stores.length === 0 ? (
        <div className="text-center py-16 text-secondary">
          <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('admin.no_stores')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {stores.map((store) => (
            <div key={store.id} className="flex items-start justify-between p-4 bg-surface border border-default rounded-2xl">
              <div>
                <p className="font-semibold text-primary">{store.name}</p>
                <p className="text-xs text-secondary mt-0.5">{store.owner?.email}</p>
                <p className="text-xs text-secondary">{store.city} · {t('common.store_products', { count: store._count?.products ?? 0 })}</p>
                <div className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStoreStatusColor(store.status)}`}>
                  {t(`store.status.${store.status}`)}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {store.status === 'PENDING' && (
                  <>
                    <button onClick={() => updateStatus(store.id, 'APPROVED')} className="px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-medium transition-all">{t('admin.approve')}</button>
                    <button onClick={() => updateStatus(store.id, 'REJECTED')} className="px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent/20 rounded-lg text-xs font-medium transition-all">{t('admin.reject')}</button>
                  </>
                )}
                {store.status === 'APPROVED' && (
                  <button onClick={() => updateStatus(store.id, 'SUSPENDED')} className="px-3 py-1.5 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded-lg text-xs font-medium transition-all">{t('admin.suspend')}</button>
                )}
                {(store.status === 'SUSPENDED' || store.status === 'REJECTED') && (
                  <button onClick={() => updateStatus(store.id, 'APPROVED')} className="px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-medium transition-all">{t('admin.activate')}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
