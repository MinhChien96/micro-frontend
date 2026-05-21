import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Shell's Nav cần đọc state từ shared stores nhưng không thể dùng hooks
 * cho remote imports bất đồng bộ. Giải pháp: dùng Zustand's subscribe API
 * (không phải hook) để sync state vào local useState.
 *
 * Đây là pattern chuẩn khi shell cần phản ứng với shared store:
 * import store → getState() lấy giá trị ban đầu → subscribe() lắng nghe thay đổi
 */
export default function Nav() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    let unsubAuth, unsubCart;

    // Dynamic import vì shared là remote MFE, không phải local module
    Promise.all([
      import('shared/authStore'),
      import('shared/cartStore'),
    ]).then(([{ useAuthStore }, { useCartStore }]) => {
      // Sync initial state
      setUser(useAuthStore.getState().user);
      setCartCount(useCartStore.getState().getCount());

      // Subscribe nhận mọi thay đổi từ bất kỳ MFE nào
      unsubAuth = useAuthStore.subscribe((s) => setUser(s.user));
      unsubCart = useCartStore.subscribe((s) =>
        setCartCount(s.getCount())
      );
    });

    return () => {
      unsubAuth?.();
      unsubCart?.();
    };
  }, []);

  const handleLogout = () => {
    import('shared/authStore').then(({ useAuthStore }) => {
      useAuthStore.getState().logout();
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🛍️</span>
        <span className="brand-name">MicroShop</span>
        <span className="brand-badge">Module Federation</span>
      </div>

      <div className="navbar-links">
        <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
          Products
          <span className="mfe-tag">mfe-products</span>
        </Link>
        <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`}>
          Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          <span className="mfe-tag">mfe-cart</span>
        </Link>
      </div>

      <div className="navbar-user">
        {user ? (
          <>
            <Link to="/profile" className="user-info">
              <span className="avatar">{user.name[0].toUpperCase()}</span>
              <span>{user.name}</span>
            </Link>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
            Login
            <span className="mfe-tag">mfe-auth</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
