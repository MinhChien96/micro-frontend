import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1 }).format(n);

const ROLE_BADGE = { PREMIUM: { label: 'Ưu tiên', bg: '#fef3c7', color: '#d97706' }, BUSINESS: { label: 'DN', bg: '#ede9fe', color: '#7c3aed' } };

const NAV_LINKS = [
  { to: '/accounts', label: 'Tài khoản', tag: 'mfe-accounts', remote: 'mfe-accounts' },
  { to: '/transfer', label: 'Chuyển tiền', tag: 'mfe-transfer', remote: 'mfe-transfer' },
  { to: '/cards',    label: 'Thẻ',         tag: 'mfe-cards',    remote: 'mfe-cards' },
  { to: '/loans',    label: 'Vay vốn',     tag: 'mfe-loans',    remote: 'mfe-loans' },
];

// Prefetch map — triggers remote download on hover so click feels instant
const PREFETCHERS = {
  'mfe-accounts': () => import('mfe_accounts/AccountsApp'),
  'mfe-transfer': () => import('mfe_transfer/TransferApp'),
  'mfe-cards':    () => import('mfe_cards/CardsApp'),
  'mfe-loans':    () => import('mfe_loans/LoansApp'),
};

export default function Nav() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const location = useLocation();
  const isActive = useCallback((path) => location.pathname.startsWith(path), [location.pathname]);

  useEffect(() => {
    let unsubAuth, unsubAccount;

    Promise.all([
      import('shared/authStore'),
      import('shared/accountStore'),
    ]).then(([{ useAuthStore }, { useAccountStore }]) => {
      // Read initial state
      const s = useAuthStore.getState();
      setUser(s.user);
      setRole(s.role);
      setTotalBalance(useAccountStore.getState().getTotalBalance());

      // Selective subscriptions — listener fires only when selector result changes
      unsubAuth = useAuthStore.subscribe(
        (s) => [s.user, s.role],
        ([user, role]) => { setUser(user); setRole(role); },
        { equalityFn: (a, b) => a[0] === b[0] && a[1] === b[1] }
      );
      unsubAccount = useAccountStore.subscribe(
        (s) => s.accounts.reduce((sum, a) => sum + (a.balance || 0), 0),
        (total) => setTotalBalance(total)
      );
    });

    return () => { unsubAuth?.(); unsubAccount?.(); };
  }, []);

  const handleLogout = useCallback(() => {
    import('shared/authStore').then(({ useAuthStore }) => {
      useAuthStore.getState().logout();
    });
  }, []);

  const handleMouseEnter = useCallback((remote) => {
    PREFETCHERS[remote]?.();
  }, []);

  const roleBadge = role && ROLE_BADGE[role];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🏦</span>
        <span className="brand-name">VietBank</span>
        <span className="brand-badge">Module Federation</span>
      </div>

      <div className="navbar-links">
        {NAV_LINKS.map(({ to, label, tag, remote }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${isActive(to) ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(remote)}
          >
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
            {roleBadge && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: roleBadge.bg, color: roleBadge.color }}>
                {roleBadge.label}
              </span>
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
