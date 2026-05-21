import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AccountsApp from './components/AccountsApp';
import './styles.css';

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <div className="standalone-banner">
        Standalone — <code>mfe-accounts</code> :3002
      </div>
      <Routes>
        <Route path="/*" element={<AccountsApp />} />
      </Routes>
    </div>
  );
}
