import { ActionEnum, ProductType } from './entitledAction';

// Bảng map ActionEnum → function-code, nhóm theo Product → Sub-product
// (bank: actionMapToPSF.ts, ~212 action; đây là bản mini demo).
// Thêm quyền mới: thêm ActionEnum + 1 dòng ở đây; backend trả {p,s,f} khớp.
export const PSFMapping: Record<
  ProductType,
  Record<string, Partial<Record<ActionEnum, string>>>
> = {
  [ProductType.CORESVS]: {
    CASA: {
      [ActionEnum.fAccountView]: 'account:view',
      [ActionEnum.fAccountDetail]: 'account:detail',
      [ActionEnum.fTxnHistory]: 'txn:history',
      [ActionEnum.fAccountManage]: 'account:manage',
    },
  },
  [ProductType.PAYMNT]: {
    TRANSFER: {
      [ActionEnum.fTransferDomestic]: 'transfer:domestic',
      [ActionEnum.fTransferInternational]: 'transfer:international',
      [ActionEnum.fTransferBatch]: 'transfer:batch',
    },
  },
  [ProductType.CARDS]: {
    CARD: {
      [ActionEnum.fCardView]: 'card:view',
      [ActionEnum.fCardFreeze]: 'card:freeze',
      [ActionEnum.fCardManageLimit]: 'card:manage-limit',
    },
  },
  [ProductType.LOANS]: {
    LOAN: {
      [ActionEnum.fLoanView]: 'loan:view',
      [ActionEnum.fLoanRegister]: 'loan:register',
      [ActionEnum.fLoanPayEarly]: 'loan:pay-early',
    },
  },
  [ProductType.CUSER]: {
    PROFILE: {
      [ActionEnum.fProfileEdit]: 'profile:edit',
      [ActionEnum.fAdminManageUsers]: 'admin:manage-users',
    },
  },
};
