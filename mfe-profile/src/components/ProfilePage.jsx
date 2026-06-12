import React, { Suspense, lazy, useState } from 'react';
import { Card, CardHeader, Divider, Button, PageSpinner, StatusBadge } from 'shared/ui';
import '../styles.css';

const EditProfile = lazy(() =>
  import(
    /* webpackChunkName: "edit-profile" */
    /* webpackPrefetch: true */
    './EditProfile'
  )
);

const ROLE_LABELS = { CUSTOMER: 'Khách hàng', PREMIUM: 'Ưu tiên', BUSINESS: 'Doanh nghiệp' };
const ROLE_COLOR  = { CUSTOMER: 'blue', PREMIUM: 'yellow', BUSINESS: 'purple' };

const getUser = () => {
  if (typeof window === 'undefined') return null; // SSR guard
  try { return JSON.parse(localStorage.getItem('vietbank_user') || 'null'); }
  catch { return null; }
};

export default function ProfilePage() {
  const user    = getUser();
  const [editing, setEditing] = useState(false);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
        <p style={{ fontSize: 16, marginBottom: 20 }}>Vui lòng đăng nhập để xem hồ sơ</p>
      </div>
    );
  }

  const role = (user.role || 'CUSTOMER').toUpperCase();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 8, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
        MFE-PROFILE TEAM
      </div>
      <h2 style={{ margin: '0 0 24px', color: '#1e293b', fontSize: 24 }}>Hồ sơ của tôi</h2>

      <Card>
        <CardHeader
          title={user.name}
          subtitle={user.email}
          action={<StatusBadge label={ROLE_LABELS[role] || role} color={ROLE_COLOR[role] || 'blue'} />}
        />
        <Divider />

        <div style={{ display: 'grid', gap: 12 }}>
          <InfoRow label="Họ tên"       value={user.name} />
          <InfoRow label="Email"         value={user.email} />
          <InfoRow label="Số điện thoại" value={user.phone} />
          <InfoRow label="Mã KH (CIF)"   value={user.customerId} />
          <InfoRow label="Chi nhánh"     value={user.branch} />
          <InfoRow label="Loại TK"       value={ROLE_LABELS[role] || role} />
        </div>

        <Divider />

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant={editing ? 'secondary' : 'primary'} size="sm" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Huỷ' : 'Chỉnh sửa hồ sơ'}
          </Button>
        </div>
      </Card>

      {editing && (
        <div style={{ marginTop: 20 }}>
          <Suspense fallback={<PageSpinner label="Đang tải..." />}>
            <EditProfile onDone={() => setEditing(false)} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ width: 140, fontSize: 13, color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#1e293b' }}>{value || '—'}</span>
    </div>
  );
}
