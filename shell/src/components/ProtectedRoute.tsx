import React from 'react';
import { Navigate, useLocation } from '@modern-js/runtime/router';
import { useAuth } from '../AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
}
