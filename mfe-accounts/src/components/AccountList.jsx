import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Card, PageSpinner, StatusBadge } from 'shared/ui';
import { fetchAccounts } from '../api/accounts';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const getUser = () => {
  if (typeof window === 'undefined') return null; // SSR guard
  try {
    return JSON.parse(localStorage.getItem('vietbank_user') || 'null');
  } catch {
    return null;
  }
};

const ACCOUNT_ICON = { checking: '🏦', savings: '💰' };

const AccountItem = memo(function AccountItem({ acc }) {
  return (
    <Link to={acc.id} style={{ textDecoration: 'none' }}>
      <Card hoverable>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: acc.type === 'checking' ? '#dbeafe' : '#fef9c3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            {ACCOUNT_ICON[acc.type]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{acc.name}</span>
              <StatusBadge
                label={acc.typeLabel}
                color={acc.type === 'checking' ? 'blue' : 'yellow'}
              />
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
              {acc.number}
            </div>
            {acc.interestRate && (
              <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>
                Lãi suất {acc.interestRate}%/năm · Đáo hạn {acc.maturity}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#1e3a5f' }}>
              {fmt(acc.balance)}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Xem chi tiết →</div>
          </div>
        </div>
      </Card>
    </Link>
  );
});

export default function AccountList() {
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });

  const user = getUser();
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  if (isLoading) return <PageSpinner label="Đang tải tài khoản..." />;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div
        style={{
          marginBottom: 6,
          fontSize: 12,
          color: '#94a3b8',
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}
      >
        MFE-ACCOUNTS TEAM
      </div>

      {user && (
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
          Xin chào, <strong>{user.name}</strong>
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>Tài khoản của tôi</h2>
        <span style={{ fontSize: 14, color: '#64748b' }}>
          Tổng: <strong style={{ color: '#1e3a5f' }}>{fmt(totalBalance)}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {accounts.map((acc) => (
          <AccountItem key={acc.id} acc={acc} />
        ))}
      </div>
    </div>
  );
}
