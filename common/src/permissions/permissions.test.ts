import { describe, expect, it } from 'vitest';
import { entitlementsForRole } from '../mocks/data/entitlements';
import { ActionEnum, canAction, canAllActions, canAnyAction, ENTITLED_ACTIONS } from './index';

describe('P/S/F permissions', () => {
  it('build ENTITLED_ACTIONS đủ mọi ActionEnum, không trùng', () => {
    for (const action of Object.values(ActionEnum)) {
      const entry = ENTITLED_ACTIONS[action];
      expect(entry, `thiếu mapping cho ${action}`).toBeDefined();
      expect(entry.p).toBeTruthy();
      expect(entry.s).toBeTruthy();
      expect(entry.f).toBeTruthy();
    }
  });

  it('canAction đúng theo bộ {p,s,f} của user', () => {
    const customer = { entitledActions: entitlementsForRole('CUSTOMER') };
    expect(canAction(ActionEnum.fAccountView, customer)).toBe(true);
    expect(canAction(ActionEnum.fTransferDomestic, customer)).toBe(true);
    expect(canAction(ActionEnum.fTransferInternational, customer)).toBe(false);
    expect(canAction(ActionEnum.fAdminManageUsers, customer)).toBe(false);
  });

  it('PREMIUM mở khóa international/limit/loan; BUSINESS thêm batch/admin', () => {
    const premium = { entitledActions: entitlementsForRole('PREMIUM') };
    expect(canAction(ActionEnum.fTransferInternational, premium)).toBe(true);
    expect(canAction(ActionEnum.fCardManageLimit, premium)).toBe(true);
    expect(canAction(ActionEnum.fLoanRegister, premium)).toBe(true);
    expect(canAction(ActionEnum.fTransferBatch, premium)).toBe(false);

    const business = { entitledActions: entitlementsForRole('BUSINESS') };
    expect(canAction(ActionEnum.fTransferBatch, business)).toBe(true);
    expect(canAction(ActionEnum.fAdminManageUsers, business)).toBe(true);
  });

  it('canAnyAction / canAllActions', () => {
    const customer = { entitledActions: entitlementsForRole('CUSTOMER') };
    const mixed = [ActionEnum.fAccountView, ActionEnum.fAdminManageUsers];
    expect(canAnyAction(mixed, customer)).toBe(true);
    expect(canAllActions(mixed, customer)).toBe(false);
  });

  it('user không có entitledActions → mọi action false', () => {
    expect(canAction(ActionEnum.fAccountView, {})).toBe(false);
  });

  it('role lạ → fallback quyền CUSTOMER', () => {
    const unknown = { entitledActions: entitlementsForRole('HACKER') };
    expect(canAction(ActionEnum.fAccountView, unknown)).toBe(true);
    expect(canAction(ActionEnum.fAdminManageUsers, unknown)).toBe(false);
  });
});
