import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, StatusBadge } from 'shared/ui';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

const ALL_HISTORY = [
  { id: 'h1',  date: '2024-10-15', name: 'Nguyễn Văn A',  bank: 'Vietcombank', account: '1234 5678', amount: 2_000_000,  status: 'success', note: 'Tiền cafe' },
  { id: 'h2',  date: '2024-10-13', name: 'Trần Thị B',    bank: 'Techcombank', account: '9876 5432', amount: 5_000_000,  status: 'success', note: 'Thanh toán nhà' },
  { id: 'h3',  date: '2024-10-10', name: 'Lê Văn C',      bank: 'BIDV',        account: '4567 8901', amount: 1_500_000,  status: 'pending', note: 'Mua đồ' },
  { id: 'h4',  date: '2024-10-05', name: 'Phạm Thị D',    bank: 'Agribank',    account: '2345 6789', amount: 10_000_000, status: 'success', note: 'Trả nợ' },
  { id: 'h5',  date: '2024-10-01', name: 'Hoàng Văn E',   bank: 'VPBank',      account: '3456 7890', amount: 3_200_000,  status: 'failed',  note: 'Chuyển nhầm' },
  { id: 'h6',  date: '2024-09-28', name: 'Nguyễn Thị F',  bank: 'MB Bank',     account: '5678 9012', amount: 800_000,    status: 'success', note: 'Ăn uống' },
  { id: 'h7',  date: '2024-09-25', name: 'Đặng Văn G',    bank: 'TPBank',      account: '6789 0123', amount: 15_000_000, status: 'success', note: 'Học phí' },
  { id: 'h8',  date: '2024-09-20', name: 'Vũ Thị H',      bank: 'VIB',         account: '7890 1234', amount: 500_000,    status: 'pending', note: 'Phụng dưỡng' },
];

const STATUS_COLOR = { success: 'green', pending: 'yellow', failed: 'red' };
const STATUS_LABEL = { success: 'Thành công', pending: 'Chờ xử lý', failed: 'Thất bại' };
const STATUS_FILTERS = [
  { key: 'all',     label: 'Tất cả' },
  { key: 'success', label: 'Thành công' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'failed',  label: 'Thất bại' },
];

export default function TransferHistory() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = ALL_HISTORY.filter((h) => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (dateFilter && !h.date.startsWith(dateFilter)) return false;
    return true;
  });

  const totalSuccess = ALL_HISTORY.filter((h) => h.status === 'success').reduce((s, h) => s + h.amount, 0);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 6, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
        MFE-TRANSFER TEAM
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20, padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', fontSize: 13, color: '#64748b' }}
      >
        ← Trang chủ chuyển tiền
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: '#0f172a' }}>Lịch sử chuyển tiền</h2>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          Tổng: <strong style={{ color: '#16a34a' }}>{fmt(totalSuccess)}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            style={{
              padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
              background: statusFilter === f.key ? '#1e3a5f' : '#f1f5f9',
              color: statusFilter === f.key ? '#fff' : '#64748b',
              fontWeight: statusFilter === f.key ? 600 : 400,
            }}
          >
            {f.label}
          </button>
        ))}
        <input
          type="month"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, marginLeft: 'auto' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
            Không có giao dịch nào
          </div>
        ) : filtered.map((h) => (
          <Card key={h.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: h.status === 'success' ? '#dcfce7' : h.status === 'pending' ? '#fef9c3' : '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {h.status === 'success' ? '✓' : h.status === 'pending' ? '⏳' : '✕'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{h.name}</span>
                  <StatusBadge label={STATUS_LABEL[h.status]} color={STATUS_COLOR[h.status]} />
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{h.bank} · {h.account}</div>
                {h.note && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{h.note}</div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontWeight: 700, fontSize: 14,
                  color: h.status === 'failed' ? '#94a3b8' : '#dc2626',
                  textDecoration: h.status === 'failed' ? 'line-through' : 'none',
                }}>
                  -{fmt(h.amount)}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{fmtDate(h.date)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
