import '../tailwind.css';
import { BRAND } from '@app/shared/brand';
import { initSentry } from '@app/shared/observability';
import { ToastProvider } from '@app/shared/ui';
import { Helmet } from '@modern-js/runtime/head';
import { Outlet } from '@modern-js/runtime/router';
import { useEffect } from 'react';
import { AuthProvider } from '../AuthContext';
import Nav from '../components/Nav';

export default function RootLayout() {
  // Sentry browser init (no-op nếu chưa set DSN); useEffect → chỉ chạy client
  useEffect(() => initSentry(), []);

  return (
    <AuthProvider>
      {/* ToastProvider ở shell root — MFE gọi useToast() qua @app/shared/ui singleton */}
      <ToastProvider>
        <Helmet>
          <html lang={BRAND.htmlLang} />
          <title>{`${BRAND.name} — Ngân hàng số`}</title>
        </Helmet>
        <div className="app">
          <Nav />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
