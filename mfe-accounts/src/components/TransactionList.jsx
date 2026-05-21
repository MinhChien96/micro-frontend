import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccountStore } from 'shared/accountStore';
import { Card, CardHeader, Divider, StatusBadge } from 'shared/ui';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

const ALL_TRANSACTIONS = {
  TK001: [
    { id: 't1',  date: '2024-10-15', desc: 'Chuyển tiền đến Nguyễn Văn A',   amount: -2_000_000, type: 'debit' },
    { id: 't2',  date: '2024-10-14', desc: 'Nhận lương tháng 10',             amount: 18_000_000, type: 'credit' },
    { id: 't3',  date: '2024-10-13', desc: 'Thanh toán điện nước',            amount: -850_000,   type: 'debit' },
    { id: 't4',  date: '2024-10-12', desc: 'Mua sắm online',                  amount: -1_200_000, type: 'debit' },
    { id: 't5',  date: '2024-10-10', desc: 'Hoàn tiền khuyến mãi',            amount: 150_000,    type: 'credit' },
    { id: 't6',  date: '2024-10-08', desc: 'Chuyển tiền đến Trần Thị B',     amount: -5_000_000, type: 'debit' },
    { id: 't7',  date: '2024-10-05', desc: 'Nhận tiền hoàn từ đối tác',       amount: 3_200_000,  type: 'credit' },
    { id: 't8',  date: '2024-10-03', desc: 'Thanh toán bảo hiểm',             amount: -2_500_000, type: 'debit' },
    { id: 't9',  date: '2024-09-30', desc: 'Thanh toán internet/điện thoại',  amount: -450_000,   type: 'debit' },
    { id: 't10', date: '2024-09-28', desc: 'Nhận tiền từ người thân',         amount: 10_000_000, type: 'credit' },
    { id: 't11', date: '2024-09-25', desc: 'Mua xăng xe',                     amount: -300_000,   type: 'debit' },
    { id: 't12', date: '2024-09-20', desc: 'Thanh toán ăn uống',              amount: -680_000,   type: 'debit' },
  ],
  TK002: [
    { id: 't20', date: '2024-10-01', desc: 'Lãi tiết kiệm tháng 10',  amount: 229_167,    type: 'credit' },
    { id: 't21', date: '2024-09-01', desc: 'Lãi tiết kiệm tháng 9',   amount: 229_167,    type: 'credit' },
    { id: 't22', date: '2024-08-15', desc: 'Gửi tiết kiệm 6 tháng',   amount: -50_000_000,type: 'debit' },
    { id: 't23', date: '2024-08-01', desc: 'Lãi tiết kiệm tháng 8',   amount: 229_167,    type: 'credit' },
    { id: 't24', date: '2024-07-01', desc: 'Lãi tiết kiệm tháng 7',   amount: 229_167,    type: 'credit' },
    { id: 't25', date: '2024-06-01', desc: 'Lãi tiết kiệm tháng 6',   amount: 229_167,    type: 'credit' },
  ],
  TK003: [
    { id: 't30', date: '2024-10-01', desc: 'Lãi tiết kiệm tháng 10',  amount: 516_667,    type: 'credit' },
    { id: 't31', date: '2024-09-01', desc: 'Lãi tiết kiệm tháng 9',   amount: 516_667,    type: 'credit' },
    { id: 't32', date: '2024-03-15', desc: 'Gửi tiết kiệm 12 tháng',  amount: -100_000_000,type: 'debit' },
    { id: 't33', date: '2024-02-01', desc: 'Lãi tiết kiệm tháng 2',   amount: 516_667,    type: 'credit' },
    { id: 't34', date: '2024-01-01', desc: 'Lãi tiết kiệm tháng 1',   amount: 516_667,    type: 'credit' },
    { id: 't35', date: '2023-12-01', desc: 'Lãi tiết kiệm tháng 12',  amount: 516_667,    type: 'credit' },
  ],
};

const PAGE_SIZE = 5;
const FILTERS = [
  { key: 'all',    label: 'Tất cả' },
  { key: 'credit', label: 'Tiền vào' },
  { key: 'debit',  label: 'Tiền ra' },
];

export default function TransactionList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getAccount = useAccountStore((s) => s.getAccount);
  const account = getAccount(id);

  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const allTxns = ALL_TRANSACTIONS[id] || [];
  const filtered = filter === 'all' ? allTxns : allTxns.filter((t) => t.type === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalIn  = allTxns.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalOut = allTxns.filter((t) => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 6, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
        MFE-ACCOUNTS TEAM
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20, padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', fontSize: 13, color: '#64748b' }}
      >
        ← Chi tiết tài khoản
      </button>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, color: '#0f172a' }}>Lịch sử giao dịch</h2>
        {account && (
          <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{account.number}</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <Card>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Tổng tiền vào</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#16a34a' }}>+{fmt(totalIn)}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Tổng tiền ra</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#dc2626' }}>-{fmt(totalOut)}</div>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            style={{
              padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
              background: filter === f.key ? '#1e3a5f' : '#f1f5f9',
              color: filter === f.key ? '#fff' : '#64748b',
              fontWeight: filter === f.key ? 600 : 400,
            }}
          >
            {f.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8', alignSelf: 'center' }}>
          {filtered.length} giao dịch
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Không có giao dịch nào</div>
        ) : visible.map((tx) => (
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
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: tx.type === 'credit' ? '#16a34a' : '#dc2626' }}>
                  {tx.type === 'credit' ? '+' : ''}{fmt(tx.amount)}
                </div>
                <StatusBadge
                  label={tx.type === 'credit' ? 'Vào' : 'Ra'}
                  color={tx.type === 'credit' ? 'green' : 'red'}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: page === 1 ? 'default' : 'pointer', background: '#fff', opacity: page === 1 ? 0.4 : 1 }}
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: p === page ? '#1e3a5f' : '#f1f5f9',
                color: p === page ? '#fff' : '#64748b',
                fontWeight: p === page ? 700 : 400,
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: page === totalPages ? 'default' : 'pointer', background: '#fff', opacity: page === totalPages ? 0.4 : 1 }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
