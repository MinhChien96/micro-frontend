import React from 'react';
import { useRemoteMeta } from '../ManifestContext';

export default function FeatureUnavailable({ remoteName }) {
  const meta = useRemoteMeta(remoteName);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '64px 24px', textAlign: 'center',
      minHeight: 320,
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
      <h2 style={{ margin: 0, marginBottom: 8, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
        Tính năng tạm ngưng
      </h2>
      <p style={{ margin: 0, marginBottom: 24, color: '#64748b', fontSize: 14, maxWidth: 360 }}>
        Module <strong>{remoteName}</strong> đang được bảo trì hoặc chưa được kích hoạt.
        Vui lòng thử lại sau.
      </p>
      {meta && (
        <div style={{
          display: 'inline-flex', flexDirection: 'column', gap: 4,
          padding: '12px 20px', borderRadius: 10,
          background: '#f8fafc', border: '1px solid #e2e8f0',
          fontSize: 12, color: '#94a3b8', textAlign: 'left',
        }}>
          <span><strong>Team:</strong> {meta.team}</span>
          {meta.contact && <span><strong>Liên hệ:</strong> {meta.contact}</span>}
          {meta.version && <span><strong>Version:</strong> v{meta.version}</span>}
        </div>
      )}
    </div>
  );
}
