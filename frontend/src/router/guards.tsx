import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  redirectTo?: string;
}

export function ProtectedRoute({ allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function GuestRoute({ redirectTo = '/' }: { redirectTo?: string }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}

export { PageLoader };
