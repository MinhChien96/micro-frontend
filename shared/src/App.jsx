import React, { useState, useEffect } from 'react';
import { getUser, isAuthenticated, getPermissions } from './auth';

export default function App() {
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
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#58a6ff', marginBottom: 16 }}>
        🔍 Shared Auth — Debug View
      </h2>
      <pre style={{ background: '#161b22', padding: 16, borderRadius: 8, fontSize: 13, color: '#e6edf3' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
      <p style={{ color: '#8b949e', marginTop: 12, fontSize: 12 }}>
        Dữ liệu đọc từ localStorage — cập nhật realtime khi auth:changed event được dispatch.
      </p>
    </div>
  );
}
