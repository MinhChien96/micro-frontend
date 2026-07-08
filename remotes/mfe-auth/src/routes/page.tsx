import Login from '../components/Login';

// Standalone: Login gọi [public] endpoint nên không cần token sẵn;
// MSW + apiHost đã setup ở routes/layout.tsx.
export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 16,
          padding: '8px 14px',
          borderRadius: 8,
          background: '#fef3c7',
          color: '#92400e',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Standalone — mfe-auth :3001 · Modern.js dev mode
      </div>
      <Login />
    </div>
  );
}
