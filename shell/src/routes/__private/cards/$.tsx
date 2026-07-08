import { BRAND } from '@app/common/brand';
import { Helmet } from '@modern-js/runtime/head';
import * as MRouter from '@modern-js/runtime/router';
import RemoteErrorBoundary from '../../../components/RemoteErrorBoundary';
import { CardsRoutes } from '../../../components/remotePages';

// Pattern B (bank: card-zone): giao CẢ NHÁNH /cards/* cho remote — truyền
// nguyên module router của shell qua props để zone dùng đúng router instance.
// Thêm màn mới trong zone: chỉ sửa mfe-cards, KHÔNG đụng shell.
export default function CardsZonePage() {
  return (
    <>
      <Helmet>
        <title>{`Thẻ — ${BRAND.name}`}</title>
      </Helmet>
      <RemoteErrorBoundary remote="mfe_cards/CardsRoutes">
        <CardsRoutes {...MRouter} />
      </RemoteErrorBoundary>
    </>
  );
}
