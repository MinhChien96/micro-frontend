import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StandaloneProviders from './StandaloneProviders';
import AccountsApp from './components/AccountsApp';
import './styles.css';

/**
 * Standalone entry — runs when team starts mfe-accounts independently.
 * In polyrepo: accounts team only needs shared (port 3004) + this server (port 3002).
 * Shell (port 3000) and other MFEs are NOT required.
 */
export default function App() {
  return (
    <StandaloneProviders>
      <div style={{ padding: 24 }}>
        <div className="standalone-banner">
          Standalone — <code>mfe-accounts</code> :3002 · Mock user: PREMIUM role
        </div>
        <Routes>
          <Route path="/*" element={<AccountsApp />} />
        </Routes>
      </div>
    </StandaloneProviders>
  );
}
