import { BRAND } from '@app/common/brand';
import { Paths } from '@app/common/constants/paths';
import { changeAppLanguage, SUPPORTED_LANGS, useAppTranslation } from '@app/common/i18n';
import { useGlobalStore } from '@app/common/stores';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { NAV_ITEMS } from '../constants/menu';
import { shellResources } from '../i18n/resources';
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
  // i18n instance riêng của shell — đổi lang là mọi instance đổi theo
  const { t } = useAppTranslation('shell', shellResources);
  const lang = useGlobalStore((s) => s.lang);

  const roleBadge = user?.role && ROLE_BADGE[user.role];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">{BRAND.icon}</span>
        <span className="brand-name">{BRAND.name}</span>
        <span className="brand-badge">{BRAND.tagline}</span>
      </div>

      <div className="navbar-links">
        {NAV_ITEMS.map(({ to, labelKey, tag, prefetch }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${isActive(to) ? 'active' : ''}`}
            onMouseEnter={prefetch && (() => prefetchRemote(prefetch.remote, prefetch.expose))}
          >
            {t(labelKey)}
            <span className="mfe-tag">{tag}</span>
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        {/* Language switcher — changeAppLanguage đồng bộ MỌI instance i18n */}
        <div style={{ display: 'flex', gap: 2 }}>
          {SUPPORTED_LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => changeAppLanguage(l)}
              style={{
                padding: '2px 8px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                background: lang === l ? 'rgba(255,255,255,0.25)' : 'transparent',
                color: lang === l ? '#fff' : 'rgba(255,255,255,0.55)',
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
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
          {t('nav.logout')}
        </button>
      </div>
    </nav>
  );
}
