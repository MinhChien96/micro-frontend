import React from 'react';
import '../styles.css';

const getUser = () => {
  if (typeof window === 'undefined') return null; // SSR guard
  try { return JSON.parse(localStorage.getItem('vietbank_user') || 'null'); }
  catch { return null; }
};

export default function UserProfile() {
  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('vietbank_user');
    localStorage.removeItem('vietbank_token');
    window.dispatchEvent(new CustomEvent('auth:changed'));
  };

  if (!user) return <div className="auth-card">Chưa đăng nhập</div>;

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="profile-avatar">{user.name[0].toUpperCase()}</div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>

      <div className="profile-info">
        <div className="info-row">
          <span className="info-label">Loại TK</span>
          <span className="info-badge">{user.role}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Trạng thái</span>
          <span className="info-badge success">Hoạt động</span>
        </div>
        <div className="info-row">
          <span className="info-label">Auth</span>
          <span className="info-badge mfe">localStorage</span>
        </div>
      </div>

      <button onClick={handleLogout} className="btn-danger">
        Đăng xuất
      </button>
    </div>
  );
}
