import { ActionEnum, ENTITLED_ACTIONS, type EntitledAction, type Role } from '../../permissions';

// Backend giả: map role demo → danh sách entitledActions.
// Hệ thật KHÔNG có bảng này ở frontend — backend tự trả theo hồ sơ user.
const CUSTOMER_ACTIONS: ActionEnum[] = [
  ActionEnum.fAccountView,
  ActionEnum.fAccountDetail,
  ActionEnum.fTxnHistory,
  ActionEnum.fTransferDomestic,
  ActionEnum.fCardView,
  ActionEnum.fCardFreeze,
  ActionEnum.fLoanView,
  ActionEnum.fProfileEdit,
];

const PREMIUM_ACTIONS: ActionEnum[] = [
  ...CUSTOMER_ACTIONS,
  ActionEnum.fTransferInternational,
  ActionEnum.fCardManageLimit,
  ActionEnum.fLoanRegister,
  ActionEnum.fLoanPayEarly,
];

const BUSINESS_ACTIONS: ActionEnum[] = [
  ...PREMIUM_ACTIONS,
  ActionEnum.fTransferBatch,
  ActionEnum.fAccountManage,
  ActionEnum.fAdminManageUsers,
];

const BY_ROLE: Record<Role, ActionEnum[]> = {
  CUSTOMER: CUSTOMER_ACTIONS,
  PREMIUM: PREMIUM_ACTIONS,
  BUSINESS: BUSINESS_ACTIONS,
};

export function entitlementsForRole(role: string): EntitledAction[] {
  const actions = BY_ROLE[role as Role] ?? CUSTOMER_ACTIONS;
  return actions.map((a) => ENTITLED_ACTIONS[a]);
}
