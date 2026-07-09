import '../tailwind.css';
import { BRAND } from '@app/common/brand';
import { MswGate } from '@app/common/mocks/MswGate';
import { initSentry } from '@app/common/observability';
import { QueryProvider } from '@app/common/QueryProvider';
import { setApiHost } from '@app/common/stores';
import { ToastProvider } from '@app/common/ui';
import { Helmet } from '@modern-js/runtime/head';
import { Outlet } from '@modern-js/runtime/router';
import { useEffect } from 'react';
import { AuthProvider } from '../AuthContext';

// try/catch từng biến: Modern.js chỉ inline MODERN_* khi CÓ set — khi không,
// `process` không tồn tại ở browser.
function readApiBase(): string {
  try {
    return process.env.MODERN_API_BASE_URL ?? '';
  } catch {
    return ''; // '' = same-origin → MSW intercept
  }
}

// MSW bật/tắt theo môi trường:
//   1. MODERN_MSW=true  → luôn bật (demo/e2e bản build prod)
//   2. MODERN_MSW=false → luôn tắt (env sit/uat/staging set sẵn)
//   3. không set: bật khi dev VÀ chưa trỏ gateway thật (MODERN_API_BASE_URL rỗng)
//      → `pnpm dev sit` (mixed mode) tự dùng API SIT thật, không bị MSW chặn.
function isMswEnabled(): boolean {
  try {
    if (process.env.MODERN_MSW === 'true') return true;
    if (process.env.MODERN_MSW === 'false') return false;
  } catch {
    /* MODERN_MSW chưa set */
  }
  try {
    return process.env.NODE_ENV === 'development' && !readApiBase();
  } catch {
    return false;
  }
}

const mswOn = isMswEnabled();

// Root layout: CHỈ providers toàn cục. Chrome (nav/header) thuộc về
// __public/layout và __private/layout — 2 nhóm có khung khác nhau (bank pattern).
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
        {/* MỘT QueryClient toàn hệ thống — remote dùng chung (react-query singleton) */}
        <QueryProvider>
          <Helmet>
            <html lang={BRAND.htmlLang} />
            <title>{`${BRAND.name} — Ngân hàng số`}</title>
          </Helmet>
          <MswGate enabled={mswOn}>
            <div className="app">
              <Outlet />
            </div>
          </MswGate>
        </QueryProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
