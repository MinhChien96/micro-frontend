import eventBus from '@app/shared/eventBus';
import { Card, CardHeader, Divider, PageSpinner, StatusBadge } from '@app/shared/ui';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchAccount, fetchTransactions } from '../api/accounts';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(d),
  );

export default function AccountDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const { data: account, isLoading: loadingAccount } = useQuery({
    queryKey: ['account', id],
    queryFn: () => fetchAccount(id),
  });

  const { data: txns = [], isLoading: loadingTxns } = useQuery({
    queryKey: ['transactions', id],
    queryFn: () => fetchTransactions(id),
  });

  if (loadingAccount) return <PageSpinner label="Đang tải tài khoản..." />;

  if (!account) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <p style={{ color: '#64748b' }}>
          Không tìm thấy tài khoản <strong>{id}</strong>
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 12,
            padding: '8px 20px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            background: '#fff',
          }}
        >
          ← Quay lại
        </button>
      </div>
    );
  }

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

      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 20,
          padding: '6px 14px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          cursor: 'pointer',
          background: '#fff',
          fontSize: 13,
          color: '#64748b',
        }}
      >
        ← Danh sách tài khoản
      </button>

      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: account.type === 'checking' ? '#dbeafe' : '#fef9c3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            {account.type === 'checking' ? '🏦' : '💰'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>
                {account.name}
              </span>
              <StatusBadge
                label={account.typeLabel}
                color={account.type === 'checking' ? 'blue' : 'yellow'}
              />
              <StatusBadge label="Hoạt động" color="green" />
            </div>
            <div
              style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace', marginBottom: 8 }}
            >
              {account.number}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f' }}>
              {fmt(account.balance)}
            </div>
            {account.interestRate && (
              <div style={{ marginTop: 6, fontSize: 13, color: '#16a34a' }}>
                Lãi suất {account.interestRate}%/năm · Đáo hạn {account.maturity}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Divider />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <CardHeader title="Giao dịch gần đây" />
        <Link
          to={`${id}/transactions`}
          style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
        >
          Xem toàn bộ lịch sử →
        </Link>
      </div>

      {loadingTxns ? (
        <PageSpinner label="Đang tải giao dịch..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {txns.slice(0, 5).map((tx) => (
            <Card key={tx.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: tx.type === 'credit' ? '#dcfce7' : '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {tx.type === 'credit' ? '↓' : '↑'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{tx.desc}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {fmtDate(tx.date)}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: tx.type === 'credit' ? '#16a34a' : '#dc2626',
                    flexShrink: 0,
                  }}
                >
                  {tx.type === 'credit' ? '+' : ''}
                  {fmt(tx.amount)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        {/* Event Bus demo: emit app:transferPrefill → mfe-transfer reads it on mount */}
        <button
          onClick={() => {
            eventBus.emit('app:transferPrefill', {
              accountId: account.id,
              accountName: account.name,
              accountNumber: account.number,
              balance: account.balance,
            });
            navigate('/transfer/new');
          }}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '12px 0',
            background: '#1e3a5f',
            color: '#fff',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Chuyển tiền từ đây
        </button>
        <Link
          to={`${id}/transactions`}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '12px 0',
            background: '#f1f5f9',
            color: '#1e3a5f',
            borderRadius: 10,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Lịch sử giao dịch
        </Link>
      </div>
    </div>
  );
}
