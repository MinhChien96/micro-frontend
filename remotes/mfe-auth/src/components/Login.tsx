import '../tailwind.css';
import type { Role, User } from '@app/common/auth';
import { BRAND } from '@app/common/brand';
import { ENDPOINTS } from '@app/common/constants/endpoints';
import { useAppTranslation } from '@app/common/i18n';
import { apiPost } from '@app/common/services';
import { batchUpdate, globalStore } from '@app/common/stores';
import { type FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authResources } from '../i18n/resources';

// Login là STATE MACHINE theo nextStep server trả về (bank pattern):
// CREDENTIALS → (OTP) → HOME. Thêm bước mới (đổi mật khẩu lần đầu...) =
// thêm case nextStep, không đổi khung.
interface LoginStepResponse {
  nextStep: 'HOME' | 'OTP';
  // OTP step
  otpSession?: string;
  otpHint?: string;
  // HOME step
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

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
  const { t } = useAppTranslation('auth', authResources);
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/accounts';

  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP step state
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [otpSession, setOtpSession] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [otp, setOtp] = useState('');

  // Xử lý chung cho mọi response của state machine login
  const applyStep = (res: LoginStepResponse) => {
    if (res.nextStep === 'OTP' && res.otpSession) {
      setOtpSession(res.otpSession);
      setOtpHint(res.otpHint ?? '');
      setOtp('');
      setStep('OTP');
      return;
    }
    if (res.nextStep === 'HOME' && res.accessToken && res.user) {
      // Lưu phiên vào global store singleton → shell + mọi remote thấy ngay
      batchUpdate({
        authToken: res.accessToken,
        refreshToken: res.refreshToken ?? null,
        user: res.user,
      });
      navigate(from, { replace: true });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Login qua endpoint [public] — apiClient không chờ/gắn token
      const { deviceId } = globalStore.getState();
      const res = await apiPost<LoginStepResponse>(ENDPOINTS.login, {
        username: customerId,
        password,
        role: selectedRole,
        deviceId,
      });
      applyStep(res);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(`${message}. Thử: 0021001 / 123456`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiPost<LoginStepResponse>(ENDPOINTS.verifyOtp, { otpSession, otp });
      applyStep(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'OTP') {
    return (
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🔐</div>
          <h2>{t('auth.otpTitle')}</h2>
          <p>{t('auth.otpSubtitle')}</p>
        </div>

        <form onSubmit={handleVerifyOtp} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="otp-input">{t('auth.otpLabel')}</label>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              autoComplete="one-time-code"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
            {loading ? t('auth.otpSubmitting') : t('auth.otpSubmit')}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('CREDENTIALS');
              setError('');
            }}
            style={{
              marginTop: 8,
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {t('auth.otpBack')}
          </button>
        </form>

        {otpHint && (
          <div className="auth-hint">{otpHint} (demo — hệ thống thật gửi SMS/Smart OTP)</div>
        )}
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">🏦</div>
        <h2>{BRAND.name}</h2>
        <p>{t('auth.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label>{t('auth.cif')}</label>
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
          <label>{t('auth.password')}</label>
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
              {t('auth.submitting')}
            </span>
          ) : (
            t('auth.submit')
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
