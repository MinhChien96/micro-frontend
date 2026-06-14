import { BRAND } from '@app/shared/brand';
import { Helmet } from '@modern-js/runtime/head';
import { Link } from '@modern-js/runtime/router';

// Catch-all 404 cho path không khớp route nào
export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '64px 16px' }}>
      <Helmet>
        <title>{`Không tìm thấy trang — ${BRAND.name}`}</title>
      </Helmet>
      <h1 style={{ fontSize: 48, marginBottom: 8 }}>404</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Trang bạn tìm không tồn tại.</p>
      <Link to="/" style={{ color: '#2563eb', fontWeight: 600 }}>
        ← Về trang chủ
      </Link>
    </div>
  );
}
