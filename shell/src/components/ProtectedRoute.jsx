import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from 'shared/authStore';

export default function ProtectedRoute({ children, permission }) {
  const user        = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const location    = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (permission && !permissions.includes(permission)) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
        <h2 style={{ color: '#dc2626', marginBottom: 8, fontSize: 20 }}>Không có quyền truy cập</h2>
        <p style={{ color: '#64748b', marginBottom: 4 }}>
          Tính năng này yêu cầu gói tài khoản <strong>Ưu tiên (PREMIUM)</strong> trở lên.
        </p>
        <p style={{ color: '#94a3b8', fontSize: 13 }}>
          Vui lòng liên hệ <strong>1800-xxxx</strong> để nâng cấp tài khoản.
        </p>
      </div>
    );
  }

  return children;
}
