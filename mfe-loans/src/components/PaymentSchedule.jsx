import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from 'shared/ui';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const LOAN_META = {
  LOAN001: {
    name: 'Vay tiêu dùng cá nhân',
    principal: 50_000_000,
    interestRate: 12.5,
    termMonths: 36,
    startDate: '2023-03-05',
    paidMonths: 19,
  },
  LOAN002: {
    name: 'Vay mua nhà ở xã hội',
    principal: 800_000_000,
    interestRate: 8.5,
    termMonths: 240,
    startDate: '2023-09-15',
    paidMonths: 14,
  },
};

function generateSchedule(principal, annualRate, termMonths, startDate, paidMonths) {
  const monthlyRate = annualRate / 100 / 12;
  const payment =
    (principal * monthlyRate * (1 + monthlyRate) ** termMonths) /
    ((1 + monthlyRate) ** termMonths - 1);
  let balance = principal;
  const schedule = [];
  const start = new Date(startDate);

  for (let i = 1; i <= Math.min(termMonths, 12); i++) {
    const interest = balance * monthlyRate;
    const principalPart = payment - interest;
    balance -= principalPart;
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      period: i,
      dueDate: dueDate.toISOString().slice(0, 10),
      payment: Math.round(payment),
      principal: Math.round(principalPart),
      interest: Math.round(interest),
      balance: Math.max(0, Math.round(balance)),
      status: i < paidMonths ? 'paid' : i === paidMonths ? 'current' : 'upcoming',
    });
  }
  return schedule;
}

export default function PaymentSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const meta = LOAN_META[id];

  // useMemo phải gọi trước mọi early return (Rules of Hooks).
  // amortization table tốn kém — chỉ tính lại khi metadata khoản vay đổi.
  const schedule = useMemo(
    () =>
      meta
        ? generateSchedule(
            meta.principal,
            meta.interestRate,
            meta.termMonths,
            meta.startDate,
            meta.paidMonths,
          )
        : [],
    [meta],
  );

  if (!meta) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ color: '#64748b' }}>
          Không tìm thấy khoản vay <strong>{id}</strong>
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

  const STATUS_COLOR = { paid: 'green', current: 'blue', upcoming: 'default' };
  const STATUS_LABEL = { paid: 'Đã trả', current: 'Kỳ hiện tại', upcoming: 'Sắp đến' };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div
        style={{
          marginBottom: 6,
          fontSize: 12,
          color: '#94a3b8',
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}
      >
        MFE-LOANS TEAM
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
        ← Chi tiết khoản vay
      </button>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, color: '#0f172a' }}>Lịch trả nợ</h2>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          {meta.name} · {meta.interestRate}%/năm · {meta.termMonths} kỳ
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
          (Hiển thị 12 kỳ đầu tiên)
        </div>
      </div>

      {/* Table header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60px 100px 1fr 1fr 1fr 1fr 80px',
          gap: 8,
          padding: '8px 12px',
          background: '#f8fafc',
          borderRadius: 8,
          marginBottom: 8,
          fontSize: 11,
          fontWeight: 700,
          color: '#64748b',
        }}
      >
        <span>Kỳ</span>
        <span>Ngày đến hạn</span>
        <span style={{ textAlign: 'right' }}>Số tiền trả</span>
        <span style={{ textAlign: 'right' }}>Gốc</span>
        <span style={{ textAlign: 'right' }}>Lãi</span>
        <span style={{ textAlign: 'right' }}>Dư nợ</span>
        <span style={{ textAlign: 'center' }}>Trạng thái</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {schedule.map((row) => (
          <div
            key={row.period}
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 100px 1fr 1fr 1fr 1fr 80px',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 13,
              background:
                row.status === 'current' ? '#eff6ff' : row.status === 'paid' ? '#f0fdf4' : '#fff',
              border: row.status === 'current' ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
            }}
          >
            <span style={{ fontWeight: 600, color: '#64748b' }}>#{row.period}</span>
            <span style={{ color: '#374151', fontSize: 12 }}>{row.dueDate}</span>
            <span style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
              {fmt(row.payment)}
            </span>
            <span style={{ textAlign: 'right', color: '#2563eb' }}>{fmt(row.principal)}</span>
            <span style={{ textAlign: 'right', color: '#dc2626' }}>{fmt(row.interest)}</span>
            <span style={{ textAlign: 'right', color: '#64748b' }}>{fmt(row.balance)}</span>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <StatusBadge label={STATUS_LABEL[row.status]} color={STATUS_COLOR[row.status]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
