import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StandaloneProviders from './StandaloneProviders';
import LoansApp from './components/LoansApp';
import './styles.css';

/**
 * Standalone entry — runs when lending team starts mfe-loans independently.
 * Mock user has BUSINESS role → loan application features visible.
 */
export default function App() {
  return (
    <StandaloneProviders>
      <div style={{ padding: 24 }}>
        <div className="standalone-banner">
          Standalone — <code>mfe-loans</code> :3006 · Mock user: BUSINESS role
        </div>
        <Routes>
          <Route path="/*" element={<LoansApp />} />
        </Routes>
      </div>
    </StandaloneProviders>
  );
}
