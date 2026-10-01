'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';

interface GlobalSearchTriggerProps {
  className?: string;
  compact?: boolean;
}

export function GlobalSearchTrigger({ className = '', compact = false }: GlobalSearchTriggerProps) {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent));

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        id="global-search-btn"
        type="button"
        onClick={() => setOpen(true)}
        className={`group inline-flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-main)] hover:bg-[var(--bg-secondary)] hover:border-[var(--text-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-xs font-medium ${className}`}
        aria-label="Search workspace (Ctrl+K)"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          {!compact && <span>Search workspace...</span>}
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
          <span>{isMac ? '⌘' : 'Ctrl'}</span>
          <span>K</span>
        </kbd>
      </button>

      <GlobalSearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
