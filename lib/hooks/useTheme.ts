import { useState, useEffect } from 'react';
import type { Theme } from '@/types';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  // Synchronize with localStorage after mount to avoid SSR hydration mismatch
  useEffect(() => {
    const stored = localStorage.getItem('nova-theme') as Theme | null;
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let isDark = true;
      if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = theme === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();
    localStorage.setItem('nova-theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  return { theme, setTheme };
}