import '../tailwind.css';
import { BRAND } from '@app/common/brand';
import { MswGate } from '@app/common/mocks/MswGate';
import { initSentry } from '@app/common/observability';
import { setApiHost } from '@app/common/stores';
import { ToastProvider } from '@app/common/ui';
import { Helmet } from '@modern-js/runtime/head';
import { Outlet } from '@modern-js/runtime/router';
import { useEffect } from 'react';
import { AuthProvider } from '../AuthContext';
import Nav from '../components/Nav';

// MSW bật khi: dev, hoặc build với MODERN_MSW=true (demo/e2e prod).
// Dự án thật: set MODERN_API_BASE_URL trỏ gateway, không set MODERN_MSW.
// try/catch từng biến: Modern.js chỉ inline MODERN_* khi CÓ set — khi không,
// `process` không tồn tại ở browser.
function isMswEnabled(): boolean {
  try {
    if (process.env.MODERN_MSW === 'true') return true;
  } catch {
    /* MODERN_MSW chưa set */
  }
  try {
    return process.env.NODE_ENV === 'development';
  } catch {
    return false;
  }
}

function readApiBase(): string {
  try {
    return process.env.MODERN_API_BASE_URL ?? '';
  } catch {
    return ''; // '' = same-origin → MSW intercept
  }
}

const mswOn = isMswEnabled();

export default function RootLayout() {
  useEffect(() => {
    initSentry(); // no-op nếu chưa set DSN
    // Mở khóa apiClient: mọi request (kể cả từ remote) chờ apiHost qua store
    setApiHost(readApiBase());
  }, []);

  return (
    <AuthProvider>
      {/* ToastProvider ở shell root — MFE gọi useToast() qua @app/common/ui singleton */}
      <ToastProvider>
        <Helmet>
          <html lang={BRAND.htmlLang} />
          <title>{`${BRAND.name} — Ngân hàng số`}</title>
        </Helmet>
        <MswGate enabled={mswOn}>
          <div className="app">
            <Nav />
            <main className="main-content">
              <Outlet />
            </main>
          </div>
        </MswGate>
      </ToastProvider>
    </AuthProvider>
  );
}
