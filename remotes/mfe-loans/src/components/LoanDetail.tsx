import { Card, CardHeader, Divider, StatusBadge } from '@app/common/ui';
import { Link, useNavigate, useParams } from 'react-router-dom';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const MOCK_LOANS = {
  LOAN001: {
    id: 'LOAN001',
    type: 'personal',
    typeLabel: 'Vay cá nhân',
    name: 'Vay tiêu dùng cá nhân',
    principal: 50_000_000,
    outstanding: 32_400_000,
    monthlyPayment: 1_850_000,
    interestRate: 12.5,
    termMonths: 36,
    paidMonths: 19,
    disbursedDate: '2023-03-05',
    nextDue: '2024-11-05',
    endDate: '2026-03-05',
    purpose: 'Sửa chữa nhà ở, mua sắm thiết bị gia đình',
    status: 'active',
  },
  LOAN002: {
    id: 'LOAN002',
    type: 'mortgage',
    typeLabel: 'Vay bất động sản',
    name: 'Vay mua nhà ở xã hội',
    principal: 800_000_000,
    outstanding: 687_500_000,
    monthlyPayment: 8_200_000,
    interestRate: 8.5,
    termMonths: 240,
    paidMonths: 14,
    disbursedDate: '2023-09-15',
    nextDue: '2024-11-01',
    endDate: '2043-09-15',
    purpose: 'Mua căn hộ chung cư tại TP.HCM',
    status: 'active',
  },
};

export default function LoanDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const loan = MOCK_LOANS[id as keyof typeof MOCK_LOANS];

  if (!loan) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
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

  const progress = ((loan.principal - loan.outstanding) / loan.principal) * 100;
  const remainingMonths = loan.termMonths - loan.paidMonths;

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
        ← Danh sách khoản vay
      </button>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ fontSize: 40, flexShrink: 0 }}>
            {loan.type === 'personal' ? '💼' : '🏠'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>{loan.name}</span>
              <StatusBadge
                label={loan.typeLabel}
                color={loan.type === 'personal' ? 'purple' : 'green'}
              />
              <StatusBadge label="Đang vay" color="blue" />
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>{loan.purpose}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#dc2626', marginBottom: 4 }}>
              {fmt(loan.outstanding)}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Dư nợ còn lại</div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          ['Vốn gốc ban đầu', fmt(loan.principal), '#0f172a'],
          ['Lãi suất', `${loan.interestRate}%/năm`, '#f59e0b'],
          ['Trả hàng tháng', fmt(loan.monthlyPayment), '#2563eb'],
          ['Đến hạn kỳ tới', loan.nextDue, '#dc2626'],
        ].map(([label, value, color]) => (
          <Card key={label}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: 16, color }}>{value}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            color: '#64748b',
            marginBottom: 8,
          }}
        >
          <span>Tiến độ trả nợ</span>
          <span>
            {loan.paidMonths}/{loan.termMonths} kỳ · còn {remainingMonths} kỳ
          </span>
        </div>
        <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, marginBottom: 6 }}>
          <div
            style={{
              height: '100%',
              borderRadius: 5,
              background: 'linear-gradient(90deg, #16a34a, #2563eb)',
              width: `${progress}%`,
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#94a3b8',
          }}
        >
          <span>
            Đã trả: {fmt(loan.principal - loan.outstanding)} ({progress.toFixed(1)}%)
          </span>
          <span>Kết thúc: {loan.endDate}</span>
        </div>
      </Card>

      <Divider />

      <CardHeader style={{ marginBottom: 14 }}>Thông tin hợp đồng</CardHeader>
      <Card style={{ marginBottom: 24 }}>
        {[
          ['Ngày giải ngân', loan.disbursedDate],
          ['Kỳ hạn vay', `${loan.termMonths} tháng (${(loan.termMonths / 12).toFixed(0)} năm)`],
          ['Số hợp đồng', loan.id],
          ['Chi nhánh phụ trách', 'Chi nhánh TP.HCM'],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #f1f5f9',
              fontSize: 14,
            }}
          >
            <span style={{ color: '#64748b' }}>{label}</span>
            <span style={{ fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </Card>

      <div style={{ display: 'flex', gap: 10 }}>
        <Link
          to={`${loan.id}/schedule`}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '12px 0',
            background: '#1e3a5f',
            color: '#fff',
            borderRadius: 10,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Xem lịch trả nợ
        </Link>
        <button
          style={{
            flex: 1,
            padding: '12px 0',
            background: '#f1f5f9',
            color: '#1e3a5f',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
          }}
          onClick={() => alert('Tính năng đang phát triển')}
        >
          Trả trước hạn
        </button>
      </div>
    </div>
  );
}
