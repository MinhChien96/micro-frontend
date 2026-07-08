// ============================================================================
// Mô hình phân quyền P/S/F của bank: mỗi quyền = bộ 3
//   p (Product) / s (Sub-product) / f (Function-code)
// Backend trả user.entitledActions: EntitledAction[]; frontend đặt tên dễ đọc
// qua ActionEnum rồi map ngược ở actionMapToPSF.ts.
// ============================================================================

export enum ProductType {
  CORESVS = 'CORESVS', // dịch vụ tài khoản lõi
  PAYMNT = 'PAYMNT', // thanh toán/chuyển tiền
  CARDS = 'CARDS',
  LOANS = 'LOANS',
  CUSER = 'CUSER', // hồ sơ/quản trị user
}

export interface EntitledAction {
  p: ProductType;
  s: string;
  f: string;
}

// Quy ước đặt tên: f<Nghiệp vụ><Hành động>. KHÔNG trùng key giữa các
// sub-product — quyền giống nhau ở 2 nơi thì tạo 2 ActionEnum riêng.
export enum ActionEnum {
  // CORESVS / CASA
  fAccountView = 'fAccountView',
  fAccountDetail = 'fAccountDetail',
  fTxnHistory = 'fTxnHistory',
  fAccountManage = 'fAccountManage',
  // PAYMNT / TRANSFER
  fTransferDomestic = 'fTransferDomestic',
  fTransferInternational = 'fTransferInternational',
  fTransferBatch = 'fTransferBatch',
  // CARDS / CARD
  fCardView = 'fCardView',
  fCardFreeze = 'fCardFreeze',
  fCardManageLimit = 'fCardManageLimit',
  // LOANS / LOAN
  fLoanView = 'fLoanView',
  fLoanRegister = 'fLoanRegister',
  fLoanPayEarly = 'fLoanPayEarly',
  // CUSER / PROFILE
  fProfileEdit = 'fProfileEdit',
  fAdminManageUsers = 'fAdminManageUsers',
}
