import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAccountStore } from 'shared/accountStore';
import { Card, CardHeader, Divider, StatusBadge } from 'shared/ui';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

const MOCK_TRANSACTIONS = {
  TK001: [
    { id: 't1', date: '2024-10-15', desc: 'Chuyển tiền đến Nguyễn Văn A', amount: -2_000_000, type: 'debit' },
    { id: 't2', date: '2024-10-14', desc: 'Nhận lương tháng 10', amount: 18_000_000, type: 'credit' },
    { id: 't3', date: '2024-10-13', desc: 'Thanh toán điện nước', amount: -850_000, type: 'debit' },
    { id: 't4', date: '2024-10-12', desc: 'Mua sắm online', amount: -1_200_000, type: 'debit' },
    { id: 't5', date: '2024-10-10', desc: 'Hoàn tiền khuyến mãi', amount: 150_000, type: 'credit' },
  ],
  TK002: [
    { id: 't6', date: '2024-10-01', desc: 'Lãi tiết kiệm tháng 10', amount: 229_167, type: 'credit' },
    { id: 't7', date: '2024-09-01', desc: 'Lãi tiết kiệm tháng 9', amount: 229_167, type: 'credit' },
    { id: 't8', date: '2024-08-15', desc: 'Gửi tiết kiệm 6 tháng', amount: -50_000_000, type: 'debit' },
    { id: 't9', date: '2024-08-01', desc: 'Lãi tiết kiệm tháng 8', amount: 229_167, type: 'credit' },
    { id: 't10', date: '2024-07-01', desc: 'Lãi tiết kiệm tháng 7', amount: 229_167, type: 'credit' },
  ],
  TK003: [
    { id: 't11', date: '2024-10-01', desc: 'Lãi tiết kiệm tháng 10', amount: 516_667, type: 'credit' },
    { id: 't12', date: '2024-09-01', desc: 'Lãi tiết kiệm tháng 9', amount: 516_667, type: 'credit' },
    { id: 't13', date: '2024-03-15', desc: 'Gửi tiết kiệm 12 tháng', amount: -100_000_000, type: 'debit' },
    { id: 't14', date: '2024-02-01', desc: 'Lãi tiết kiệm tháng 2', amount: 516_667, type: 'credit' },
    { id: 't15', date: '2024-01-01', desc: 'Lãi tiết kiệm tháng 1', amount: 516_667, type: 'credit' },
  ],
};

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getAccount = useAccountStore((s) => s.getAccount);
  const account = getAccount(id);
  const txns = MOCK_TRANSACTIONS[id] || [];

  if (!account) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <p style={{ color: '#64748b' }}>Không tìm thấy tài khoản <strong>{id}</strong></p>
        <button
          onClick={() => navigate(-1)}
          style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff' }}
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 6, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
        MFE-ACCOUNTS TEAM
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20, padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', fontSize: 13, color: '#64748b' }}
      >
        ← Danh sách tài khoản
      </button>

      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: account.type === 'checking' ? '#dbeafe' : '#fef9c3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0,
          }}>
            {account.type === 'checking' ? '🏦' : '💰'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>{account.name}</span>
              <StatusBadge
                label={account.typeLabel}
                color={account.type === 'checking' ? 'blue' : 'yellow'}
              />
              <StatusBadge label="Hoạt động" color="green" />
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace', marginBottom: 8 }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <CardHeader>Giao dịch gần đây</CardHeader>
        <Link
          to={`${id}/transactions`}
          style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
        >
          Xem toàn bộ lịch sử →
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {txns.map((tx) => (
          <Card key={tx.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: tx.type === 'credit' ? '#dcfce7' : '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                {tx.type === 'credit' ? '↓' : '↑'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{tx.desc}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{fmtDate(tx.date)}</div>
              </div>
              <div style={{
                fontWeight: 700, fontSize: 15,
                color: tx.type === 'credit' ? '#16a34a' : '#dc2626',
                flexShrink: 0,
              }}>
                {tx.type === 'credit' ? '+' : ''}{fmt(tx.amount)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <Link
          to="/transfer/new"
          style={{
            flex: 1, textAlign: 'center', padding: '12px 0',
            background: '#1e3a5f', color: '#fff', borderRadius: 10,
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
          }}
        >
          Chuyển tiền
        </Link>
        <Link
          to={`${id}/transactions`}
          style={{
            flex: 1, textAlign: 'center', padding: '12px 0',
            background: '#f1f5f9', color: '#1e3a5f', borderRadius: 10,
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
          }}
        >
          Lịch sử giao dịch
        </Link>
      </div>
    </div>
  );
}
