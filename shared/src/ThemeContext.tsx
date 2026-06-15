import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from './auth';

interface ThemeValue {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeValue>({ isDark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  // SSR guard: initializer chạy cả trên server → không đọc localStorage khi thiếu window
  const [isDark, setIsDark] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.theme) === 'dark',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => setIsDark((d) => !d);

  return <ThemeContext.Provider value={{ isDark, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = (): ThemeValue => useContext(ThemeContext);
