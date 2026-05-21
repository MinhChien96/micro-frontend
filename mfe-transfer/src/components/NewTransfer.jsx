import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccountStore } from 'shared/accountStore';
import { Card, CardHeader, Divider } from 'shared/ui';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const BANKS = ['Vietcombank', 'Techcombank', 'BIDV', 'Agribank', 'VPBank', 'MB Bank', 'TPBank', 'VIB'];

const STEPS = ['Chọn tài khoản nguồn', 'Nhập thông tin', 'Xác nhận'];

const INITIAL_FORM = {
  sourceId: '',
  recipientName: '',
  recipientBank: '',
  recipientAccount: '',
  amount: '',
  note: '',
};

export default function NewTransfer() {
  const navigate = useNavigate();
  const accounts = useAccountStore((s) => s.accounts);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const source = accounts.find((a) => a.id === form.sourceId);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const canNext = () => {
    if (step === 0) return !!form.sourceId;
    if (step === 1) return form.recipientName && form.recipientBank && form.recipientAccount && Number(form.amount) > 0;
    return true;
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: '#16a34a', marginBottom: 8 }}>Chuyển tiền thành công!</h2>
        <p style={{ color: '#64748b', marginBottom: 8 }}>
          Đã chuyển <strong style={{ color: '#1e3a5f' }}>{fmt(Number(form.amount))}</strong>
        </p>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
          đến {form.recipientName} · {form.recipientBank}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => { setForm(INITIAL_FORM); setStep(0); setSubmitted(false); }}
            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#1e3a5f', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            Chuyển tiền tiếp
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ marginBottom: 6, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
        MFE-TRANSFER TEAM
      </div>

      <button
        onClick={() => step === 0 ? navigate(-1) : setStep((s) => s - 1)}
        style={{ marginBottom: 20, padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', fontSize: 13, color: '#64748b' }}
      >
        ← {step === 0 ? 'Quay lại' : STEPS[step - 1]}
      </button>

      <h2 style={{ margin: '0 0 20px', fontSize: 20, color: '#0f172a' }}>Chuyển tiền</h2>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', border: '2px solid',
                borderColor: i <= step ? '#1e3a5f' : '#e2e8f0',
                background: i < step ? '#1e3a5f' : i === step ? '#fff' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                color: i < step ? '#fff' : i === step ? '#1e3a5f' : '#94a3b8',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: 11, marginTop: 4, color: i <= step ? '#1e3a5f' : '#94a3b8', textAlign: 'center' }}>
                {s}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? '#1e3a5f' : '#e2e8f0', marginTop: 15, maxWidth: 40 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Choose source account */}
      {step === 0 && (
        <div>
          <CardHeader style={{ marginBottom: 12 }}>Chọn tài khoản nguồn</CardHeader>
          {accounts.length === 0 ? (
            <Card>
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 16 }}>
                Không có tài khoản. Vui lòng truy cập mục Tài khoản trước.
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => update('sourceId', acc.id)}
                  style={{
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    border: '2px solid',
                    borderColor: form.sourceId === acc.id ? '#1e3a5f' : '#e2e8f0',
                    background: form.sourceId === acc.id ? '#f0f4ff' : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{acc.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{acc.number}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#1e3a5f' }}>{fmt(acc.balance)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Recipient info */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {source && (
            <Card style={{ marginBottom: 4, background: '#f8fafc' }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Từ tài khoản</div>
              <div style={{ fontWeight: 600 }}>{source.name} · {fmt(source.balance)}</div>
            </Card>
          )}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Ngân hàng thụ hưởng
            </label>
            <select
              value={form.recipientBank}
              onChange={(e) => update('recipientBank', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, background: '#fff' }}
            >
              <option value="">-- Chọn ngân hàng --</option>
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Số tài khoản thụ hưởng
            </label>
            <input
              type="text"
              placeholder="Nhập số tài khoản"
              value={form.recipientAccount}
              onChange={(e) => update('recipientAccount', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Tên người thụ hưởng
            </label>
            <input
              type="text"
              placeholder="Nhập tên người nhận"
              value={form.recipientName}
              onChange={(e) => update('recipientName', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Số tiền (VND)
            </label>
            <input
              type="number"
              placeholder="0"
              min="1000"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
            />
            {Number(form.amount) > 0 && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                = {fmt(Number(form.amount))}
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Nội dung chuyển tiền
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Thanh toán tiền nhà tháng 10"
              value={form.note}
              onChange={(e) => update('note', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && (
        <Card>
          <CardHeader style={{ marginBottom: 16 }}>Xác nhận thông tin</CardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Tài khoản nguồn', source ? `${source.name} · ${source.number}` : ''],
              ['Ngân hàng thụ hưởng', form.recipientBank],
              ['Số tài khoản', form.recipientAccount],
              ['Tên người nhận', form.recipientName],
              ['Nội dung', form.note || '(Không có)'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ fontWeight: 500, color: '#0f172a', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
              </div>
            ))}
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Số tiền</span>
              <span style={{ fontWeight: 800, color: '#dc2626' }}>{fmt(Number(form.amount))}</span>
            </div>
          </div>
        </Card>
      )}

      <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
        {step < 2 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 10, border: 'none',
              background: canNext() ? '#1e3a5f' : '#e2e8f0',
              color: canNext() ? '#fff' : '#94a3b8',
              cursor: canNext() ? 'pointer' : 'default',
              fontWeight: 700, fontSize: 15,
            }}
          >
            Tiếp theo →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 10, border: 'none',
              background: '#16a34a', color: '#fff',
              cursor: 'pointer', fontWeight: 700, fontSize: 15,
            }}
          >
            Xác nhận chuyển tiền
          </button>
        )}
      </div>
    </div>
  );
}
