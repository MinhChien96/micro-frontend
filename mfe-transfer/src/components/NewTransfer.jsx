import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, Divider, PageSpinner } from 'shared/ui';
import PermissionGate from 'shared/PermissionGate';
import { fetchAccounts } from '../api/accounts';
import { submitTransfer } from '../api/transfer';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const BANKS = ['Vietcombank', 'Techcombank', 'BIDV', 'Agribank', 'VPBank', 'MB Bank', 'TPBank', 'VIB'];
const TRANSFER_TYPES = [
  { key: 'domestic',      label: 'Trong nước',   permission: null },
  { key: 'international', label: 'Quốc tế',       permission: 'transfer:international' },
];
const STEPS       = ['Chọn tài khoản nguồn', 'Nhập thông tin', 'Xác nhận'];
const INITIAL_FORM = { sourceId: '', recipientName: '', recipientBank: '', recipientAccount: '', amount: '', note: '' };

export default function NewTransfer() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({ queryKey: ['accounts'], queryFn: fetchAccounts });

  const [transferType, setTransferType] = useState('domestic');
  const [step,         setStep]         = useState(0);
  const [form,         setForm]         = useState(INITIAL_FORM);

  const source = accounts.find((a) => a.id === form.sourceId);
  const update = useCallback((field, value) => setForm((f) => ({ ...f, [field]: value })), []);

  // ── useMutation với optimistic update ──
  const mutation = useMutation({
    mutationFn: submitTransfer,

    // 1. onMutate: chạy TRƯỚC khi API call — thêm item vào cache ngay lập tức
    onMutate: async (newForm) => {
      // Hủy refetch đang chạy để tránh overwrite optimistic data
      await queryClient.cancelQueries({ queryKey: ['transfer-history'] });

      // Lưu state cũ để rollback nếu lỗi
      const previousHistory = queryClient.getQueryData(['transfer-history']);

      // Thêm optimistic item vào đầu cache
      const optimisticItem = {
        id:           `optimistic-${Date.now()}`,
        date:         new Date().toISOString().slice(0, 10),
        name:         newForm.recipientName,
        bank:         newForm.recipientBank,
        account:      newForm.recipientAccount,
        amount:       Number(newForm.amount),
        status:       'pending',
        note:         newForm.note || '',
        _optimistic:  true, // flag để TransferHistory render trạng thái "đang xử lý"
      };

      queryClient.setQueryData(['transfer-history'], (old = []) => [optimisticItem, ...old]);

      return { previousHistory }; // context truyền vào onError
    },

    // 2. onError: rollback về state cũ nếu API thất bại
    onError: (_err, _form, context) => {
      queryClient.setQueryData(['transfer-history'], context.previousHistory);
    },

    // 3. onSettled: luôn invalidate sau khi xong (thành công hoặc lỗi)
    // → TransferHistory sẽ fetch lại data thật từ server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-history'] });
    },
  });

  const canNext = () => {
    if (step === 0) return !!form.sourceId;
    if (step === 1) return form.recipientName && form.recipientBank && form.recipientAccount && Number(form.amount) > 0;
    return true;
  };

  const handleSubmit = () => {
    mutation.mutate(form, {
      onSuccess: () => {
        setForm(INITIAL_FORM);
        setStep(0);
      },
    });
  };

  if (isLoading) return <PageSpinner label="Đang tải tài khoản..." />;

  // Trạng thái sau khi submit thành công
  if (mutation.isSuccess) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: '#16a34a', marginBottom: 8 }}>Chuyển tiền thành công!</h2>
        <p style={{ color: '#64748b', marginBottom: 8 }}>
          Đã chuyển <strong style={{ color: '#1e3a5f' }}>{fmt(Number(mutation.variables?.amount))}</strong>
        </p>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
          đến {mutation.variables?.recipientName} · {mutation.variables?.recipientBank}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => mutation.reset()}
            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#1e3a5f', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            Chuyển tiền tiếp
          </button>
          <button
            onClick={() => navigate('/transfer/history')}
            style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
          >
            Xem lịch sử
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ marginBottom: 6, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>MFE-TRANSFER TEAM</div>

      <button
        onClick={() => step === 0 ? navigate(-1) : setStep((s) => s - 1)}
        style={{ marginBottom: 20, padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', fontSize: 13, color: '#64748b' }}
      >
        ← {step === 0 ? 'Quay lại' : STEPS[step - 1]}
      </button>

      <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#0f172a' }}>Chuyển tiền</h2>

      {/* Transfer type toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TRANSFER_TYPES.map(({ key, label, permission }) => {
          const btn = (
            <button
              onClick={() => { setTransferType(key); setStep(0); setForm(INITIAL_FORM); }}
              style={{ padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, background: transferType === key ? '#1e3a5f' : '#f1f5f9', color: transferType === key ? '#fff' : '#64748b', fontWeight: transferType === key ? 700 : 400 }}
            >
              {label}
            </button>
          );
          if (!permission) return <span key={key}>{btn}</span>;
          return (
            <PermissionGate key={key} permission={permission} requiredRole="PREMIUM"
              fallback={<button disabled title="Yêu cầu tài khoản PREMIUM" style={{ padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'not-allowed', fontSize: 13, background: '#f1f5f9', color: '#cbd5e1', opacity: 0.7 }}>{label} 🔒</button>}
            >
              {btn}
            </PermissionGate>
          );
        })}
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid', borderColor: i <= step ? '#1e3a5f' : '#e2e8f0', background: i < step ? '#1e3a5f' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: i < step ? '#fff' : i === step ? '#1e3a5f' : '#94a3b8' }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: 11, marginTop: 4, color: i <= step ? '#1e3a5f' : '#94a3b8', textAlign: 'center' }}>{s}</div>
            </div>
            {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? '#1e3a5f' : '#e2e8f0', marginTop: 15, maxWidth: 40 }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0 */}
      {step === 0 && (
        <div>
          <CardHeader style={{ marginBottom: 12 }}>Chọn tài khoản nguồn</CardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {accounts.map((acc) => (
              <div key={acc.id} onClick={() => update('sourceId', acc.id)} style={{ padding: '14px 16px', borderRadius: 12, cursor: 'pointer', border: '2px solid', borderColor: form.sourceId === acc.id ? '#1e3a5f' : '#e2e8f0', background: form.sourceId === acc.id ? '#f0f4ff' : '#fff' }}>
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
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {source && <Card style={{ background: '#f8fafc' }}><div style={{ fontSize: 12, color: '#94a3b8' }}>Từ tài khoản</div><div style={{ fontWeight: 600 }}>{source.name} · {fmt(source.balance)}</div></Card>}
          {[
            { label: 'Ngân hàng thụ hưởng',    field: 'recipientBank',    type: 'select', options: BANKS },
            { label: 'Số tài khoản thụ hưởng', field: 'recipientAccount', type: 'text',   placeholder: 'Nhập số tài khoản' },
            { label: 'Tên người thụ hưởng',    field: 'recipientName',    type: 'text',   placeholder: 'Nhập tên người nhận' },
          ].map(({ label, field, type, options, placeholder }) => (
            <div key={field}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
              {type === 'select'
                ? <select value={form[field]} onChange={(e) => update(field, e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, background: '#fff' }}><option value="">-- Chọn ngân hàng --</option>{options.map((o) => <option key={o}>{o}</option>)}</select>
                : <input type="text" placeholder={placeholder} value={form[field]} onChange={(e) => update(field, e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
              }
            </div>
          ))}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Số tiền (VND)</label>
            <input type="number" placeholder="0" min="1000" value={form.amount} onChange={(e) => update('amount', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
            {Number(form.amount) > 0 && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>= {fmt(Number(form.amount))}</div>}
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Nội dung chuyển tiền</label>
            <input type="text" placeholder="Ví dụ: Thanh toán tiền nhà tháng 10" value={form.note} onChange={(e) => update('note', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        </div>
      )}

      {/* Step 2 — Xác nhận */}
      {step === 2 && (
        <Card>
          <CardHeader style={{ marginBottom: 16 }}>Xác nhận thông tin</CardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Tài khoản nguồn',    source ? `${source.name} · ${source.number}` : ''],
              ['Ngân hàng thụ hưởng', form.recipientBank],
              ['Số tài khoản',       form.recipientAccount],
              ['Tên người nhận',     form.recipientName],
              ['Nội dung',           form.note || '(Không có)'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ fontWeight: 500, color: '#0f172a', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
              </div>
            ))}
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
              <span style={{ fontWeight: 700 }}>Số tiền</span>
              <span style={{ fontWeight: 800, color: '#dc2626' }}>{fmt(Number(form.amount))}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Error từ mutation */}
      {mutation.isError && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
          ⚠️ {mutation.error?.message || 'Lỗi không xác định'} — Giao dịch đã được hủy.
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        {step < 2 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            style={{ width: '100%', padding: '14px 0', borderRadius: 10, border: 'none', background: canNext() ? '#1e3a5f' : '#e2e8f0', color: canNext() ? '#fff' : '#94a3b8', cursor: canNext() ? 'pointer' : 'default', fontWeight: 700, fontSize: 15 }}
          >
            Tiếp theo →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            style={{ width: '100%', padding: '14px 0', borderRadius: 10, border: 'none', background: mutation.isPending ? '#86efac' : '#16a34a', color: '#fff', cursor: mutation.isPending ? 'default' : 'pointer', fontWeight: 700, fontSize: 15 }}
          >
            {mutation.isPending ? '⏳ Đang xử lý...' : 'Xác nhận chuyển tiền'}
          </button>
        )}
      </div>
    </div>
  );
}
