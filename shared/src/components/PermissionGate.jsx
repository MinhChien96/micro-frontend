import React from 'react';
import { getPermissions } from '../auth';

const UpgradeBadge = ({ requiredRole = 'PREMIUM' }) => (
  <span style={{
    display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
    background: '#fef3c7', color: '#d97706',
    padding: '2px 8px', borderRadius: 10, marginLeft: 8,
  }}>
    {requiredRole}
  </span>
);

/**
 * Ẩn/hiện children dựa trên permission của user hiện tại.
 *
 * Props:
 *   permission   — chuỗi như "transfer:international"
 *   fallback     — node hiển thị khi không có quyền (mặc định: null)
 *   requiredRole — label hiển thị trong UpgradeBadge (mặc định: 'PREMIUM')
 *   showLocked   — khi true + không có fallback, tự render nút bị khoá
 */
export default function PermissionGate({
  permission,
  fallback = null,
  requiredRole = 'PREMIUM',
  showLocked = false,
  children,
}) {
  const hasPermission = getPermissions().includes(permission);

  if (hasPermission) return children;

  if (fallback) return fallback;

  if (showLocked) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderRadius: 10,
        border: '1px solid #e2e8f0', background: '#f8fafc',
        color: '#94a3b8', fontSize: 14, cursor: 'not-allowed',
      }}>
        <span>🔒</span>
        <span>Tính năng bị khóa</span>
        <UpgradeBadge requiredRole={requiredRole} />
      </div>
    );
  }

  return null;
}

export { UpgradeBadge };
