import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import type { Theme } from '../types';

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onThemeChange }) => {
  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className="inline-flex items-center p-1 rounded-full bg-neutral-900/60 dark:bg-neutral-900/80 border border-neutral-800 dark:border-white/8 backdrop-blur-md"
    >
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'light'}
        aria-label="Light theme"
        onClick={() => onThemeChange('light')}
        className={`p-1.5 rounded-full transition-all duration-200 text-xs flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          theme === 'light'
            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === 'dark'}
        aria-label="Dark theme"
        onClick={() => onThemeChange('dark')}
        className={`p-1.5 rounded-full transition-all duration-200 text-xs flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          theme === 'dark'
            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === 'system'}
        aria-label="System theme"
        onClick={() => onThemeChange('system')}
        className={`p-1.5 rounded-full transition-all duration-200 text-xs flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          theme === 'system'
            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
