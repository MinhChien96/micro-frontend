// Cấu hình thương hiệu tập trung — đổi 1 chỗ để rebrand toàn hệ thống.
// Pure TS const (SSR-safe, không phụ thuộc React/window) → import được cả
// lúc build (modern.config.ts) lẫn runtime (Nav/Helmet).
export const BRAND = {
  name: 'AppBank',
  shortName: 'App',
  icon: '🏦',
  tagline: 'Modern.js · Federated SSR',
  description:
    'Micro-frontend base template với Modern.js federated SSR — tài khoản, chuyển tiền, thẻ, vay vốn.',
  htmlLang: 'vi',
} as const;
