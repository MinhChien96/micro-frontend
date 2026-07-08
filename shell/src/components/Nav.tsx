import { BRAND } from '@app/common/brand';
import { Paths } from '@app/common/constants/paths';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { NAV_ITEMS } from '../constants/menu';
import { prefetchRemote } from '../remote/load';

const ROLE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  PREMIUM: { label: 'Ưu tiên', bg: '#fef3c7', color: '#d97706' },
  BUSINESS: { label: 'DN', bg: '#ede9fe', color: '#7c3aed' },
};

// Nav chỉ render trong PrivateLayout — user luôn tồn tại tại đây.
export default function Nav({ onLogout }: { onLogout: () => void }) {
  const user = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const roleBadge = user?.role && ROLE_BADGE[user.role];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">{BRAND.icon}</span>
        <span className="brand-name">{BRAND.name}</span>
        <span className="brand-badge">{BRAND.tagline}</span>
      </div>

      <div className="navbar-links">
        {NAV_ITEMS.map(({ to, label, tag, prefetch }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${isActive(to) ? 'active' : ''}`}
            onMouseEnter={prefetch && (() => prefetchRemote(prefetch.remote, prefetch.expose))}
          >
            {label}
            <span className="mfe-tag">{tag}</span>
          </Link>
        ))}
      </div>

      <div className="navbar-user">
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
        <Link to={Paths.profile} className="user-info">
          <span className="avatar">{user?.name[0].toUpperCase()}</span>
          <span>{user?.name}</span>
        </Link>
        <button type="button" onClick={onLogout} className="btn-logout">
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}
