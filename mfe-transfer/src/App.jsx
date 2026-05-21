import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TransferApp from './components/TransferApp';
import './styles.css';

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <div className="standalone-banner">
        Standalone — <code>mfe-transfer</code> :3003
      </div>
      <Routes>
        <Route path="/*" element={<TransferApp />} />
      </Routes>
    </div>
  );
}
