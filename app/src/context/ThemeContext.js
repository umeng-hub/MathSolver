import React, { createContext, useContext, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext(null);

/**
 * ThemeProvider wraps the app and exposes isDark + toggleTheme.
 * On first render the system color scheme is used as the default.
 */
export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Convenience hook – throws if used outside ThemeProvider */
export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside ThemeProvider');
  return ctx;
}
