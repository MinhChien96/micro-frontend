import React, { useState, useEffect } from 'react';
import { getUser, isAuthenticated, getPermissions } from '../auth';
import { Button, StatusBadge, Card, CardHeader, SkeletonCard, PageSpinner } from '../ui';

function AuthDebugView() {
  const [data, setData] = useState(() => ({
    user:        getUser(),
    token:       isAuthenticated() ? '(present)' : null,
    permissions: getPermissions(),
  }));

  useEffect(() => {
    const handler = () => setData({
      user:        getUser(),
      token:       isAuthenticated() ? '(present)' : null,
      permissions: getPermissions(),
    });
    window.addEventListener('auth:changed', handler);
    return () => window.removeEventListener('auth:changed', handler);
  }, []);

  return (
    <pre style={{ background: '#161b22', padding: 16, borderRadius: 8, fontSize: 13, color: '#e6edf3' }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function Page() {
  return (
    <div style={{ padding: 24, display: 'grid', gap: 24 }}>
      <div style={{
        padding: '8px 14px', borderRadius: 8,
        background: '#dcfce7', color: '#166534', fontSize: 12, fontWeight: 600,
      }}>
        Standalone — shared :3004 · Modern.js · UI library + auth helpers
      </div>

      <section>
        <h2 style={{ color: '#58a6ff', marginBottom: 16 }}>🎨 UI Components</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button onClick={() => {}} icon={null}>Primary</Button>
          <Button variant="secondary" onClick={() => {}} icon={null}>Secondary</Button>
          <StatusBadge label="Hoạt động" color="green" />
          <StatusBadge label="Chờ duyệt" color="blue" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginTop: 16 }}>
          <Card onClick={undefined} style={undefined}>
            <CardHeader title="Card demo" subtitle="shared/ui" action={null} />
            <p style={{ fontSize: 13 }}>Nội dung card mẫu.</p>
          </Card>
          <SkeletonCard />
        </div>
        <div style={{ marginTop: 16 }}>
          <PageSpinner label="PageSpinner demo..." />
        </div>
      </section>

      <section>
        <h2 style={{ color: '#58a6ff', marginBottom: 16 }}>🔍 Shared Auth — Debug View</h2>
        <AuthDebugView />
        <p style={{ color: '#8b949e', marginTop: 12, fontSize: 12 }}>
          Dữ liệu đọc từ localStorage — cập nhật realtime khi auth:changed event được dispatch.
        </p>
      </section>
    </div>
  );
}
