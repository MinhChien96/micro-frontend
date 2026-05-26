import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from 'shared/ThemeContext';
import { SkeletonList } from 'shared/ui';
import Nav from './components/Nav';
import ProtectedRoute from './components/ProtectedRoute';
import './styles.css';

const Login       = lazy(() => import('mfe_auth/Login'));
const AccountsApp = lazy(() => import('mfe_accounts/AccountsApp'));
const TransferApp = lazy(() => import('mfe_transfer/TransferApp'));
const CardsApp    = lazy(() => import('mfe_cards/CardsApp'));
const LoansApp    = lazy(() => import('mfe_loans/LoansApp'));
const ProfileApp  = lazy(() => import('mfe_profile/ProfileApp'));

const LoadingFallback = ({ name }) => (
  <div className="loading-box">
    <div className="spinner" />
    <p>Đang tải {name}...</p>
  </div>
);

// Skeleton khớp layout TransferDashboard — hiện ngay khi bundle đang load,
// liền mạch với skeleton bên trong TransferDashboard khi data đang fetch.
const TransferSkeleton = () => (
  <div style={{ maxWidth: 680, margin: '0 auto' }}>
    <div style={{ height: 12, width: 120, borderRadius: 6, background: '#e2e8f0', marginBottom: 20 }} />
    {/* Account card */}
    <div style={{ padding: 20, borderRadius: 16, background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', marginBottom: 20 }}>
      <div style={{ height: 12, width: '40%', borderRadius: 6, background: 'rgba(255,255,255,0.2)', marginBottom: 10 }} />
      <div style={{ height: 16, width: '55%', borderRadius: 6, background: 'rgba(255,255,255,0.25)', marginBottom: 8 }} />
      <div style={{ height: 12, width: '35%', borderRadius: 6, background: 'rgba(255,255,255,0.15)', marginBottom: 14 }} />
      <div style={{ height: 28, width: '50%', borderRadius: 6, background: 'rgba(255,255,255,0.3)' }} />
    </div>
    {/* Quick actions */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
      {[0,1,2,3].map((i) => (
        <div key={i} style={{ height: 72, borderRadius: 12, background: '#f1f5f9' }} />
      ))}
    </div>
    {/* Recent list */}
    <SkeletonList rows={3} />
  </div>
);

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  componentDidCatch(err) { this.setState({ hasError: true, error: err }); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-box">
          <strong>Không thể tải MFE</strong> — remote có đang chạy không?
          <br /><small style={{ opacity: 0.7 }}>{this.state.error?.message}</small>
        </div>
      );
    }
    return this.props.children;
  }
}

const mfe = (name, element, fallback) => (
  <ErrorBoundary>
    <Suspense fallback={fallback ?? <LoadingFallback name={name} />}>
      {element}
    </Suspense>
  </ErrorBoundary>
);

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <div className="app">
        <Nav />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/accounts" replace />} />

            <Route path="/login" element={mfe('Đăng nhập', <Login />)} />

            <Route path="/accounts/*" element={<ProtectedRoute>{mfe('Tài khoản', <AccountsApp />)}</ProtectedRoute>} />
            <Route path="/transfer/*" element={<ProtectedRoute>{mfe('Chuyển tiền', <TransferApp />, <TransferSkeleton />)}</ProtectedRoute>} />
            <Route path="/cards/*"    element={<ProtectedRoute>{mfe('Thẻ', <CardsApp />)}</ProtectedRoute>} />
            <Route path="/loans/*"    element={<ProtectedRoute>{mfe('Vay vốn', <LoansApp />)}</ProtectedRoute>} />
            <Route path="/profile/*"  element={<ProtectedRoute>{mfe('Hồ sơ', <ProfileApp />)}</ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
    </ThemeProvider>
  );
}
