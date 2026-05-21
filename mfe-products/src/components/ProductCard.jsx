import React, { useState } from 'react';

export default function ProductCard({ product, onAddToCart, onViewDetail }) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    // Click vào card → trigger lazy load ProductDetail chunk
    <div className="product-card" onClick={() => onViewDetail(product)} style={{ cursor: 'pointer' }}>
      <div className="product-emoji">{product.emoji}</div>
      <div className="product-category">{product.category}</div>
      <h3 className="product-name">{product.name}</h3>

      <div className="product-rating">
        {'★'.repeat(Math.floor(product.rating))}
        {'☆'.repeat(5 - Math.floor(product.rating))}
        <span className="rating-count">({product.reviews})</span>
      </div>

      <div className="product-footer">
        <span className="product-price">${product.price}</span>
        <button
          className={`btn-add-cart ${added ? 'added' : ''}`}
          onClick={handleAdd}
        >
          {added ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
