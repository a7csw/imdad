import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PageLoader } from './guards';
import MainLayout from '@/components/layout/MainLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute, GuestRoute } from './guards';

// ── Lazy page imports ────────────────────────────────────────────────────────
const LandingPage = lazy(() => import('@/pages/public/LandingPage'));
const MarketplacePage = lazy(() => import('@/pages/public/MarketplacePage'));
const StoresPage = lazy(() => import('@/pages/public/StoresPage'));
const StoreDetailPage = lazy(() => import('@/pages/public/StoreDetailPage'));
const ProductDetailPage = lazy(() => import('@/pages/public/ProductDetailPage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));

const ProfilePage = lazy(() => import('@/pages/buyer/ProfilePage'));
const OrdersPage = lazy(() => import('@/pages/buyer/OrdersPage'));
const CartPage = lazy(() => import('@/pages/buyer/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/buyer/CheckoutPage'));

const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'));
const DashboardProducts = lazy(() => import('@/pages/dashboard/DashboardProducts'));
const DashboardAddProduct = lazy(() => import('@/pages/dashboard/DashboardAddProduct'));
const DashboardEditProduct = lazy(() => import('@/pages/dashboard/DashboardEditProduct'));
const DashboardOrders = lazy(() => import('@/pages/dashboard/DashboardOrders'));
const DashboardAnalytics = lazy(() => import('@/pages/dashboard/DashboardAnalytics'));
const DashboardSettings = lazy(() => import('@/pages/dashboard/DashboardSettings'));

const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminStores = lazy(() => import('@/pages/admin/AdminStores'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminBrands = lazy(() => import('@/pages/admin/AdminBrands'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      // ── Public ──────────────────────────────────────────────────────────
      { path: '/', element: <S><LandingPage /></S> },
      { path: '/marketplace', element: <S><MarketplacePage /></S> },
      { path: '/stores', element: <S><StoresPage /></S> },
      { path: '/stores/:slug', element: <S><StoreDetailPage /></S> },
      { path: '/products/:slug', element: <S><ProductDetailPage /></S> },
      { path: '/about', element: <S><AboutPage /></S> },

      // ── Guest only ───────────────────────────────────────────────────────
      {
        element: <GuestRoute />,
        children: [
          { path: '/login', element: <S><LoginPage /></S> },
          { path: '/register', element: <S><RegisterPage /></S> },
        ],
      },

      // ── Buyer ────────────────────────────────────────────────────────────
      {
        element: <ProtectedRoute allowedRoles={['BUYER']} />,
        children: [
          { path: '/profile', element: <S><ProfilePage /></S> },
          { path: '/orders', element: <S><OrdersPage /></S> },
          { path: '/cart', element: <S><CartPage /></S> },
          { path: '/checkout', element: <S><CheckoutPage /></S> },
        ],
      },

      // ── 404 ──────────────────────────────────────────────────────────────
      { path: '*', element: <S><NotFoundPage /></S> },
    ],
  },

  // ── Store Dashboard ───────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['STORE_OWNER']} />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <S><DashboardHome /></S> },
          { path: 'products', element: <S><DashboardProducts /></S> },
          { path: 'products/new', element: <S><DashboardAddProduct /></S> },
          { path: 'products/:id/edit', element: <S><DashboardEditProduct /></S> },
          { path: 'orders', element: <S><DashboardOrders /></S> },
          { path: 'analytics', element: <S><DashboardAnalytics /></S> },
          { path: 'settings', element: <S><DashboardSettings /></S> },
        ],
      },
    ],
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        path: '/admin',
        element: <S><AdminLayout /></S>,
        children: [
          { index: true, element: <S><AdminDashboard /></S> },
          { path: 'stores', element: <S><AdminStores /></S> },
          { path: 'users', element: <S><AdminUsers /></S> },
          { path: 'products', element: <S><AdminProducts /></S> },
          { path: 'categories', element: <S><AdminCategories /></S> },
          { path: 'brands', element: <S><AdminBrands /></S> },
          { path: 'orders', element: <S><AdminOrders /></S> },
        ],
      },
    ],
  },
]);
