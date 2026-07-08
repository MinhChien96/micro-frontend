// Role demo của template (3 hồ sơ khách hàng). Trong hệ thật, role chỉ là
// nhãn hiển thị — quyền thực tế do backend trả qua user.entitledActions.
export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  PREMIUM: 'PREMIUM',
  BUSINESS: 'BUSINESS',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: 'Khách hàng thường',
  PREMIUM: 'Khách hàng ưu tiên',
  BUSINESS: 'Doanh nghiệp',
};
