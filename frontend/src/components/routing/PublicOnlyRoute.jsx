import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return children; // avoid flicker while loading

  if (user?.is_onboarded) return <Navigate to="/my-matches" replace />;
  if (user && !user.is_onboarded) return <Navigate to="/setup-profile" replace />;

  return children;
}
