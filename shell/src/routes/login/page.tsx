import React from 'react';
import { Navigate, useLocation } from '@modern-js/runtime/router';
import { Helmet } from '@modern-js/runtime/head';
import { useAuth } from '../../AuthContext';
import RemoteErrorBoundary from '../../components/RemoteErrorBoundary';
import { Login } from '../../components/remotePages';

// Login KHÔNG noSSR: form từ remote mfe_auth được render ngay trong HTML
// server (SEO + first paint). Redirect-if-authed chỉ xảy ra sau hydration
// (useAuth chỉ truthy sau khi client đọc localStorage).
export default function LoginPage() {
  const user = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? '/accounts';

  if (user) return <Navigate to={from} replace />;

  return (
    <>
      <Helmet>
        <title>Đăng nhập — VietBank</title>
        <meta name="description" content="Đăng nhập ngân hàng số VietBank bằng số CIF. An toàn, nhanh chóng." />
      </Helmet>
      <RemoteErrorBoundary remote="mfe_auth/Login">
        <Login />
      </RemoteErrorBoundary>
    </>
  );
}
