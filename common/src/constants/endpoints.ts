// Endpoint dùng chung + helper prefix theo service gateway (bank pattern:
// withAccountService → /account/api/...). Endpoint riêng của từng remote
// khai báo trong remote đó, nhưng luôn bọc qua with*Service để đổi gateway
// một chỗ.
export const withAuthService = (path: string): string => `/api/auth${path}`;
export const withAccountService = (path: string): string => `/api/accounts${path}`;
export const withTransferService = (path: string): string => `/api/transfers${path}`;

// Prefix "[public]": apiClient KHÔNG chờ/gắn token (login, refresh...).
export const ENDPOINTS = {
  login: `[public]${withAuthService('/login')}`,
  verifyOtp: `[public]${withAuthService('/verify-otp')}`,
  refreshToken: `[public]${withAuthService('/refresh-token')}`,
  logout: withAuthService('/logout'),
} as const;
