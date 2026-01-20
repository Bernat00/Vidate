import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading;
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgPrimary text-textSecondary">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.is_onboarded && location.pathname !== '/setup-profile') {
    return <Navigate to="/setup-profile" replace />;
  }

  return <>{children}</>;
}
