import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useAuthReady } from '../AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuth();
  const ready = useAuthReady();
  const location = useLocation();

  // SSR + first paint: auth chưa đọc xong localStorage — render children
  // (phần remote là skeleton qua noSSR) để HTML server/client khớp nhau.
  if (!ready) return <>{children}</>;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
}
