import React from 'react';
import { Outlet } from '@modern-js/runtime/router';
import { AuthProvider } from '../AuthContext';
import Nav from '../components/Nav';
import '../styles.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <div className="app">
        <Nav />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  );
}
