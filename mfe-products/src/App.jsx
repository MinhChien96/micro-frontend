import React from 'react';
import ProductList from './components/ProductList';
import './styles.css';

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <div className="standalone-banner">
        Running standalone — <code>mfe-products</code> on port 3002
      </div>
      <ProductList />
    </div>
  );
}
