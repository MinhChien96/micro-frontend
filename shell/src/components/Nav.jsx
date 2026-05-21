import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1 }).format(n);

export default function Nav() {
  const [user, setUser] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    let unsubAuth, unsubAccount;

    Promise.all([
      import('shared/authStore'),
      import('shared/accountStore'),
    ]).then(([{ useAuthStore }, { useAccountStore }]) => {
      setUser(useAuthStore.getState().user);
      setTotalBalance(useAccountStore.getState().getTotalBalance());

      unsubAuth    = useAuthStore.subscribe((s) => setUser(s.user));
      unsubAccount = useAccountStore.subscribe((s) => setTotalBalance(s.getTotalBalance()));
    });

    return () => {
      unsubAuth?.();
      unsubAccount?.();
    };
  }, []);

  const handleLogout = () => {
    import('shared/authStore').then(({ useAuthStore }) => {
      useAuthStore.getState().logout();
    });
  };

  const NAV_LINKS = [
    { to: '/accounts', label: 'Tài khoản', tag: 'mfe-accounts' },
    { to: '/transfer', label: 'Chuyển tiền', tag: 'mfe-transfer' },
    { to: '/cards',    label: 'Thẻ',         tag: 'mfe-cards' },
    { to: '/loans',    label: 'Vay vốn',     tag: 'mfe-loans' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🏦</span>
        <span className="brand-name">VietBank</span>
        <span className="brand-badge">Module Federation</span>
      </div>

      <div className="navbar-links">
        {NAV_LINKS.map(({ to, label, tag }) => (
          <Link key={to} to={to} className={`nav-link ${isActive(to) ? 'active' : ''}`}>
            {label}
            <span className="mfe-tag">{tag}</span>
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        {user ? (
          <>
            {totalBalance > 0 && (
              <span className="balance-chip">{fmt(totalBalance)}</span>
            )}
            <Link to="/profile" className="user-info">
              <span className="avatar">{user.name[0].toUpperCase()}</span>
              <span>{user.name}</span>
            </Link>
            <button onClick={handleLogout} className="btn-logout">Đăng xuất</button>
          </>
        ) : (
          <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
            Đăng nhập
            <span className="mfe-tag">mfe-auth</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
