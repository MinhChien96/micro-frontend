import { Card, CardHeader, Divider } from '@app/common/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SecuritySettings() {
  const navigate = useNavigate();
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlert, setLoginAlert] = useState(true);
  const [transactionAlert, setTransactionAlert] = useState(true);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwChanged, setPwChanged] = useState(false);

  const handleChangePw = () => {
    if (pwForm.newPw && pwForm.newPw === pwForm.confirm && pwForm.current) {
      setPwChanged(true);
    }
  };

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div
        style={{
          marginBottom: 6,
          fontSize: 12,
          color: '#94a3b8',
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}
      >
        MFE-PROFILE TEAM
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
        ← Hồ sơ cá nhân
      </button>

      <h2 style={{ margin: '0 0 24px', fontSize: 20, color: '#0f172a' }}>Cài đặt bảo mật</h2>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader style={{ marginBottom: 16 }}>Xác thực hai lớp (2FA)</CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, color: '#0f172a', marginBottom: 2 }}>
              Xác thực qua SMS/OTP
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Yêu cầu mã OTP khi đăng nhập từ thiết bị mới
            </div>
          </div>
          <div
            onClick={() => setTwoFactor((v) => !v)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              cursor: 'pointer',
              flexShrink: 0,
              background: twoFactor ? '#16a34a' : '#d1d5db',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: twoFactor ? 25 : 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader style={{ marginBottom: 16 }}>Thông báo bảo mật</CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            {
              label: 'Cảnh báo đăng nhập lạ',
              desc: 'Nhận SMS khi có đăng nhập từ thiết bị/địa điểm mới',
              state: loginAlert,
              toggle: setLoginAlert,
            },
            {
              label: 'Thông báo giao dịch',
              desc: 'Nhận SMS cho mỗi giao dịch thực hiện',
              state: transactionAlert,
              toggle: setTransactionAlert,
            },
          ].map(({ label, desc, state, toggle }) => (
            <div
              key={label}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontWeight: 500, color: '#0f172a', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{desc}</div>
              </div>
              <div
                onClick={() => toggle((v) => !v)}
                style={{
                  width: 48,
                  height: 26,
                  borderRadius: 13,
                  cursor: 'pointer',
                  flexShrink: 0,
                  background: state ? '#16a34a' : '#d1d5db',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: state ? 25 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Divider />

      <Card style={{ marginBottom: 16 }}>
        <CardHeader style={{ marginBottom: 16 }}>Mật khẩu đăng nhập</CardHeader>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
          Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.
        </div>
        <button
          onClick={() => {
            setShowPwModal(true);
            setPwForm({ current: '', newPw: '', confirm: '' });
            setPwChanged(false);
          }}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid #1e3a5f',
            background: '#fff',
            color: '#1e3a5f',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Đổi mật khẩu
        </button>
      </Card>

      <Card>
        <CardHeader style={{ marginBottom: 12 }}>Phiên đăng nhập</CardHeader>
        {[
          {
            device: 'Chrome trên Windows 11',
            location: 'TP.HCM, Vietnam',
            time: 'Hiện tại',
            current: true,
          },
          {
            device: 'Safari trên iPhone 15',
            location: 'TP.HCM, Vietnam',
            time: '2 giờ trước',
            current: false,
          },
          {
            device: 'Firefox trên MacOS',
            location: 'Hà Nội, Vietnam',
            time: '2 ngày trước',
            current: false,
          },
        ].map((session, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none',
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: 13, color: '#0f172a' }}>
                {session.device}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {session.location} · {session.time}
              </div>
            </div>
            {session.current ? (
              <span
                style={{
                  fontSize: 11,
                  background: '#dcfce7',
                  color: '#16a34a',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                Thiết bị này
              </span>
            ) : (
              <button
                onClick={() => alert('Đã đăng xuất phiên này')}
                style={{
                  fontSize: 12,
                  color: '#dc2626',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '2px 8px',
                }}
              >
                Đăng xuất
              </button>
            )}
          </div>
        ))}
      </Card>

      {/* Password change modal */}
      {showPwModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 28,
              width: 360,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {pwChanged ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontWeight: 700, color: '#16a34a', marginBottom: 16 }}>
                  Đổi mật khẩu thành công!
                </div>
                <button
                  onClick={() => setShowPwModal(false)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#1e3a5f',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Đổi mật khẩu</div>
                {[
                  { label: 'Mật khẩu hiện tại', field: 'current', value: pwForm.current },
                  { label: 'Mật khẩu mới', field: 'newPw', value: pwForm.newPw },
                  { label: 'Xác nhận mật khẩu mới', field: 'confirm', value: pwForm.confirm },
                ].map(({ label, field, value }) => (
                  <div key={field} style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#374151',
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </label>
                    <input
                      type="password"
                      value={value}
                      onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
                {pwForm.newPw && pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 8 }}>
                    Mật khẩu xác nhận không khớp
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    onClick={() => setShowPwModal(false)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleChangePw}
                    disabled={!pwForm.current || !pwForm.newPw || pwForm.newPw !== pwForm.confirm}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 8,
                      border: 'none',
                      background:
                        pwForm.current && pwForm.newPw && pwForm.newPw === pwForm.confirm
                          ? '#1e3a5f'
                          : '#e2e8f0',
                      color:
                        pwForm.current && pwForm.newPw && pwForm.newPw === pwForm.confirm
                          ? '#fff'
                          : '#94a3b8',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Xác nhận
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
