// Mock data banking (example domain) — nguồn duy nhất cho MSW handlers.
// Types thật của màn hình nằm trong remote (mỗi remote sở hữu contract riêng).

export const MOCK_ACCOUNTS = [
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

const pad = (n: number): string => String(n).padStart(2, '0');
const makeDate = (daysAgo: number): string => {
  const d = new Date('2024-10-15');
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// 120 giao dịch cho TK001 — đủ dữ liệu demo virtual scrolling + infinite query
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

const savingsTxns = (prefix: string, monthly: number, deposit: number, depositDate: string) => [
  {
    id: `${prefix}0`,
    date: '2024-10-01',
    desc: 'Lãi tiết kiệm tháng 10',
    amount: monthly,
    type: 'credit',
  },
  {
    id: `${prefix}1`,
    date: '2024-09-01',
    desc: 'Lãi tiết kiệm tháng 9',
    amount: monthly,
    type: 'credit',
  },
  { id: `${prefix}2`, date: depositDate, desc: 'Gửi tiết kiệm', amount: -deposit, type: 'debit' },
  {
    id: `${prefix}3`,
    date: '2024-08-01',
    desc: 'Lãi tiết kiệm tháng 8',
    amount: monthly,
    type: 'credit',
  },
];

export const MOCK_TRANSACTIONS: Record<string, typeof TK001_TRANSACTIONS> = {
  TK001: TK001_TRANSACTIONS,
  TK002: savingsTxns('t2', 229_167, 50_000_000, '2024-08-15'),
  TK003: savingsTxns('t3', 516_667, 100_000_000, '2024-03-15'),
};

export const TXN_PAGE_SIZE = 20;
