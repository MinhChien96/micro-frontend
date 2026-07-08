// @vitest-environment node
// Môi trường node (không có window) → kiểm SSR guard của auth helpers
import { describe, expect, it } from 'vitest';
import { getToken, getUser, isAuthenticated } from './auth';

describe('auth SSR guard (không có window)', () => {
  it('getUser trả null khi không có localStorage', () => {
    expect(getUser()).toBeNull();
  });

  it('getToken trả null', () => {
    expect(getToken()).toBeNull();
  });

  it('isAuthenticated false', () => {
    expect(isAuthenticated()).toBe(false);
  });
});
