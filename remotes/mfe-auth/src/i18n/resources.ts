// Resources i18n RIÊNG của mfe-auth — bundle trong remote, không đụng module khác.
// Quy ước key: prefix theo module ('auth.*').
export const authResources = {
  vi: {
    translation: {
      auth: {
        subtitle: 'Đăng nhập để quản lý tài khoản của bạn',
        cif: 'Mã khách hàng (CIF)',
        password: 'Mật khẩu Internet Banking',
        submit: 'Đăng nhập',
        submitting: 'Đang đăng nhập...',
        otpTitle: 'Xác thực OTP',
        otpSubtitle: 'Nhập mã OTP đã gửi về số điện thoại của bạn',
        otpLabel: 'Mã OTP (6 số)',
        otpSubmit: 'Xác nhận',
        otpSubmitting: 'Đang xác thực...',
        otpBack: '← Quay lại đăng nhập',
      },
    },
  },
  en: {
    translation: {
      auth: {
        subtitle: 'Sign in to manage your accounts',
        cif: 'Customer ID (CIF)',
        password: 'Internet Banking password',
        submit: 'Sign in',
        submitting: 'Signing in...',
        otpTitle: 'OTP verification',
        otpSubtitle: 'Enter the OTP sent to your phone',
        otpLabel: 'OTP code (6 digits)',
        otpSubmit: 'Verify',
        otpSubmitting: 'Verifying...',
        otpBack: '← Back to sign in',
      },
    },
  },
};
