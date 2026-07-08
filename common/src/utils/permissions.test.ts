import { describe, expect, it } from 'vitest';
import { getPermissionsForRole, ROLE_LABELS } from './permissions';

describe('getPermissionsForRole', () => {
  it('CUSTOMER có quyền cơ bản, không có quyền premium', () => {
    const perms = getPermissionsForRole('CUSTOMER');
    expect(perms).toContain('transfer:domestic');
    expect(perms).not.toContain('transfer:international');
  });

  it('PREMIUM kế thừa quyền CUSTOMER + quyền premium', () => {
    const perms = getPermissionsForRole('PREMIUM');
    expect(perms).toContain('transfer:domestic');
    expect(perms).toContain('transfer:international');
  });

  it('BUSINESS là superset (có transfer:bulk)', () => {
    expect(getPermissionsForRole('BUSINESS')).toContain('transfer:bulk');
  });

  it('role lạ → fallback CUSTOMER', () => {
    expect(getPermissionsForRole('UNKNOWN')).toEqual(getPermissionsForRole('CUSTOMER'));
  });

  it('ROLE_LABELS có nhãn cho mọi role', () => {
    expect(ROLE_LABELS.PREMIUM).toBe('Khách hàng ưu tiên');
  });
});
