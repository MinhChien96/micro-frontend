import { getUser } from '@app/common/auth';
import { useAppTranslation } from '@app/common/i18n';
import { Card, PageSpinner, StatusBadge } from '@app/common/ui';
import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { type Account, type AccountType, fetchAccounts } from '../api/accounts';
import { accountsResources } from '../i18n/resources';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const ACCOUNT_ICON: Record<AccountType, string> = { checking: '🏦', savings: '💰' };

// Pattern A (bank): component KHÔNG tự import router — nhận navigator từ shell
const AccountItem = memo(function AccountItem({
  acc,
  onOpen,
}: {
  acc: Account;
  onOpen: (id: string) => void;
}) {
  return (
    <Card hoverable onClick={() => onOpen(acc.id)}>
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
          <div style={{ fontWeight: 700, fontSize: 17, color: '#1e3a5f' }}>{fmt(acc.balance)}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Xem chi tiết →</div>
        </div>
      </div>
    </Card>
  );
});

export default function AccountList({ navigator }: { navigator: NavigateFunction }) {
  const { t } = useAppTranslation('accounts', accountsResources);
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
        <h2 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>{t('accounts.title')}</h2>
        <span style={{ fontSize: 14, color: '#64748b' }}>
          Tổng: <strong style={{ color: '#1e3a5f' }}>{fmt(totalBalance)}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {accounts.map((acc) => (
          <AccountItem key={acc.id} acc={acc} onOpen={(id) => navigator(`/accounts/${id}`)} />
        ))}
      </div>
    </div>
  );
}
