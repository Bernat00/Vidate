import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import CenteredLoader from '../layout/CenteredLoader';
import { useWebSocket } from '../../context/webSocketContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading;
  const location = useLocation();
  const ws = useWebSocket();

  useEffect(() => {
    if (!user) return;
  }, [user, ws]);

  if (loading) {
    return <CenteredLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user.role_name === 'admin';
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdmin && !isAdminPath) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAdmin && isAdminPath) {
    return <Navigate to="/home" replace />;
  }

  if (!user.is_onboarded && location.pathname !== '/setup-profile' && !isAdmin) {
    return <Navigate to="/setup-profile" replace />;
  }

  return <>{children}</>;
}
