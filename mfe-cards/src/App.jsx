import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CardsApp from './components/CardsApp';
import './styles.css';

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <div className="standalone-banner">
        Standalone — <code>mfe-cards</code> :3007
      </div>
      <Routes>
        <Route path="/*" element={<CardsApp />} />
      </Routes>
    </div>
  );
}
