import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from 'shared/ThemeContext';
import { ToastProvider } from 'shared/ui';
import { ManifestProvider, useIsEnabled } from './ManifestContext';
import Nav from './components/Nav';
import ProtectedRoute from './components/ProtectedRoute';
import FeatureUnavailable from './components/FeatureUnavailable';
import RegistryPanel, { useRegistryPanelToggle } from './components/RegistryPanel';
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
      retryKey: s.retryKey + 1,
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

    return <React.Fragment key={retryKey}>{this.props.children}</React.Fragment>;
  }
}

/**
 * Enterprise pattern: MfeGate replaces the old mfe() helper.
 * Before mounting a remote, it checks the runtime manifest:
 *   - enabled: false  → render FeatureUnavailable (no lazy import attempted)
 *   - enabled: true   → ErrorBoundary + Suspense + lazy component
 *
 * This allows disabling a MFE across all users without redeploying shell —
 * just flip enabled:false in remotes.manifest.json and redeploy that JSON file.
 */
function MfeGate({ remoteName, fallback, children }) {
  const enabled = useIsEnabled(remoteName);
  if (!enabled) return <FeatureUnavailable remoteName={remoteName} />;
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback ?? <LoadingFallback name={remoteName} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  const [registryOpen, setRegistryOpen] = useRegistryPanelToggle();

  return (
    <ManifestProvider>
    <ThemeProvider>
    <ToastProvider>
    <AuthProvider>
      <div className="app">
        <Nav onOpenRegistry={() => setRegistryOpen(true)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/accounts" replace />} />

            <Route path="/login" element={
              <MfeGate remoteName="mfe_auth">
                <Login />
              </MfeGate>
            } />

            <Route path="/accounts/*" element={
              <ProtectedRoute>
                <MfeGate remoteName="mfe_accounts" fallback={<AccountsSkeleton />}>
                  <AccountsApp />
                </MfeGate>
              </ProtectedRoute>
            } />

            <Route path="/transfer/*" element={
              <ProtectedRoute>
                <MfeGate remoteName="mfe_transfer" fallback={<TransferSkeleton />}>
                  <TransferApp />
                </MfeGate>
              </ProtectedRoute>
            } />

            <Route path="/cards/*" element={
              <ProtectedRoute>
                <MfeGate remoteName="mfe_cards" fallback={<CardsSkeleton />}>
                  <CardsApp />
                </MfeGate>
              </ProtectedRoute>
            } />

            <Route path="/loans/*" element={
              <ProtectedRoute>
                <MfeGate remoteName="mfe_loans" fallback={<LoansSkeleton />}>
                  <LoansApp />
                </MfeGate>
              </ProtectedRoute>
            } />

            <Route path="/profile/*" element={
              <ProtectedRoute>
                <MfeGate remoteName="mfe_profile" fallback={<ProfileSkeleton />}>
                  <ProfileApp />
                </MfeGate>
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>

      {registryOpen && <RegistryPanel onClose={() => setRegistryOpen(false)} />}
    </AuthProvider>
    </ToastProvider>
    </ThemeProvider>
    </ManifestProvider>
  );
}
