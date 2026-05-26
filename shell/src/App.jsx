import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from 'shared/ThemeContext';
import { ToastProvider } from 'shared/ui';
import Nav from './components/Nav';
import ProtectedRoute from './components/ProtectedRoute';
import { AccountsSkeleton, TransferSkeleton, CardsSkeleton, LoansSkeleton, ProfileSkeleton } from './skeletons';
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

const MAX_RETRIES = 3;

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, retryCount: 0, retryKey: 0 };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState((s) => ({
      hasError: false,
      error: null,
      retryCount: s.retryCount + 1,
      retryKey: s.retryKey + 1,  // forces Suspense+lazy subtree to remount
    }));
  };

  render() {
    const { hasError, error, retryCount, retryKey } = this.state;

    if (hasError) {
      const attemptsLeft = MAX_RETRIES - retryCount;
      return (
        <div className="error-box">
          <strong>Không thể tải MFE</strong> — remote có đang chạy không?
          <br /><small style={{ opacity: 0.7 }}>{error?.message}</small>
          <br />
          {attemptsLeft > 0 ? (
            <button
              onClick={this.handleRetry}
              style={{ marginTop: 10, padding: '6px 16px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: 'pointer', background: '#fff', fontSize: 13 }}
            >
              Thử lại ({attemptsLeft} lần còn lại)
            </button>
          ) : (
            <div style={{ marginTop: 10 }}>
              <small style={{ color: '#ef4444', display: 'block', marginBottom: 8 }}>
                ⚡ Circuit open — Remote không phản hồi sau {MAX_RETRIES} lần thử.
              </small>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#ef4444', color: '#fff', fontSize: 13 }}
              >
                Tải lại trang
              </button>
            </div>
          )}
        </div>
      );
    }

    // Keyed fragment forces the Suspense+lazy subtree to remount on retry.
    return <React.Fragment key={retryKey}>{this.props.children}</React.Fragment>;
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
    <ToastProvider>
    <AuthProvider>
      <div className="app">
        <Nav />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/accounts" replace />} />

            <Route path="/login" element={mfe('Đăng nhập', <Login />)} />

            <Route path="/accounts/*" element={<ProtectedRoute>{mfe('Tài khoản', <AccountsApp />, <AccountsSkeleton />)}</ProtectedRoute>} />
            <Route path="/transfer/*" element={<ProtectedRoute>{mfe('Chuyển tiền', <TransferApp />, <TransferSkeleton />)}</ProtectedRoute>} />
            <Route path="/cards/*"    element={<ProtectedRoute>{mfe('Thẻ', <CardsApp />, <CardsSkeleton />)}</ProtectedRoute>} />
            <Route path="/loans/*"    element={<ProtectedRoute>{mfe('Vay vốn', <LoansApp />, <LoansSkeleton />)}</ProtectedRoute>} />
            <Route path="/profile/*"  element={<ProtectedRoute>{mfe('Hồ sơ', <ProfileApp />, <ProfileSkeleton />)}</ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
    </ToastProvider>
    </ThemeProvider>
  );
}
