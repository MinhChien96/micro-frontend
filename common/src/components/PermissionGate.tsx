import type { ReactNode } from 'react';
import { getPermissions } from '../auth';
import type { Permission } from '../utils/permissions';

const UpgradeBadge = ({ requiredRole = 'PREMIUM' }: { requiredRole?: string }) => (
  <span
    style={{
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.3px',
      background: '#fef3c7',
      color: '#d97706',
      padding: '2px 8px',
      borderRadius: 10,
      marginLeft: 8,
    }}
  >
    {requiredRole}
  </span>
);

interface PermissionGateProps {
  /** permission như "transfer:international" */
  permission: Permission;
  /** node hiển thị khi không có quyền (mặc định: null) */
  fallback?: ReactNode;
  /** label trong UpgradeBadge (mặc định: 'PREMIUM') */
  requiredRole?: string;
  /** true + không có fallback → render nút bị khóa */
  showLocked?: boolean;
  children: ReactNode;
}

/** Ẩn/hiện children dựa trên permission của user hiện tại. */
export default function PermissionGate({
  permission,
  fallback = null,
  requiredRole = 'PREMIUM',
  showLocked = false,
  children,
}: PermissionGateProps) {
  const allowed = getPermissions().includes(permission);

  if (allowed) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  if (showLocked) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          background: '#f8fafc',
          color: '#94a3b8',
          fontSize: 14,
          cursor: 'not-allowed',
        }}
      >
        <span>🔒</span>
        <span>Tính năng bị khóa</span>
        <UpgradeBadge requiredRole={requiredRole} />
      </div>
    );
  }

  return null;
}

export { UpgradeBadge };
