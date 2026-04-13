import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'dashboard.title', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/products', label: 'dashboard.products', icon: Package },
  { to: '/dashboard/orders', label: 'dashboard.orders', icon: ShoppingBag },
  { to: '/dashboard/analytics', label: 'dashboard.analytics', icon: BarChart3 },
  { to: '/dashboard/settings', label: 'dashboard.settings', icon: Settings },
];

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-page">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
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
                      active
                        ? 'bg-gold/15 text-gold border border-gold/30'
                        : 'text-secondary hover:text-primary hover:bg-surface'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t(label)}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
