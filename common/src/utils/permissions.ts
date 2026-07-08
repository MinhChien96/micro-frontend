export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  PREMIUM: 'PREMIUM',
  BUSINESS: 'BUSINESS',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const CUSTOMER_PERMS = [
  'accounts:view',
  'accounts:download',
  'transfer:domestic',
  'cards:view',
  'cards:freeze',
  'cards:change_pin',
  'loans:view',
  'profile:view',
  'profile:edit',
  'profile:security',
] as const;

const PREMIUM_PERMS = [
  ...CUSTOMER_PERMS,
  'transfer:international',
  'cards:manage_limit',
  'loans:apply',
  'loans:pay_early',
] as const;

const BUSINESS_PERMS = [...PREMIUM_PERMS, 'transfer:bulk', 'accounts:manage'] as const;

// BUSINESS là superset mọi quyền → dùng làm nguồn union Permission
export type Permission = (typeof BUSINESS_PERMS)[number];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  CUSTOMER: CUSTOMER_PERMS,
  PREMIUM: PREMIUM_PERMS,
  BUSINESS: BUSINESS_PERMS,
};

// Nhận string (role có thể đến từ localStorage) — fallback CUSTOMER nếu không khớp
export const getPermissionsForRole = (role: string): readonly Permission[] =>
  ROLE_PERMISSIONS[role as Role] ?? CUSTOMER_PERMS;

export const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: 'Khách hàng thường',
  PREMIUM: 'Khách hàng ưu tiên',
  BUSINESS: 'Doanh nghiệp',
};
