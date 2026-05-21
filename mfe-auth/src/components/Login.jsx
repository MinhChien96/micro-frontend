import React, { useState } from 'react';
// Import trực tiếp từ shared MFE — webpack resolve qua Module Federation
import { useAuthStore } from 'shared/authStore';
import '../styles.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy action login từ shared store
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    if (email === 'demo@test.com' && password === '123456') {
      // Ghi thẳng vào store — shell và mọi MFE khác thấy ngay lập tức
      // Không cần window.dispatchEvent, không cần callback từ shell
      login({ name: 'Demo User', email, role: 'admin' });
    } else {
      setError('Invalid credentials. Try demo@test.com / 123456');
    }

    setLoading(false);
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon">🔐</div>
        <h2>Welcome back</h2>
        <p>Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="demo@test.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="123456"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-hint">
        Demo: <code>demo@test.com</code> / <code>123456</code>
      </div>
    </div>
  );
}
