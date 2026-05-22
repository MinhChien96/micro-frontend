import React, { useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAccountStore } from 'shared/accountStore';
import { useAuthStore } from 'shared/authStore';
import { Card, CardHeader, Divider, StatusBadge } from 'shared/ui';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const MOCK_ACCOUNTS = [
  {
    id: 'TK001',
    type: 'checking',
    typeLabel: 'Thanh toán',
    name: 'Tài khoản thanh toán',
    number: '0021 0001 2345 678',
    balance: 15_420_000,
    currency: 'VND',
    status: 'active',
  },
  {
    id: 'TK002',
    type: 'savings',
    typeLabel: 'Tiết kiệm',
    name: 'Tiết kiệm 6 tháng',
    number: '0021 0007 8901 234',
    balance: 50_000_000,
    currency: 'VND',
    interestRate: 5.5,
    maturity: '2024-11-01',
    status: 'active',
  },
  {
    id: 'TK003',
    type: 'savings',
    typeLabel: 'Tiết kiệm',
    name: 'Tiết kiệm 12 tháng',
    number: '0021 0003 4567 890',
    balance: 100_000_000,
    currency: 'VND',
    interestRate: 6.2,
    maturity: '2025-03-15',
    status: 'active',
  },
];

const ACCOUNT_ICON = { checking: '🏦', savings: '💰' };

// Memoized — won't re-render unless the account object itself changes
const AccountItem = memo(function AccountItem({ acc }) {
  return (
    <Link to={acc.id} style={{ textDecoration: 'none' }}>
      <Card hoverable>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: acc.type === 'checking' ? '#dbeafe' : '#fef9c3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
          }}>
            {ACCOUNT_ICON[acc.type]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{acc.name}</span>
              <StatusBadge label={acc.typeLabel} color={acc.type === 'checking' ? 'blue' : 'yellow'} />
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{acc.number}</div>
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
  const { setAccounts, accounts, getTotalBalance } = useAccountStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Populate shared store để mfe-transfer có thể đọc
    if (accounts.length === 0) setAccounts(MOCK_ACCOUNTS);
  }, []);

  const list = accounts.length > 0 ? accounts : MOCK_ACCOUNTS;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 6, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
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
          Tổng: <strong style={{ color: '#1e3a5f' }}>{fmt(getTotalBalance() || list.reduce((s, a) => s + a.balance, 0))}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {list.map((acc) => (
          <AccountItem key={acc.id} acc={acc} />
        ))}
      </div>
    </div>
  );
}
