const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const MOCK_ACCOUNTS = [
  {
    id: 'TK001', type: 'checking', typeLabel: 'Thanh toán',
    name: 'Tài khoản thanh toán', number: '0021 0001 2345 678',
    balance: 15_420_000, currency: 'VND', status: 'active',
  },
  {
    id: 'TK002', type: 'savings', typeLabel: 'Tiết kiệm',
    name: 'Tiết kiệm 6 tháng', number: '0021 0007 8901 234',
    balance: 50_000_000, currency: 'VND',
    interestRate: 5.5, maturity: '2024-11-01', status: 'active',
  },
  {
    id: 'TK003', type: 'savings', typeLabel: 'Tiết kiệm',
    name: 'Tiết kiệm 12 tháng', number: '0021 0003 4567 890',
    balance: 100_000_000, currency: 'VND',
    interestRate: 6.2, maturity: '2025-03-15', status: 'active',
  },
];

const MOCK_TRANSACTIONS = {
  TK001: [
    { id: 't1',  date: '2024-10-15', desc: 'Chuyển tiền đến Nguyễn Văn A',   amount: -2_000_000,  type: 'debit' },
    { id: 't2',  date: '2024-10-14', desc: 'Nhận lương tháng 10',             amount: 18_000_000,  type: 'credit' },
    { id: 't3',  date: '2024-10-13', desc: 'Thanh toán điện nước',            amount: -850_000,    type: 'debit' },
    { id: 't4',  date: '2024-10-12', desc: 'Mua sắm online',                  amount: -1_200_000,  type: 'debit' },
    { id: 't5',  date: '2024-10-10', desc: 'Hoàn tiền khuyến mãi',            amount: 150_000,     type: 'credit' },
    { id: 't6',  date: '2024-10-08', desc: 'Chuyển tiền đến Trần Thị B',     amount: -5_000_000,  type: 'debit' },
    { id: 't7',  date: '2024-10-05', desc: 'Nhận tiền hoàn từ đối tác',       amount: 3_200_000,   type: 'credit' },
    { id: 't8',  date: '2024-10-03', desc: 'Thanh toán bảo hiểm',             amount: -2_500_000,  type: 'debit' },
    { id: 't9',  date: '2024-09-30', desc: 'Thanh toán internet/điện thoại',  amount: -450_000,    type: 'debit' },
    { id: 't10', date: '2024-09-28', desc: 'Nhận tiền từ người thân',         amount: 10_000_000,  type: 'credit' },
    { id: 't11', date: '2024-09-25', desc: 'Mua xăng xe',                     amount: -300_000,    type: 'debit' },
    { id: 't12', date: '2024-09-20', desc: 'Thanh toán ăn uống',              amount: -680_000,    type: 'debit' },
  ],
  TK002: [
    { id: 't20', date: '2024-10-01', desc: 'Lãi tiết kiệm tháng 10',  amount: 229_167,     type: 'credit' },
    { id: 't21', date: '2024-09-01', desc: 'Lãi tiết kiệm tháng 9',   amount: 229_167,     type: 'credit' },
    { id: 't22', date: '2024-08-15', desc: 'Gửi tiết kiệm 6 tháng',   amount: -50_000_000, type: 'debit' },
    { id: 't23', date: '2024-08-01', desc: 'Lãi tiết kiệm tháng 8',   amount: 229_167,     type: 'credit' },
    { id: 't24', date: '2024-07-01', desc: 'Lãi tiết kiệm tháng 7',   amount: 229_167,     type: 'credit' },
    { id: 't25', date: '2024-06-01', desc: 'Lãi tiết kiệm tháng 6',   amount: 229_167,     type: 'credit' },
  ],
  TK003: [
    { id: 't30', date: '2024-10-01', desc: 'Lãi tiết kiệm tháng 10',  amount: 516_667,      type: 'credit' },
    { id: 't31', date: '2024-09-01', desc: 'Lãi tiết kiệm tháng 9',   amount: 516_667,      type: 'credit' },
    { id: 't32', date: '2024-03-15', desc: 'Gửi tiết kiệm 12 tháng',  amount: -100_000_000, type: 'debit' },
    { id: 't33', date: '2024-02-01', desc: 'Lãi tiết kiệm tháng 2',   amount: 516_667,      type: 'credit' },
    { id: 't34', date: '2024-01-01', desc: 'Lãi tiết kiệm tháng 1',   amount: 516_667,      type: 'credit' },
    { id: 't35', date: '2023-12-01', desc: 'Lãi tiết kiệm tháng 12',  amount: 516_667,      type: 'credit' },
  ],
};

export const fetchAccounts = async () => {
  await delay(400);
  return MOCK_ACCOUNTS;
};

export const fetchAccount = async (id) => {
  await delay(200);
  const acc = MOCK_ACCOUNTS.find((a) => a.id === id);
  if (!acc) throw new Error(`Không tìm thấy tài khoản ${id}`);
  return acc;
};

export const fetchTransactions = async (accountId) => {
  await delay(200);
  return MOCK_TRANSACTIONS[accountId] || [];
};
