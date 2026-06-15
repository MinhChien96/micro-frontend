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
    // MSW worker — opt-in qua MODERN_MSW=true. Modern.js inline literal khi set; khi
    // KHÔNG set, `process` không tồn tại ở browser → bọc try/catch để no-op an toàn.
    let mswOn = false;
    try {
      mswOn = process.env.MODERN_MSW === 'true';
    } catch {
      /* process undefined ở browser khi var chưa set */
    }
    if (mswOn) {
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
