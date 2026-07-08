import { BRAND } from '@app/common/brand';
import { Link, Outlet } from '@modern-js/runtime/router';

// Khung cho nhóm route PUBLIC (landing, login...): header tối giản,
// không menu nghiệp vụ — khác hẳn PrivateLayout.
export default function PublicLayout() {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
          <span className="brand-icon">{BRAND.icon}</span>
          <span className="brand-name">{BRAND.name}</span>
          <span className="brand-badge">{BRAND.tagline}</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link to="/login" className="nav-link">
          Đăng nhập
          <span className="mfe-tag">mfe-auth</span>
        </Link>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}
