import { createContext, useCallback, useContext, useEffect, useState } from 'react';

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

const ToastContext = createContext(null);

const TYPE = {
  success: { background: '#22c55e', icon: '✓' },
  error: { background: '#ef4444', icon: '✕' },
  warning: { background: '#f59e0b', icon: '⚠' },
  info: { background: '#667eea', icon: 'ℹ' },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    injectKeyframes();
  }, []);

  const show = useCallback((message, type = 'info', duration = 3000) => {
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
          const t = TYPE[type] || TYPE.info;
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

export function useToast() {
  const ctx = useContext(ToastContext);
  // Return a noop when running in standalone MFE dev mode (no shell ToastProvider).
  if (!ctx) return { show: () => {} };
  return ctx;
}
