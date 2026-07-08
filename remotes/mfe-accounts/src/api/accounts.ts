import { withAccountService } from '@app/common/constants/endpoints';
import { apiGet } from '@app/common/services';

// API tài khoản — gọi qua apiClient chung (@app/common/services):
// tự chờ token/apiHost, tự refresh khi 401, unwrap envelope {data}.
// Dev/test: MSW phục vụ các endpoint này (common/src/mocks/handlers.ts).

export type AccountType = 'checking' | 'savings';
export type TxnType = 'credit' | 'debit';

export interface Account {
  id: string;
  type: AccountType;
  typeLabel: string;
  name: string;
  number: string;
  balance: number;
  currency: string;
  status: string;
  interestRate?: number;
  maturity?: string;
}

export interface Transaction {
  id: string;
  date: string;
  desc: string;
  amount: number;
  type: TxnType;
}

export interface TransactionPage {
  items: Transaction[];
  nextPage: number | undefined;
  total: number;
}

export const fetchAccounts = (): Promise<Account[]> => apiGet(withAccountService(''));

export const fetchAccount = (id: string): Promise<Account> => apiGet(withAccountService(`/${id}`));

export const fetchTransactions = (accountId: string): Promise<Transaction[]> =>
  apiGet(withAccountService(`/${accountId}/transactions`));

// Bản phân trang cho useInfiniteQuery
export const fetchTransactionPage = ({
  accountId,
  pageParam = 0,
}: {
  accountId: string;
  pageParam?: number;
}): Promise<TransactionPage> =>
  apiGet(withAccountService(`/${accountId}/transactions/paged?page=${pageParam}`));
