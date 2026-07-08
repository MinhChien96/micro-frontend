import '../tailwind.css';
import { PageSpinner } from '@app/common/ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoanList from './LoanList';

const LoanDetail = lazy(
  () =>
    import(
      /* webpackChunkName: "loan-detail" */
      /* webpackPrefetch: true */
      './LoanDetail'
    ),
);

const PaymentSchedule = lazy(
  () =>
    import(
      /* webpackChunkName: "payment-schedule" */
      /* webpackPrefetch: true */
      './PaymentSchedule'
    ),
);

// Không có <Router> — Router context đến từ shell (HashRouter)
export default function LoansApp() {
  return (
    <Routes>
      <Route index element={<LoanList />} />
      <Route
        path=":id"
        element={
          <Suspense fallback={<PageSpinner label="Đang tải khoản vay..." />}>
            <LoanDetail />
          </Suspense>
        }
      />
      <Route
        path=":id/schedule"
        element={
          <Suspense fallback={<PageSpinner label="Đang tải lịch trả nợ..." />}>
            <PaymentSchedule />
          </Suspense>
        }
      />
    </Routes>
  );
}
