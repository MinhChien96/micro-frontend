import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import './styles.css';

// Remote MFE *App components — each manages its own sub-routes via <Routes>
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

const mfe = (name, element) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback name={name} />}>
      {element}
    </Suspense>
  </ErrorBoundary>
);

export default function App() {
  return (
    <div className="app">
      <Nav />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/accounts" replace />} />

          <Route path="/login" element={mfe('Đăng nhập', <Login />)} />

          {/* Each MFE owns its sub-tree — shell uses /* so React Router passes the rest to the MFE's <Routes> */}
          <Route path="/accounts/*" element={mfe('Tài khoản', <AccountsApp />)} />
          <Route path="/transfer/*" element={mfe('Chuyển tiền', <TransferApp />)} />
          <Route path="/cards/*"    element={mfe('Thẻ', <CardsApp />)} />
          <Route path="/loans/*"    element={mfe('Vay vốn', <LoansApp />)} />
          <Route path="/profile/*"  element={mfe('Hồ sơ', <ProfileApp />)} />
        </Routes>
      </main>
    </div>
  );
}
