import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import './styles.css';

// Lazy load từ remote MFEs
const Login       = lazy(() => import('mfe_auth/Login'));
const ProductList = lazy(() => import('mfe_products/ProductList'));
const Cart        = lazy(() => import('mfe_cart/Cart'));
const ProfilePage = lazy(() => import('mfe_profile/ProfilePage'));
const OrderList   = lazy(() => import('mfe_orders/OrderList'));

const LoadingFallback = ({ name }) => (
  <div className="loading-box">
    <div className="spinner" />
    <p>Loading {name}...</p>
  </div>
);

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  componentDidCatch() { this.setState({ hasError: true }); }
  render() {
    if (this.state.hasError) {
      return <div className="error-box">Failed to load MFE — is the remote running?</div>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <div className="app">
      <Nav />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />

          <Route
            path="/login"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback name="Auth" />}>
                  <Login />
                </Suspense>
              </ErrorBoundary>
            }
          />

          <Route
            path="/profile"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback name="Profile" />}>
                  <ProfilePage />
                </Suspense>
              </ErrorBoundary>
            }
          />

          <Route
            path="/orders"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback name="Orders" />}>
                  <OrderList />
                </Suspense>
              </ErrorBoundary>
            }
          />

          <Route
            path="/products"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback name="Products" />}>
                  <ProductList />
                </Suspense>
              </ErrorBoundary>
            }
          />

          <Route
            path="/cart"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback name="Cart" />}>
                  <Cart />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
