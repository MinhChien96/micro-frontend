// Hợp đồng sự kiện cross-MFE — emit/on/getLast type-safe theo key.
// Remote A đổi payload → remote B compile-fail ngay (tránh hợp đồng ngầm).

export interface TransferPrefill {
  accountId: string;
  accountName: string;
  accountNumber: string;
  balance: number;
}

export interface AppEvents {
  /** mfe-accounts → mfe-transfer: pre-fill tài khoản nguồn khi "Chuyển tiền từ đây" */
  'app:transferPrefill': TransferPrefill;
}
