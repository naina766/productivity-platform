import type { Theme } from '@/types';

export function toggleTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const nextTheme: Theme = isDark ? 'light' : 'dark';

  if (nextTheme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  try {
    window.localStorage.setItem('nova-theme', nextTheme);
    window.dispatchEvent(new CustomEvent('nova-theme-change', { detail: nextTheme }));
  } catch {
    // LocalStorage might fail in private browsing
  }

  return nextTheme;
}
