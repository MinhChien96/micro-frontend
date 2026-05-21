// Standalone app — dùng để dev/test MFE Auth độc lập
import React from 'react';
import Login from './components/Login';
import './styles.css';

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <div className="standalone-banner">
        Running standalone — <code>mfe-auth</code> on port 3001
      </div>
      <Login />
    </div>
  );
}
