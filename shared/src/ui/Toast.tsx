import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

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

const TYPE: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: 'bg-green-500', icon: '✓' },
  error: { bg: 'bg-red-500', icon: '✕' },
  warning: { bg: 'bg-amber-500', icon: '⚠' },
  info: { bg: 'bg-primary', icon: 'ℹ' },
};

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

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
      <div className="pointer-events-none fixed top-5 right-5 z-[9999] flex flex-col gap-2">
        {toasts.map(({ id, message, type }) => {
          const t = TYPE[type] ?? TYPE.info;
          return (
            <div
              key={id}
              className={`pointer-events-auto flex max-w-[380px] min-w-[240px] animate-toast-in items-center gap-2.5 rounded-[10px] px-4.5 py-3 text-sm font-medium text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] ${t.bg}`}
            >
              <span className="text-base">{t.icon}</span>
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
