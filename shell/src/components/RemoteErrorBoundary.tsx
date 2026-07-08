import { captureException } from '@app/common/observability';
import React from 'react';

const MAX_RETRIES = 3;

interface Props {
  remote: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  retryKey: number;
}

export default class RemoteErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null, retryCount: 0, retryKey: 0 };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Gửi Sentry kèm tên remote (no-op nếu chưa cấu hình DSN)
    captureException(error, { remote: this.props.remote });
  }

  handleRetry = () => {
    this.setState((s) => ({
      hasError: false,
      error: null,
      retryCount: s.retryCount + 1,
      retryKey: s.retryKey + 1, // forces Suspense+lazy subtree to remount
    }));
  };

  render() {
    const { hasError, error, retryCount, retryKey } = this.state;

    if (hasError) {
      const attemptsLeft = MAX_RETRIES - retryCount;
      return (
        <div className="error-box">
          <strong>Không thể tải MFE</strong> — remote <code>{this.props.remote}</code> có đang chạy
          không?
          <br />
          <small style={{ opacity: 0.7 }}>{error?.message}</small>
          <br />
          {attemptsLeft > 0 ? (
            <button
              onClick={this.handleRetry}
              style={{
                marginTop: 10,
                padding: '6px 16px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                background: '#fff',
                fontSize: 13,
              }}
            >
              Thử lại ({attemptsLeft} lần còn lại)
            </button>
          ) : (
            <div style={{ marginTop: 10 }}>
              <small style={{ color: '#ef4444', display: 'block', marginBottom: 8 }}>
                ⚡ Circuit open — Remote không phản hồi sau {MAX_RETRIES} lần thử.
              </small>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 13,
                }}
              >
                Tải lại trang
              </button>
            </div>
          )}
        </div>
      );
    }

    // Keyed fragment forces the Suspense+lazy subtree to remount on retry.
    return <React.Fragment key={retryKey}>{this.props.children}</React.Fragment>;
  }
}
