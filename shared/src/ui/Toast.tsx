import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

let keyframesInjected = false;
function injectKeyframes() {
  if (keyframesInjected || typeof document === 'undefined') return;
  keyframesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes mfe-toast-in {
      from { opacity: 0; transform: translateX(100%); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
}

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

type ShowToast = (message: string, type?: ToastType, duration?: number) => number;

interface ToastContextValue {
  show: ShowToast;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE: Record<ToastType, { background: string; icon: string }> = {
  success: { background: '#22c55e', icon: '✓' },
  error: { background: '#ef4444', icon: '✕' },
  warning: { background: '#f59e0b', icon: '⚠' },
  info: { background: '#667eea', icon: 'ℹ' },
};

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    injectKeyframes();
  }, []);

  const show = useCallback<ShowToast>((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map(({ id, message, type }) => {
          const t = TYPE[type] ?? TYPE.info;
          return (
            <div
              key={id}
              style={{
                background: t.background,
                color: '#fff',
                padding: '12px 18px',
                borderRadius: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                fontWeight: 500,
                minWidth: 240,
                maxWidth: 380,
                animation: 'mfe-toast-in 0.25s ease',
                pointerEvents: 'auto',
              }}
            >
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <span>{message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  // noop khi chạy standalone MFE dev (không có shell ToastProvider)
  if (!ctx) return { show: () => 0 };
  return ctx;
}
