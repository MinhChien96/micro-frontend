import React, { useState } from 'react';
import { useAuthStore } from 'shared/authStore';
import '../styles.css';

export default function Login() {
  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 900));

    if (customerId === '0021001' && password === '123456') {
      login({
        name: 'Nguyễn Văn Demo',
        customerId: '0021001',
        email: 'demo@vietbank.vn',
        phone: '0901 234 567',
        branch: 'Chi nhánh TP.HCM',
        role: 'customer',
      });
    } else {
      setError('Mã khách hàng hoặc mật khẩu không đúng. Thử: 0021001 / 123456');
    }

    setLoading(false);
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">🏦</div>
        <h2>VietBank Online</h2>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 12 }}>
          <a href="#" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}
            onClick={(e) => { e.preventDefault(); alert('Vui lòng liên hệ 1800-xxxx để khôi phục mật khẩu.'); }}>
            Quên mật khẩu?
          </a>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Đang đăng nhập...
            </span>
          ) : 'Đăng nhập'}
        </button>
      </form>

      <div className="auth-otp-hint">
        <span>🔒</span> Sau khi đăng nhập, hệ thống có thể gửi OTP về số <strong>090x xxx xxx</strong> để xác thực
      </div>

      <div className="auth-hint">
        Thử: Mã KH <code>0021001</code> · Mật khẩu <code>123456</code>
      </div>
    </div>
  );
}
