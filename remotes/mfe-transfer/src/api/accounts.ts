import { withAccountService } from '@app/common/constants/endpoints';
import { apiGet } from '@app/common/services';

// mfe-transfer chỉ cần danh sách tài khoản nguồn — gọi cùng endpoint
// với mfe-accounts nhưng giữ contract type riêng (mỗi remote độc lập).

export interface SourceAccount {
  id: string;
  type: string;
  typeLabel: string;
  name: string;
  number: string;
  balance: number;
  currency: string;
  status: string;
}

export const fetchAccounts = (): Promise<SourceAccount[]> => apiGet(withAccountService(''));
