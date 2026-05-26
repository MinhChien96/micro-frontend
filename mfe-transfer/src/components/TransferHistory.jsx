import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, StatusBadge, PageSpinner } from 'shared/ui';
import { fetchTransferHistory } from '../api/transfer';

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

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

  // Đọc từ query cache — optimistic item từ NewTransfer sẽ xuất hiện ngay tại đây
  const { data: history = [], isLoading } = useQuery({
    queryKey:  ['transfer-history'],
    queryFn:   fetchTransferHistory,
    staleTime: 30_000,
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter]     = useState('');
  const debouncedDate = useDebounce(dateFilter, 300);

  const handleStatus = useCallback((key) => setStatusFilter(key), []);

  const filtered = useMemo(() => history.filter((h) => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (debouncedDate && !h.date.startsWith(debouncedDate)) return false;
    return true;
  }), [history, statusFilter, debouncedDate]);

  const totalSuccess = useMemo(
    () => history.filter((h) => h.status === 'success').reduce((s, h) => s + h.amount, 0),
    [history],
  );

  if (isLoading) return <PageSpinner label="Đang tải lịch sử..." />;

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
            onClick={() => handleStatus(f.key)}
            style={{
              padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
              background: statusFilter === f.key ? '#1e3a5f' : '#f1f5f9',
              color:      statusFilter === f.key ? '#fff' : '#64748b',
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
          <Card key={h.id} style={{ opacity: h._optimistic ? 0.6 : 1, transition: 'opacity 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: h.status === 'success' ? '#dcfce7' : h.status === 'pending' ? '#fef9c3' : '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {h._optimistic ? '⏳' : h.status === 'success' ? '✓' : h.status === 'pending' ? '⏳' : '✕'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{h.name}</span>
                  {h._optimistic
                    ? <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 8, background: '#fef9c3', color: '#92400e' }}>Đang xử lý...</span>
                    : <StatusBadge label={STATUS_LABEL[h.status]} color={STATUS_COLOR[h.status]} />
                  }
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{h.bank} · {h.account}</div>
                {h.note && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{h.note}</div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#dc2626' }}>
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
