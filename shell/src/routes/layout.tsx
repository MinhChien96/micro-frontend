import React from 'react';
import { Outlet } from '@modern-js/runtime/router';
import { Helmet } from '@modern-js/runtime/head';
import { ToastProvider } from 'shared/ui';
import { AuthProvider } from '../AuthContext';
import Nav from '../components/Nav';
import '../styles.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* ToastProvider ở shell root — MFE gọi useToast() qua shared/ui singleton */}
      <ToastProvider>
        <Helmet>
          <html lang="vi" />
          <title>VietBank — Ngân hàng số</title>
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
