import React from 'react';
// useCartStore từ shared — CÙNG 1 instance với mfe-products
// Khi mfe-products gọi addItem(), component này re-render tự động
import { useCartStore } from 'shared/cartStore';
import '../styles.css';

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const getCount = useCartStore((s) => s.getCount);
  const getTotal = useCartStore((s) => s.getTotal);

  const count = getCount();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products from the Products page</p>
        <p className="mfe-label">
          Served by <code>mfe-cart</code> · State từ{' '}
          <code>shared/cartStore</code>
        </p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="cart-count">{count} items</span>
          <p className="mfe-label">
            <code>shared/cartStore</code>
          </p>
        </div>
      </div>

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <span className="cart-item-emoji">{item.emoji}</span>
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">${item.price}</div>
            </div>
            <div className="cart-qty-control">
              <button onClick={() => updateQty(item.id, -1)}>−</button>
              <span>{item.qty}</span>
              <button onClick={() => updateQty(item.id, 1)}>+</button>
            </div>
            <div className="cart-item-subtotal">
              ${(item.price * item.qty).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal ({count} items)</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span className="free">Free</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button className="btn-checkout">Proceed to Checkout</button>
      </div>
    </div>
  );
}
