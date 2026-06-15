import { getUser } from '@app/shared/auth';
import { Card, CardHeader, Divider, SkeletonList } from '@app/shared/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchAccounts } from '../api/accounts';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(d));

const MOCK_RECENT = [
  {
    id: 'r1',
    name: 'Nguyễn Văn A',
    bank: 'Vietcombank',
    account: '1234 5678',
    amount: 2_000_000,
    date: '2024-10-15',
  },
  {
    id: 'r2',
    name: 'Trần Thị B',
    bank: 'Techcombank',
    account: '9876 5432',
    amount: 5_000_000,
    date: '2024-10-08',
  },
  {
    id: 'r3',
    name: 'Lê Văn C',
    bank: 'BIDV',
    account: '4567 8901',
    amount: 1_500_000,
    date: '2024-10-03',
  },
];

const QUICK_ACTIONS = [
  { icon: '⚡', label: 'Chuyển nhanh', to: 'new', color: '#dbeafe' },
  { icon: '📋', label: 'Lịch sử', to: 'history', color: '#f0fdf4' },
  { icon: '📅', label: 'Chuyển định kỳ', to: 'new', color: '#fef9c3' },
  { icon: '🌐', label: 'Chuyển quốc tế', to: 'new', color: '#fce7f3' },
];

export default function TransferDashboard() {
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });
  const user = getUser();
  const checkingAccount = accounts.find((a) => a.type === 'checking');

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
        MFE-TRANSFER TEAM
      </div>

      {user && (
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
          Xin chào, <strong>{user.name}</strong>
        </p>
      )}

      <h2 style={{ margin: '0 0 20px', fontSize: 22, color: '#0f172a' }}>Chuyển tiền</h2>

      {isLoading ? (
        <div style={{ marginBottom: 20 }}>
          {/* Skeleton cho account card gradient */}
          <div
            style={{
              padding: 20,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            }}
          >
            <div
              style={{
                height: 12,
                width: '40%',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.2)',
                marginBottom: 10,
              }}
            />
            <div
              style={{
                height: 16,
                width: '55%',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.25)',
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 12,
                width: '35%',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.15)',
                marginBottom: 14,
              }}
            />
            <div
              style={{
                height: 28,
                width: '50%',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.3)',
              }}
            />
          </div>
        </div>
      ) : checkingAccount ? (
        <Card
          style={{
            marginBottom: 20,
            background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
            Tài khoản nguồn mặc định
          </div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{checkingAccount.name}</div>
          <div style={{ fontSize: 12, fontFamily: 'monospace', opacity: 0.8, marginBottom: 8 }}>
            {checkingAccount.number}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{fmt(checkingAccount.balance)}</div>
        </Card>
      ) : (
        <Card style={{ marginBottom: 20, textAlign: 'center', padding: 24 }}>
          <div style={{ color: '#94a3b8', fontSize: 14 }}>
            Vui lòng truy cập{' '}
            <Link to="/accounts" style={{ color: '#2563eb' }}>
              Tài khoản
            </Link>{' '}
            để tải danh sách tài khoản
          </div>
        </Card>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 24,
          opacity: isLoading ? 0.4 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: 'opacity 0.2s',
        }}
      >
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.label} to={a.to} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: a.color,
                borderRadius: 12,
                padding: '14px 8px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{a.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{a.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <Divider />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <CardHeader>Giao dịch gần đây</CardHeader>
        <Link
          to="history"
          style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
        >
          Xem tất cả →
        </Link>
      </div>

      {isLoading ? (
        <SkeletonList rows={3} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_RECENT.map((tx) => (
            <Card key={tx.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{tx.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {tx.bank} · {tx.account}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 14 }}>
                    -{fmt(tx.amount)}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(tx.date)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 24,
          opacity: isLoading ? 0.4 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: 'opacity 0.2s',
        }}
      >
        <Link
          to="new"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '14px 0',
            background: '#1e3a5f',
            color: '#fff',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          + Tạo giao dịch mới
        </Link>
      </div>
    </div>
  );
}
