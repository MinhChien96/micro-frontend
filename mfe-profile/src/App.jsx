import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StandaloneProviders from './StandaloneProviders';
import ProfileApp from './components/ProfileApp';
import './styles.css';

/**
 * Standalone entry — runs when platform team starts mfe-profile independently.
 * Full user profile mock (name, branch, phone) for realistic dev experience.
 */
export default function App() {
  return (
    <StandaloneProviders>
      <div style={{ padding: 24 }}>
        <div className="standalone-banner">
          Standalone — <code>mfe-profile</code> :3005 · Mock user: PREMIUM role
        </div>
        <Routes>
          <Route path="/*" element={<ProfileApp />} />
        </Routes>
      </div>
    </StandaloneProviders>
  );
}
