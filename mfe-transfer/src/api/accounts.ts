const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_ACCOUNTS = [
  {
    id: 'TK001',
    type: 'checking',
    typeLabel: 'Thanh toán',
    name: 'Tài khoản thanh toán',
    number: '0021 0001 2345 678',
    balance: 15_420_000,
    currency: 'VND',
    status: 'active',
  },
  {
    id: 'TK002',
    type: 'savings',
    typeLabel: 'Tiết kiệm',
    name: 'Tiết kiệm 6 tháng',
    number: '0021 0007 8901 234',
    balance: 50_000_000,
    currency: 'VND',
    status: 'active',
  },
  {
    id: 'TK003',
    type: 'savings',
    typeLabel: 'Tiết kiệm',
    name: 'Tiết kiệm 12 tháng',
    number: '0021 0003 4567 890',
    balance: 100_000_000,
    currency: 'VND',
    status: 'active',
  },
];

export const fetchAccounts = async () => {
  await delay(400);
  return MOCK_ACCOUNTS;
};
