import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from 'shared/authStore';
import { Card, StatusBadge } from 'shared/ui';
import PermissionGate from 'shared/PermissionGate';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const MOCK_LOANS = [
  {
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
    nextDue: '2024-11-05',
    status: 'active',
  },
  {
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
    nextDue: '2024-11-01',
    status: 'active',
  },
];

const LOAN_ICON = { personal: '💼', mortgage: '🏠' };

export default function LoanList() {
  const user = useAuthStore((s) => s.user);
  const totalOutstanding = MOCK_LOANS.reduce((s, l) => s + l.outstanding, 0);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 6, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
        MFE-LOANS TEAM
      </div>

      {user && (
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
          Xin chào, <strong>{user.name}</strong>
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>Khoản vay của tôi</h2>
        <span style={{ fontSize: 14, color: '#64748b' }}>
          Dư nợ: <strong style={{ color: '#dc2626' }}>{fmt(totalOutstanding)}</strong>
        </span>
      </div>

      {/* Apply for new loan — PREMIUM+ only */}
      <PermissionGate
        permission="loans:apply"
        requiredRole="PREMIUM"
        fallback={
          <div style={{
            marginBottom: 20, padding: '12px 18px', borderRadius: 10,
            border: '1px dashed #e2e8f0', background: '#f8fafc',
            display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8',
          }}>
            <span style={{ fontSize: 18 }}>📋</span>
            <span style={{ fontSize: 14 }}>Đăng ký khoản vay mới</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 10 }}>PREMIUM</span>
          </div>
        }
      >
        <button
          onClick={() => alert('Tính năng đang phát triển — vui lòng liên hệ chi nhánh gần nhất.')}
          style={{
            width: '100%', marginBottom: 20, padding: '13px 20px',
            borderRadius: 10, border: '2px dashed #2563eb',
            background: '#eff6ff', color: '#2563eb',
            cursor: 'pointer', fontWeight: 700, fontSize: 15,
          }}
        >
          + Đăng ký khoản vay mới
        </button>
      </PermissionGate>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {MOCK_LOANS.map((loan) => {
          const progress = ((loan.principal - loan.outstanding) / loan.principal) * 100;
          return (
            <Link key={loan.id} to={loan.id} style={{ textDecoration: 'none' }}>
              <Card hoverable>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: loan.type === 'personal' ? '#ede9fe' : '#dcfce7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, flexShrink: 0,
                  }}>
                    {LOAN_ICON[loan.type]}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{loan.name}</span>
                      <StatusBadge
                        label={loan.typeLabel}
                        color={loan.type === 'personal' ? 'purple' : 'green'}
                      />
                    </div>

                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
                      Lãi suất {loan.interestRate}%/năm · {loan.paidMonths}/{loan.termMonths} kỳ
                    </div>

                    <div style={{ marginBottom: 4 }}>
                      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                        <div style={{ height: '100%', borderRadius: 3, background: '#2563eb', width: `${progress}%` }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                      <span>Đã trả: {fmt(loan.principal - loan.outstanding)}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#dc2626' }}>{fmt(loan.outstanding)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Dư nợ còn lại</div>
                    <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 4, fontWeight: 500 }}>
                      Đến hạn {loan.nextDue}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
