import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageSpinner } from 'shared/ui';
import AccountList from './AccountList';

// Lazy load sub-pages — each becomes a separate webpack chunk
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

// Không có <Router> — Router context đến từ shell (HashRouter)
export default function AccountsApp() {
  return (
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
  );
}
