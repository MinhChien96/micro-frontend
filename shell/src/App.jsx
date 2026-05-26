import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from 'shared/ThemeContext';
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

            <Route path="/accounts/*" element={<ProtectedRoute>{mfe('Tài khoản', <AccountsApp />, <AccountsSkeleton />)}</ProtectedRoute>} />
            <Route path="/transfer/*" element={<ProtectedRoute>{mfe('Chuyển tiền', <TransferApp />, <TransferSkeleton />)}</ProtectedRoute>} />
            <Route path="/cards/*"    element={<ProtectedRoute>{mfe('Thẻ', <CardsApp />, <CardsSkeleton />)}</ProtectedRoute>} />
            <Route path="/loans/*"    element={<ProtectedRoute>{mfe('Vay vốn', <LoansApp />, <LoansSkeleton />)}</ProtectedRoute>} />
            <Route path="/profile/*"  element={<ProtectedRoute>{mfe('Hồ sơ', <ProfileApp />, <ProfileSkeleton />)}</ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
    </ThemeProvider>
  );
}
