import { BRAND } from '@app/shared/brand';
import { ToastProvider } from '@app/shared/ui';
import { Helmet } from '@modern-js/runtime/head';
import { Outlet } from '@modern-js/runtime/router';
import { AuthProvider } from '../AuthContext';
import Nav from '../components/Nav';
import '../styles.css';

export default function RootLayout() {
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
