import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react';
import { setTheme, useGlobalStore } from './stores/global.store';

interface ThemeValue {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeValue>({ isDark: false, toggle: () => {} });

// Theme state sống trong global store (persist localStorage, giữ qua logout);
// provider chỉ còn nhiệm vụ phản chiếu vào [data-theme] cho Tailwind dark variant.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useGlobalStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = useMemo<ThemeValue>(
    () => ({
      isDark: theme === 'dark',
      toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = (): ThemeValue => useContext(ThemeContext);
