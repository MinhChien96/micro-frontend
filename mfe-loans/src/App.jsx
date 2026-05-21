import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoansApp from './components/LoansApp';
import './styles.css';

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <div className="standalone-banner">
        Standalone — <code>mfe-loans</code> :3006
      </div>
      <Routes>
        <Route path="/*" element={<LoansApp />} />
      </Routes>
    </div>
  );
}
