import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, Divider } from 'shared/ui';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const MOCK_CARDS = {
  CARD001: {
    id: 'CARD001', type: 'debit', typeLabel: 'Thẻ ghi nợ', brand: 'VISA',
    name: 'Thẻ thanh toán nội địa', number: '**** **** **** 4521',
    fullNumber: '4521 **** **** 4521', expiry: '12/27', cvv: '***',
    balance: 15_420_000, limit: null, status: 'active',
    color: ['#1e3a5f', '#2563eb'], dailyLimit: 20_000_000, onlineLimit: 10_000_000,
  },
  CARD002: {
    id: 'CARD002', type: 'credit', typeLabel: 'Thẻ tín dụng', brand: 'Mastercard',
    name: 'Thẻ tín dụng vàng', number: '**** **** **** 8832',
    fullNumber: '8832 **** **** 8832', expiry: '08/26', cvv: '***',
    balance: 12_500_000, limit: 50_000_000, status: 'active',
    color: ['#b45309', '#d97706'], dailyLimit: 30_000_000, onlineLimit: 15_000_000,
  },
  CARD003: {
    id: 'CARD003', type: 'credit', typeLabel: 'Thẻ tín dụng', brand: 'VISA',
    name: 'Thẻ tín dụng bạch kim', number: '**** **** **** 1199',
    fullNumber: '1199 **** **** 1199', expiry: '03/25', cvv: '***',
    balance: 5_000_000, limit: 100_000_000, status: 'locked',
    color: ['#374151', '#6b7280'], dailyLimit: 50_000_000, onlineLimit: 20_000_000,
  },
};

export default function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const card = MOCK_CARDS[id];

  const [isLocked, setIsLocked] = useState(card?.status === 'locked');
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinChanged, setPinChanged] = useState(false);
  const [limitModal, setLimitModal] = useState(false);

  if (!card) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <p style={{ color: '#64748b' }}>Không tìm thấy thẻ <strong>{id}</strong></p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff' }}>
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ marginBottom: 6, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
        MFE-CARDS TEAM
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20, padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', fontSize: 13, color: '#64748b' }}
      >
        ← Danh sách thẻ
      </button>

      {/* Card visual */}
      <div style={{
        borderRadius: 16, padding: '20px 24px', marginBottom: 24,
        background: `linear-gradient(135deg, ${card.color[0]}, ${card.color[1]})`,
        color: '#fff', position: 'relative', overflow: 'hidden',
        opacity: isLocked ? 0.75 : 1,
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{card.typeLabel}</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{card.name}</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{card.brand}</div>
            {isLocked && <div style={{ fontSize: 11, background: 'rgba(255,0,0,0.3)', padding: '2px 8px', borderRadius: 10, marginTop: 4, textAlign: 'center' }}>🔒 Đã khóa</div>}
          </div>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 2, marginBottom: 16 }}>{card.number}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>HẾT HẠN</div>
            <div style={{ fontWeight: 600 }}>{card.expiry}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{card.type === 'credit' ? 'DƯ NỢ' : 'SỐ DƯ'}</div>
            <div style={{ fontWeight: 700 }}>{fmt(card.balance)}</div>
          </div>
        </div>
      </div>

      {card.type === 'credit' && card.limit && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 8 }}>
            <span>Hạn mức tín dụng</span>
            <span style={{ fontWeight: 700, color: '#1e3a5f' }}>{fmt(card.limit)}</span>
          </div>
          <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4 }}>
            <div style={{ height: '100%', borderRadius: 4, background: card.balance / card.limit > 0.8 ? '#dc2626' : '#2563eb', width: `${(card.balance / card.limit) * 100}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
            <span>Đã sử dụng: {fmt(card.balance)}</span>
            <span>Còn lại: {fmt(card.limit - card.balance)}</span>
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 20 }}>
        <CardHeader style={{ marginBottom: 12 }}>Thông tin hạn mức</CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Hạn mức giao dịch ngày', fmt(card.dailyLimit)],
            ['Hạn mức thanh toán online', fmt(card.onlineLimit)],
            ['Khu vực sử dụng', 'Trong nước'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#64748b' }}>{label}</span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      </Card>

      <Divider />

      <CardHeader style={{ marginBottom: 14 }}>Quản lý thẻ</CardHeader>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => setIsLocked((v) => !v)}
          style={{
            padding: '14px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: isLocked ? '#dcfce7' : '#fee2e2',
            color: isLocked ? '#16a34a' : '#dc2626',
            fontWeight: 600, fontSize: 15, textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>{isLocked ? '🔓' : '🔒'}</span>
          {isLocked ? 'Mở khóa thẻ' : 'Khóa thẻ tạm thời'}
        </button>

        <button
          onClick={() => { setShowPinModal(true); setNewPin(''); setPinChanged(false); }}
          style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', fontWeight: 600, fontSize: 15, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span style={{ fontSize: 20 }}>🔑</span> Đổi mã PIN
        </button>

        <button
          onClick={() => setLimitModal(true)}
          style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', fontWeight: 600, fontSize: 15, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span style={{ fontSize: 20 }}>💳</span> Thay đổi hạn mức
        </button>
      </div>

      {/* PIN modal */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 320, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {pinChanged ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>Đổi PIN thành công!</div>
                <button onClick={() => setShowPinModal(false)} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1e3a5f', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Đổi mã PIN</div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Nhập mã PIN mới (4-6 chữ số)</div>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 20, textAlign: 'center', letterSpacing: 8, boxSizing: 'border-box', marginBottom: 16 }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowPinModal(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Hủy</button>
                  <button
                    onClick={() => { if (newPin.length >= 4) setPinChanged(true); }}
                    disabled={newPin.length < 4}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: newPin.length >= 4 ? '#1e3a5f' : '#e2e8f0', color: newPin.length >= 4 ? '#fff' : '#94a3b8', cursor: newPin.length >= 4 ? 'pointer' : 'default', fontWeight: 600 }}
                  >
                    Xác nhận
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Limit modal */}
      {limitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 340 }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Thay đổi hạn mức</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Tính năng này yêu cầu xác thực OTP. Vui lòng liên hệ ngân hàng hoặc truy cập chi nhánh gần nhất.
            </div>
            <button onClick={() => setLimitModal(false)} style={{ width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', background: '#1e3a5f', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
