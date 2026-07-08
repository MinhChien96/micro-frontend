import '../tailwind.css';
import { PageSpinner } from '@app/common/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import AccountList from './AccountList';

// CHỈ dùng cho chế độ STANDALONE (routes/page.tsx): tự dựng router con +
// QueryClient riêng. Khi chạy trong shell, từng màn được expose lẻ theo
// Pattern A (shell sở hữu route, truyền navigator/accountId).
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

const AccountDetail = lazy(() => import('./AccountDetail'));
const TransactionList = lazy(() => import('./TransactionList'));

function ListRoute() {
  const navigate = useNavigate();
  return <AccountList navigator={navigate} />;
}

function DetailRoute() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  return (
    <Suspense fallback={<PageSpinner label="Đang tải tài khoản..." />}>
      <AccountDetail accountId={id} navigator={navigate} />
    </Suspense>
  );
}

function TransactionsRoute() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  return (
    <Suspense fallback={<PageSpinner label="Đang tải lịch sử..." />}>
      <TransactionList accountId={id} navigator={navigate} />
    </Suspense>
  );
}

export default function AccountsApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route index element={<ListRoute />} />
        <Route path=":id" element={<DetailRoute />} />
        <Route path=":id/transactions" element={<TransactionsRoute />} />
      </Routes>
    </QueryClientProvider>
  );
}
