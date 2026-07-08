import type { ReactNode } from 'react';
import type { ActionEnum } from '../permissions/entitledAction';
import { canAllActions, canAnyAction } from '../permissions/utils';
import { useGlobalStore } from '../stores/global.store';

export const UpgradeBadge = ({ requiredRole = 'PREMIUM' }: { requiredRole?: string }) => (
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

interface PermissionCheckProps {
  /** một hoặc nhiều ActionEnum (mô hình P/S/F — xem @app/common/permissions) */
  actions: ActionEnum | ActionEnum[];
  /** 'OR' (mặc định): đủ 1 quyền; 'AND': phải đủ tất cả */
  logic?: 'OR' | 'AND';
  /** node hiển thị khi không đủ quyền (mặc định: null) */
  fallback?: ReactNode;
  /** label trong UpgradeBadge khi showLocked */
  requiredRole?: string;
  /** true + không có fallback → render nút bị khóa */
  showLocked?: boolean;
  children: ReactNode;
}

/**
 * Ẩn/hiện children theo entitledActions của user (bank: <PermissionCheck>).
 * Reactive theo global store — user đổi (login role khác) là UI cập nhật ngay.
 */
export default function PermissionCheck({
  actions,
  logic = 'OR',
  fallback = null,
  requiredRole = 'PREMIUM',
  showLocked = false,
  children,
}: PermissionCheckProps) {
  const user = useGlobalStore((s) => s.user);
  const list = Array.isArray(actions) ? actions : [actions];
  const allowed = user
    ? logic === 'AND'
      ? canAllActions(list, user)
      : canAnyAction(list, user)
    : false;

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
