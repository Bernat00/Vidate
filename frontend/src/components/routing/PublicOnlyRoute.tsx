import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import CenteredLoader from '../layout/CenteredLoader';

export default function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading;

  if (loading) return <CenteredLoader />;

  if (user?.role_name === 'admin') return <Navigate to="/admin" replace />;
  if (user?.is_onboarded) return <Navigate to="/home" replace />;
  if (user && !user.is_onboarded) return <Navigate to="/setup-profile" replace />;

  return <>{children}</>;
}
