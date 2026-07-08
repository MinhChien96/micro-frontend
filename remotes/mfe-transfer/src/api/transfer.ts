import { withTransferService } from '@app/common/constants/endpoints';
import { apiGet, apiPost } from '@app/common/services';

// API chuyển tiền — qua apiClient chung; MSW làm backend khi dev/test.

export type TransferStatus = 'success' | 'pending' | 'failed';

export interface TransferRecord {
  id: string;
  date: string;
  name: string;
  bank: string;
  account: string;
  amount: number;
  status: TransferStatus;
  note: string;
  /** đánh dấu record đang optimistic (chưa server-confirm) */
  _optimistic?: boolean;
}

export interface TransferForm {
  sourceId: string;
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  amount: string;
  note: string;
}

export const fetchTransferHistory = (): Promise<TransferRecord[]> =>
  apiGet(withTransferService(''));

export const submitTransfer = (form: TransferForm): Promise<TransferRecord> =>
  apiPost(withTransferService(''), form);
