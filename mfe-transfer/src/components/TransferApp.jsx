import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PageSpinner } from 'shared/ui';
import TransferDashboard from './TransferDashboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

const NewTransfer = lazy(
  () =>
    import(
      /* webpackChunkName: "new-transfer" */
      /* webpackPrefetch: true */
      './NewTransfer'
    ),
);

const TransferHistory = lazy(
  () =>
    import(
      /* webpackChunkName: "transfer-history" */
      /* webpackPrefetch: true */
      './TransferHistory'
    ),
);

export default function TransferApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route index element={<TransferDashboard />} />
        <Route
          path="new"
          element={
            <Suspense fallback={<PageSpinner label="Đang tải form chuyển tiền..." />}>
              <NewTransfer />
            </Suspense>
          }
        />
        <Route
          path="history"
          element={
            <Suspense fallback={<PageSpinner label="Đang tải lịch sử..." />}>
              <TransferHistory />
            </Suspense>
          }
        />
      </Routes>
    </QueryClientProvider>
  );
}
