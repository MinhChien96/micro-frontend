import React from 'react';
import { useAuthStore } from 'shared/authStore';
import '../styles.css';

export default function UserProfile() {
  // Đọc trực tiếp từ store — không cần prop từ shell
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return <div className="auth-card">Not logged in</div>;

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="profile-avatar">{user.name[0].toUpperCase()}</div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>

      <div className="profile-info">
        <div className="info-row">
          <span className="info-label">Role</span>
          <span className="info-badge">{user.role}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Status</span>
          <span className="info-badge success">Active</span>
        </div>
        <div className="info-row">
          <span className="info-label">Store</span>
          <span className="info-badge mfe">shared/authStore</span>
        </div>
      </div>

      <button onClick={logout} className="btn-danger">
        Sign Out
      </button>
    </div>
  );
}
