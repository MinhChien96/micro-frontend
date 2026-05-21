// Debug view — chạy standalone để xem state của toàn hệ thống
import React from 'react';
import { useAuthStore } from './store/authStore';
import { useAccountStore } from './store/accountStore';

export default function App() {
  const user = useAuthStore((s) => s.user);
  const accounts = useAccountStore((s) => s.accounts);
  const totalBalance = useAccountStore((s) => s.getTotalBalance());

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#58a6ff', marginBottom: 16 }}>
        🔍 Shared Store — Debug View
      </h2>
      <pre style={{ background: '#161b22', padding: 16, borderRadius: 8, fontSize: 13 }}>
        {JSON.stringify({ user, accounts, totalBalance }, null, 2)}
      </pre>
      <p style={{ color: '#8b949e', marginTop: 12, fontSize: 12 }}>
        Khi chạy standalone, store này không nhận event từ các MFE khác.
        <br />
        Trong hệ thống thực, mọi thay đổi từ mfe-auth/mfe-accounts sẽ hiển thị ở đây.
      </p>
    </div>
  );
}
