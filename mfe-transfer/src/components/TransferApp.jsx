import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageSpinner } from 'shared/ui';
import TransferDashboard from './TransferDashboard';

const NewTransfer = lazy(() =>
  import(
    /* webpackChunkName: "new-transfer" */
    /* webpackPrefetch: true */
    './NewTransfer'
  )
);

const TransferHistory = lazy(() =>
  import(
    /* webpackChunkName: "transfer-history" */
    /* webpackPrefetch: true */
    './TransferHistory'
  )
);

// Không có <Router> — Router context đến từ shell (HashRouter)
export default function TransferApp() {
  return (
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
  );
}
