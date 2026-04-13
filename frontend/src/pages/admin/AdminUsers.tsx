import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get('/users')
      .then((res) => { setUsers(res.data.users ?? []); setTotal(res.data.total ?? 0); })
      .finally(() => setLoading(false));
  }, []);

  async function toggleSuspend(id: string, suspended: boolean) {
    await api.patch(`/users/${id}`, { suspended });
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, suspended } : u));
  }

  const roleLabel = (role: string) => {
    if (role === 'BUYER') return t('auth.buyer');
    if (role === 'STORE_OWNER') return t('auth.store_owner');
    return t('admin.role_admin');
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-xl font-bold font-display text-primary mb-6">{t('admin.users')} ({total})</h1>
      {users.length === 0 ? (
        <div className="text-center py-16 text-secondary">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('admin.no_users')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-surface border border-default rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-primary">{user.name}</p>
                  <Badge variant={user.role === 'ADMIN' ? 'accent' : user.role === 'STORE_OWNER' ? 'gold' : 'muted'}>
                    {roleLabel(user.role)}
                  </Badge>
                  {user.suspended && <Badge variant="accent">{t('admin.suspended_badge')}</Badge>}
                </div>
                <p className="text-xs text-secondary mt-0.5">{user.email} · {user.city}</p>
              </div>
              {user.role !== 'ADMIN' && (
                <button
                  onClick={() => toggleSuspend(user.id, !user.suspended)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${user.suspended ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}
                >
                  {user.suspended ? t('admin.activate') : t('admin.suspend')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
