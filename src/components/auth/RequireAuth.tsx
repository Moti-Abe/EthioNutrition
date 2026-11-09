import { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface RequireAuthProps {
  children?: ReactNode;
}

/**
 * Wraps protected routes. Redirects unauthenticated users to /auth
 * with a `redirect` query param so they can be sent back after login.
 * Shows a full-page loading spinner while the auth state is resolving.
 */
export default function RequireAuth({ children }: RequireAuthProps = {}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <LoadingSpinner size="lg" label="Checking authentication…" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
