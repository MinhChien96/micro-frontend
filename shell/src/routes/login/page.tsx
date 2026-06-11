import React, { Suspense, lazy } from 'react';
import { useLocation, Navigate } from '@modern-js/runtime/router';
import { useAuth } from '../../AuthContext';

const Login = lazy(() => import('mfe_auth/Login'));

export default function LoginPage() {
  const user = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? '/accounts';

  if (user) return <Navigate to={from} replace />;

  return (
    <Suspense fallback={<div className="loading-box"><div className="spinner" /><p>Đang tải đăng nhập...</p></div>}>
      <Login />
    </Suspense>
  );
}
