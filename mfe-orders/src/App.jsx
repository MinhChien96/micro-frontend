import React from 'react';
import { ToastProvider } from 'shared/ui';
import OrderList from './components/OrderList';
import './styles.css';

export default function App() {
  return (
    <ToastProvider>
      <div style={{ padding: 24 }}>
        <div className="standalone-banner">
          Running standalone — <code>mfe-orders</code> on port 3006
        </div>
        <OrderList />
      </div>
    </ToastProvider>
  );
}
