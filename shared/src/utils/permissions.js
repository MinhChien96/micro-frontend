export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  PREMIUM:  'PREMIUM',
  BUSINESS: 'BUSINESS',
};

const CUSTOMER_PERMS = [
  'accounts:view', 'accounts:download',
  'transfer:domestic',
  'cards:view', 'cards:freeze', 'cards:change_pin',
  'loans:view',
  'profile:view', 'profile:edit', 'profile:security',
];

const PREMIUM_PERMS = [
  ...CUSTOMER_PERMS,
  'transfer:international',
  'cards:manage_limit',
  'loans:apply', 'loans:pay_early',
];

const BUSINESS_PERMS = [
  ...PREMIUM_PERMS,
  'transfer:bulk',
  'accounts:manage',
];

export const ROLE_PERMISSIONS = {
  [ROLES.CUSTOMER]: CUSTOMER_PERMS,
  [ROLES.PREMIUM]:  PREMIUM_PERMS,
  [ROLES.BUSINESS]: BUSINESS_PERMS,
};

export const getPermissionsForRole = (role) =>
  ROLE_PERMISSIONS[role] ?? CUSTOMER_PERMS;

export const ROLE_LABELS = {
  [ROLES.CUSTOMER]: 'Khách hàng thường',
  [ROLES.PREMIUM]:  'Khách hàng ưu tiên',
  [ROLES.BUSINESS]: 'Doanh nghiệp',
};
