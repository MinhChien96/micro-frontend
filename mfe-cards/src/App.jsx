import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StandaloneProviders from './StandaloneProviders';
import CardsApp from './components/CardsApp';
import './styles.css';

/**
 * Standalone entry — runs when cards team starts mfe-cards independently.
 * Mock user has BUSINESS role → all PermissionGate controls are unlocked.
 */
export default function App() {
  return (
    <StandaloneProviders>
      <div style={{ padding: 24 }}>
        <div className="standalone-banner">
          Standalone — <code>mfe-cards</code> :3007 · Mock user: BUSINESS role
        </div>
        <Routes>
          <Route path="/*" element={<CardsApp />} />
        </Routes>
      </div>
    </StandaloneProviders>
  );
}
