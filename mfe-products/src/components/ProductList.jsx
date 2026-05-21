import React, { useState, lazy, Suspense } from 'react';
import ProductCard from './ProductCard';
import { PRODUCTS } from '../data/products';
import { useCartStore } from 'shared/cartStore';
import '../styles.css';

// Level 2 lazy load — bên TRONG mfe-products (intra-MFE code splitting)
// webpack tạo chunk riêng: product-detail.[contenthash].chunk.js
// Chunk này chỉ được download khi user click vào product lần đầu tiên
const ProductDetail = lazy(() =>
  import(
    /* webpackChunkName: "product-detail" */
    /* webpackPrefetch: true */           // Browser prefetch lúc idle (không block)
    './ProductDetail'
  )
);

export default function ProductList() {
  const [filter, setFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['All', ...new Set(PRODUCTS.map((p) => p.category))];
  const addItem = useCartStore((s) => s.addItem);

  const filtered =
    filter === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Products</h1>
        <p className="mfe-label">
          Served by <code>mfe-products</code>
        </p>
      </div>

      <div className="filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addItem}
            // Click → webpack fetch product-detail chunk (nếu chưa có)
            // Lần 2 trở đi: chunk đã trong cache → instant
            onViewDetail={setSelectedProduct}
          />
        ))}
      </div>

      {/* ProductDetail chỉ mount khi selectedProduct !== null */}
      {selectedProduct && (
        <Suspense fallback={
          <div className="detail-loading">
            <div className="spinner" />
            <p>Loading detail chunk…</p>
          </div>
        }>
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
