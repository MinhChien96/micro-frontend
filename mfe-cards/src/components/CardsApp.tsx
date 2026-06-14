import '../tailwind.css';
import { PageSpinner } from '@app/shared/ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import CardList from './CardList';

const CardDetail = lazy(
  () =>
    import(
      /* webpackChunkName: "card-detail" */
      /* webpackPrefetch: true */
      './CardDetail'
    ),
);

// Không có <Router> — Router context đến từ shell (HashRouter)
export default function CardsApp() {
  return (
    <Routes>
      <Route index element={<CardList />} />
      <Route
        path=":id"
        element={
          <Suspense fallback={<PageSpinner label="Đang tải thông tin thẻ..." />}>
            <CardDetail />
          </Suspense>
        }
      />
    </Routes>
  );
}
