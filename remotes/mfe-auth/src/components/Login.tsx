import '../tailwind.css';
import { type Role, setToken, setUser } from '@app/common/auth';
import { BRAND } from '@app/common/brand';
import { type FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DEMO_ROLES: { value: Role; label: string; desc: string }[] = [
  { value: 'CUSTOMER', label: 'Khách hàng thường', desc: 'Chuyển trong nước, xem thẻ/vay' },
  {
    value: 'PREMIUM',
    label: 'Khách hàng ưu tiên',
    desc: '+ Chuyển quốc tế, đổi hạn mức, đăng ký vay',
  },
  { value: 'BUSINESS', label: 'Doanh nghiệp', desc: '+ Chuyển hàng loạt, quản lý tài khoản' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/accounts';

  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 900));

    if (customerId === '0021001' && password === '123456') {
      setUser({
        name: 'Nguyễn Văn Demo',
        customerId: '0021001',
        email: 'demo@example.com',
        phone: '0901 234 567',
        branch: 'Chi nhánh TP.HCM',
        role: selectedRole,
      });
      setToken(`mock-jwt-${Date.now()}`);
      window.dispatchEvent(new CustomEvent('auth:changed'));
      navigate(from, { replace: true });
    } else {
      setError('Mã khách hàng hoặc mật khẩu không đúng. Thử: 0021001 / 123456');
    }

    setLoading(false);
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">🏦</div>
        <h2>{BRAND.name}</h2>
        <p>Đăng nhập để quản lý tài khoản của bạn</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label>Mã khách hàng (CIF)</label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value.trim())}
            placeholder="Ví dụ: 0021001"
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu Internet Banking</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="form-group">
          <label>Loại tài khoản (demo)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            {DEMO_ROLES.map(({ value, label, desc }) => (
              <label
                key={value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor: selectedRole === value ? '#1e3a5f' : '#e2e8f0',
                  background: selectedRole === value ? '#f0f4ff' : '#fff',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={selectedRole === value}
                  onChange={() => setSelectedRole(value)}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1e3a5f' }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 12 }}
        >
          <a
            href="#"
            style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              alert('Vui lòng liên hệ 1800-xxxx để khôi phục mật khẩu.');
            }}
          >
            Quên mật khẩu?
          </a>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <span
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              Đang đăng nhập...
            </span>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      <div className="auth-otp-hint">
        <span>🔒</span> Sau khi đăng nhập, hệ thống có thể gửi OTP về số{' '}
        <strong>090x xxx xxx</strong> để xác thực
      </div>

      <div className="auth-hint">
        Thử: Mã KH <code>0021001</code> · Mật khẩu <code>123456</code>
      </div>
    </div>
  );
}
