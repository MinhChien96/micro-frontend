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
  useEffect(() => {
    // Sentry browser init (no-op nếu chưa set DSN)
    initSentry();
    // MSW worker — opt-in build-time (MODERN_MSW inline → DCE khi tắt, không bloat bundle)
    if (process.env.MODERN_MSW === 'true') {
      import('@app/shared/mocks/browser').then((m) => m.startMockWorker());
    }
  }, []);

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
