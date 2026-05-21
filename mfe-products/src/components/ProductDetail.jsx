import React from 'react';

// Component này được dynamic import — webpack tách thành chunk riêng:
//   product-detail.[contenthash].chunk.js
// Chỉ download khi user thực sự click vào sản phẩm, không phải khi mở trang.
export default function ProductDetail({ product, onClose }) {
  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-card" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>✕</button>

        <div className="detail-emoji">{product.emoji}</div>
        <span className="product-category">{product.category}</span>
        <h2 className="detail-name">{product.name}</h2>

        <div className="detail-rating">
          {'★'.repeat(Math.floor(product.rating))}
          {'☆'.repeat(5 - Math.floor(product.rating))}
          <span className="rating-count">({product.reviews} reviews)</span>
        </div>

        <p className="detail-description">
          A premium quality {product.name.toLowerCase()} designed for everyday use.
          Backed by a 2-year warranty and free returns.
        </p>

        <div className="detail-specs">
          <div className="spec-row"><span>Rating</span><strong>{product.rating}/5</strong></div>
          <div className="spec-row"><span>Reviews</span><strong>{product.reviews}</strong></div>
          <div className="spec-row"><span>Category</span><strong>{product.category}</strong></div>
          <div className="spec-row"><span>In Stock</span><strong style={{color:'#38a169'}}>Yes</strong></div>
        </div>

        <div className="detail-footer">
          <span className="detail-price">${product.price}</span>
          <button className="btn-primary" style={{width:'auto',padding:'10px 28px'}}>
            Add to Cart
          </button>
        </div>

        <div className="detail-chunk-note">
          💡 Chunk: <code>product-detail.[hash].chunk.js</code> — loaded on demand
        </div>
      </div>
    </div>
  );
}
