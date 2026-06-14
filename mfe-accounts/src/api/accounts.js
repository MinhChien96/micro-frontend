const delay = (ms) => new Promise((r) => setTimeout(r, ms));

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
    interestRate: 5.5,
    maturity: '2024-11-01',
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
    interestRate: 6.2,
    maturity: '2025-03-15',
    status: 'active',
  },
];

// 120 transactions for TK001 to make virtual scrolling demo meaningful
const DESCS_DEBIT = [
  'Chuyển tiền đến Nguyễn Văn A',
  'Thanh toán điện nước',
  'Mua sắm online',
  'Chuyển tiền đến Trần Thị B',
  'Thanh toán bảo hiểm',
  'Thanh toán internet/điện thoại',
  'Mua xăng xe',
  'Thanh toán ăn uống',
  'Phí dịch vụ ngân hàng',
  'Thanh toán học phí',
  'Mua thuốc',
  'Thanh toán taxi',
  'Mua đồ gia dụng',
  'Thanh toán gym',
  'Mua sách',
];
const DESCS_CREDIT = [
  'Nhận lương tháng',
  'Hoàn tiền khuyến mãi',
  'Nhận tiền hoàn từ đối tác',
  'Nhận tiền từ người thân',
  'Lãi tiền gửi',
  'Hoàn tiền bảo hiểm',
  'Thu nhập freelance',
  'Nhận thưởng cuối năm',
  'Hoàn thuế',
];

function pad(n) {
  return String(n).padStart(2, '0');
}
function makeDate(daysAgo) {
  const d = new Date('2024-10-15');
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const TK001_TRANSACTIONS = Array.from({ length: 120 }, (_, i) => {
  const isCredit = i % 3 === 1;
  const amount = isCredit
    ? [18_000_000, 3_200_000, 10_000_000, 150_000, 500_000, 2_500_000][i % 6]
    : [2_000_000, 850_000, 1_200_000, 5_000_000, 2_500_000, 450_000, 300_000, 680_000][i % 8];
  const descs = isCredit ? DESCS_CREDIT : DESCS_DEBIT;
  return {
    id: `t${i + 1}`,
    date: makeDate(i),
    desc: descs[i % descs.length],
    amount: isCredit ? amount : -amount,
    type: isCredit ? 'credit' : 'debit',
  };
});

const MOCK_TRANSACTIONS = {
  TK001: TK001_TRANSACTIONS,
  TK002: [
    {
      id: 't20',
      date: '2024-10-01',
      desc: 'Lãi tiết kiệm tháng 10',
      amount: 229_167,
      type: 'credit',
    },
    {
      id: 't21',
      date: '2024-09-01',
      desc: 'Lãi tiết kiệm tháng 9',
      amount: 229_167,
      type: 'credit',
    },
    {
      id: 't22',
      date: '2024-08-15',
      desc: 'Gửi tiết kiệm 6 tháng',
      amount: -50_000_000,
      type: 'debit',
    },
    {
      id: 't23',
      date: '2024-08-01',
      desc: 'Lãi tiết kiệm tháng 8',
      amount: 229_167,
      type: 'credit',
    },
    {
      id: 't24',
      date: '2024-07-01',
      desc: 'Lãi tiết kiệm tháng 7',
      amount: 229_167,
      type: 'credit',
    },
    {
      id: 't25',
      date: '2024-06-01',
      desc: 'Lãi tiết kiệm tháng 6',
      amount: 229_167,
      type: 'credit',
    },
  ],
  TK003: [
    {
      id: 't30',
      date: '2024-10-01',
      desc: 'Lãi tiết kiệm tháng 10',
      amount: 516_667,
      type: 'credit',
    },
    {
      id: 't31',
      date: '2024-09-01',
      desc: 'Lãi tiết kiệm tháng 9',
      amount: 516_667,
      type: 'credit',
    },
    {
      id: 't32',
      date: '2024-03-15',
      desc: 'Gửi tiết kiệm 12 tháng',
      amount: -100_000_000,
      type: 'debit',
    },
    {
      id: 't33',
      date: '2024-02-01',
      desc: 'Lãi tiết kiệm tháng 2',
      amount: 516_667,
      type: 'credit',
    },
    {
      id: 't34',
      date: '2024-01-01',
      desc: 'Lãi tiết kiệm tháng 1',
      amount: 516_667,
      type: 'credit',
    },
    {
      id: 't35',
      date: '2023-12-01',
      desc: 'Lãi tiết kiệm tháng 12',
      amount: 516_667,
      type: 'credit',
    },
  ],
};

const PAGE_SIZE = 20;

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

// Paginated version for useInfiniteQuery
export const fetchTransactionPage = async ({ accountId, pageParam = 0 }) => {
  await delay(300);
  const all = MOCK_TRANSACTIONS[accountId] || [];
  return {
    items: all.slice(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE),
    nextPage: (pageParam + 1) * PAGE_SIZE < all.length ? pageParam + 1 : undefined,
    total: all.length,
  };
};
