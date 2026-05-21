import React from 'react';
import Cart from './components/Cart';
import './styles.css';

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <div className="standalone-banner">
        Running standalone — <code>mfe-cart</code> on port 3003
      </div>
      <Cart />
    </div>
  );
}
