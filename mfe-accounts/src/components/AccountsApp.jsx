import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageSpinner } from 'shared/ui';
import AccountList from './AccountList';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

const AccountDetail = lazy(() =>
  import(
    /* webpackChunkName: "account-detail" */
    /* webpackPrefetch: true */
    './AccountDetail'
  )
);

const TransactionList = lazy(() =>
  import(
    /* webpackChunkName: "transaction-list" */
    /* webpackPrefetch: true */
    './TransactionList'
  )
);

export default function AccountsApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route index element={<AccountList />} />
        <Route
          path=":id"
          element={
            <Suspense fallback={<PageSpinner label="Đang tải tài khoản..." />}>
              <AccountDetail />
            </Suspense>
          }
        />
        <Route
          path=":id/transactions"
          element={
            <Suspense fallback={<PageSpinner label="Đang tải lịch sử..." />}>
              <TransactionList />
            </Suspense>
          }
        />
      </Routes>
    </QueryClientProvider>
  );
}
