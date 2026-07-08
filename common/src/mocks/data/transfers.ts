// Lịch sử chuyển tiền — state module-level, sống trong lifetime của worker/server.
export interface MockTransferRecord {
  id: string;
  date: string;
  name: string;
  bank: string;
  account: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  note: string;
}

export const transferHistory: MockTransferRecord[] = [
  {
    id: 'h1',
    date: '2024-10-15',
    name: 'Nguyễn Văn A',
    bank: 'Vietcombank',
    account: '1234 5678',
    amount: 2_000_000,
    status: 'success',
    note: 'Tiền cafe',
  },
  {
    id: 'h2',
    date: '2024-10-13',
    name: 'Trần Thị B',
    bank: 'Techcombank',
    account: '9876 5432',
    amount: 5_000_000,
    status: 'success',
    note: 'Thanh toán nhà',
  },
  {
    id: 'h3',
    date: '2024-10-10',
    name: 'Lê Văn C',
    bank: 'BIDV',
    account: '4567 8901',
    amount: 1_500_000,
    status: 'pending',
    note: 'Mua đồ',
  },
  {
    id: 'h4',
    date: '2024-10-05',
    name: 'Phạm Thị D',
    bank: 'Agribank',
    account: '2345 6789',
    amount: 10_000_000,
    status: 'success',
    note: 'Trả nợ',
  },
  {
    id: 'h5',
    date: '2024-10-01',
    name: 'Hoàng Văn E',
    bank: 'VPBank',
    account: '3456 7890',
    amount: 3_200_000,
    status: 'failed',
    note: 'Chuyển nhầm',
  },
  {
    id: 'h6',
    date: '2024-09-28',
    name: 'Nguyễn Thị F',
    bank: 'MB Bank',
    account: '5678 9012',
    amount: 800_000,
    status: 'success',
    note: 'Ăn uống',
  },
  {
    id: 'h7',
    date: '2024-09-25',
    name: 'Đặng Văn G',
    bank: 'TPBank',
    account: '6789 0123',
    amount: 15_000_000,
    status: 'success',
    note: 'Học phí',
  },
  {
    id: 'h8',
    date: '2024-09-20',
    name: 'Vũ Thị H',
    bank: 'VIB',
    account: '7890 1234',
    amount: 500_000,
    status: 'pending',
    note: 'Phụng dưỡng',
  },
];
