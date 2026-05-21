import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from 'shared/authStore';
import { Card, CardHeader, StatusBadge } from 'shared/ui';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const MOCK_CARDS = [
  {
    id: 'CARD001',
    type: 'debit',
    typeLabel: 'Thẻ ghi nợ',
    brand: 'VISA',
    name: 'Thẻ thanh toán nội địa',
    number: '**** **** **** 4521',
    expiry: '12/27',
    balance: 15_420_000,
    limit: null,
    status: 'active',
    color: ['#1e3a5f', '#2563eb'],
  },
  {
    id: 'CARD002',
    type: 'credit',
    typeLabel: 'Thẻ tín dụng',
    brand: 'Mastercard',
    name: 'Thẻ tín dụng vàng',
    number: '**** **** **** 8832',
    expiry: '08/26',
    balance: 12_500_000,
    limit: 50_000_000,
    status: 'active',
    color: ['#b45309', '#d97706'],
  },
  {
    id: 'CARD003',
    type: 'credit',
    typeLabel: 'Thẻ tín dụng',
    brand: 'VISA',
    name: 'Thẻ tín dụng bạch kim',
    number: '**** **** **** 1199',
    expiry: '03/25',
    balance: 5_000_000,
    limit: 100_000_000,
    status: 'locked',
    color: ['#374151', '#6b7280'],
  },
];

export default function CardList() {
  const user = useAuthStore((s) => s.user);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 6, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
        MFE-CARDS TEAM
      </div>

      {user && (
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
          Xin chào, <strong>{user.name}</strong>
        </p>
      )}

      <h2 style={{ margin: '0 0 24px', fontSize: 22, color: '#0f172a' }}>Thẻ của tôi</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MOCK_CARDS.map((card) => (
          <Link key={card.id} to={card.id} style={{ textDecoration: 'none' }}>
            {/* Physical card visual */}
            <div style={{
              borderRadius: 16, padding: '20px 24px',
              background: `linear-gradient(135deg, ${card.color[0]}, ${card.color[1]})`,
              color: '#fff', position: 'relative', overflow: 'hidden',
              opacity: card.status === 'locked' ? 0.7 : 1,
            }}>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ position: 'absolute', right: 20, bottom: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>{card.typeLabel}</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{card.name}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{card.brand}</span>
                  {card.status === 'locked' && (
                    <span style={{ fontSize: 11, background: 'rgba(255,0,0,0.3)', padding: '2px 8px', borderRadius: 10 }}>🔒 Đã khóa</span>
                  )}
                </div>
              </div>

              <div style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: 2, marginBottom: 16 }}>
                {card.number}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Ngày hết hạn</div>
                  <div style={{ fontWeight: 600 }}>{card.expiry}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {card.type === 'credit' ? (
                    <>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>Dư nợ / Hạn mức</div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{fmt(card.balance)} / {fmt(card.limit)}</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>Số dư khả dụng</div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{fmt(card.balance)}</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {card.type === 'credit' && card.limit && (
              <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: '8px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                  <span>Đã sử dụng</span>
                  <span>{((card.balance / card.limit) * 100).toFixed(0)}%</span>
                </div>
                <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2 }}>
                  <div style={{ height: '100%', borderRadius: 2, background: card.balance / card.limit > 0.8 ? '#dc2626' : '#2563eb', width: `${(card.balance / card.limit) * 100}%` }} />
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
