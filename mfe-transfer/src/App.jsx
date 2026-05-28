import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StandaloneProviders from './StandaloneProviders';
import TransferApp from './components/TransferApp';
import './styles.css';

/**
 * Standalone entry — runs when payments team starts mfe-transfer independently.
 * Toast calls will be no-ops (useToast returns noop when no ToastProvider).
 * Event Bus prefill won't fire (accounts MFE not running), but form still works.
 */
export default function App() {
  return (
    <StandaloneProviders>
      <div style={{ padding: 24 }}>
        <div className="standalone-banner">
          Standalone — <code>mfe-transfer</code> :3003 · Mock user: PREMIUM role
        </div>
        <Routes>
          <Route path="/*" element={<TransferApp />} />
        </Routes>
      </div>
    </StandaloneProviders>
  );
}
