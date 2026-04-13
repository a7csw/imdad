import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users, Package, Tag, Award, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const navItems = [
    { to: '/admin', label: t('admin.title'), icon: LayoutDashboard, exact: true },
    { to: '/admin/stores', label: t('admin.stores'), icon: Store },
    { to: '/admin/users', label: t('admin.users'), icon: Users },
    { to: '/admin/products', label: t('admin.products'), icon: Package },
    { to: '/admin/categories', label: t('admin.categories'), icon: Tag },
    { to: '/admin/brands', label: t('admin.brands'), icon: Award },
    { to: '/admin/orders', label: t('admin.orders'), icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-page">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden md:flex w-56 flex-shrink-0">
            <nav className="flex flex-col gap-1 w-full">
              {navItems.map(({ to, label, icon: Icon, exact }) => {
                const active = exact ? pathname === to : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                      active ? 'bg-accent/15 text-accent border border-accent/30' : 'text-secondary hover:text-primary hover:bg-surface'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
