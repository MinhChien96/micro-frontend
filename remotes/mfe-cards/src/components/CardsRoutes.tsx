import '../tailwind.css';
import { PageSpinner } from '@app/common/ui';
import { lazy, Suspense, useEffect } from 'react';
import {
  CardsRouteProvider,
  type RouterModuleProps,
  syncNavigateFunction,
} from '../contexts/CardsRouteContext';
import CardList from './CardList';

const CardDetail = lazy(() => import('./CardDetail'));

/**
 * Cửa vào của ZONE /cards/* (bank: CardZoneRoutes) — nhận router module từ
 * props, tự dựng toàn bộ cây route con. Shell chỉ có 1 splat $.tsx;
 * thêm màn mới trong zone KHÔNG cần đụng shell.
 */
export default function CardsRoutes(props: RouterModuleProps) {
  const { Routes, Route, useNavigate } = props;
  const navigate = useNavigate();

  // đồng bộ navigate của shell cho code ngoài React tree (zoneNavigate)
  useEffect(() => {
    syncNavigateFunction(navigate);
  }, [navigate]);

  return (
    <CardsRouteProvider value={props}>
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
    </CardsRouteProvider>
  );
}
