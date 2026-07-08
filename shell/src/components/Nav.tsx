import { clearAuth } from '@app/common/auth';
import { BRAND } from '@app/common/brand';
import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { prefetchRemote } from '../remote/load';

const ROLE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  PREMIUM: { label: 'Ưu tiên', bg: '#fef3c7', color: '#d97706' },
  BUSINESS: { label: 'DN', bg: '#ede9fe', color: '#7c3aed' },
};

const NAV_LINKS = [
  {
    to: '/accounts',
    label: 'Tài khoản',
    tag: 'mfe-accounts',
    prefetch: () => prefetchRemote('mfe_accounts', 'AccountsApp'),
  },
  {
    to: '/transfer',
    label: 'Chuyển tiền',
    tag: 'mfe-transfer',
    prefetch: () => prefetchRemote('mfe_transfer', 'TransferApp'),
  },
  {
    to: '/cards',
    label: 'Thẻ',
    tag: 'mfe-cards',
    prefetch: () => prefetchRemote('mfe_cards', 'CardsApp'),
  },
  {
    to: '/loans',
    label: 'Vay vốn',
    tag: 'mfe-loans',
    prefetch: () => prefetchRemote('mfe_loans', 'LoansApp'),
  },
  // @plop:nav-link (generator chèn link MFE mới bên trên)
];

export default function Nav() {
  const user = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = useCallback(() => {
    clearAuth();
    window.dispatchEvent(new CustomEvent('auth:changed'));
  }, []);

  const roleBadge = user?.role && ROLE_BADGE[user.role];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">{BRAND.icon}</span>
        <span className="brand-name">{BRAND.name}</span>
        <span className="brand-badge">{BRAND.tagline}</span>
      </div>

      <div className="navbar-links">
        {NAV_LINKS.map(({ to, label, tag, prefetch }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${isActive(to) ? 'active' : ''}`}
            onMouseEnter={prefetch}
          >
            {label}
            <span className="mfe-tag">{tag}</span>
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        {user ? (
          <>
            {roleBadge && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: roleBadge.bg,
                  color: roleBadge.color,
                }}
              >
                {roleBadge.label}
              </span>
            )}
            <Link to="/profile" className="user-info">
              <span className="avatar">{user.name[0].toUpperCase()}</span>
              <span>{user.name}</span>
            </Link>
            <button onClick={handleLogout} className="btn-logout">
              Đăng xuất
            </button>
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
