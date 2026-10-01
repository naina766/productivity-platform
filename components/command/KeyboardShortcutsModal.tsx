'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Search, Sparkles } from 'lucide-react';
import type { ShortcutGroup } from '@/types/command';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    name: 'Navigation',
    shortcuts: [
      { description: 'Go to Dashboard', keys: ['G', 'D'] },
      { description: 'Go to My Tasks', keys: ['G', 'M'] },
      { description: 'Go to Today\'s Tasks', keys: ['G', 'T'] },
      { description: 'Go to Upcoming Tasks', keys: ['G', 'U'] },
      { description: 'Go to Overdue Tasks', keys: ['G', 'O'] },
      { description: 'Go to Calendar', keys: ['G', 'C'] },
    ],
  },
  {
    name: 'General & Search',
    shortcuts: [
      { description: 'Open Command Palette / Search', keys: ['⌘ / Ctrl', 'K'] },
      { description: 'Show Keyboard Shortcuts', keys: ['?'] },
      { description: 'Close dialog / modal', keys: ['Esc'] },
    ],
  },
  {
    name: 'Quick Actions',
    shortcuts: [
      { description: 'Toggle Dark / Light Theme', keys: ['T', 'T'] },
      { description: 'Select item in Command Palette', keys: ['↵ Enter'] },
      { description: 'Navigate up / down', keys: ['↑', '↓'] },
    ],
  },
];

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const [filter, setFilter] = useState('');

  // Reset filter when opened
  useEffect(() => {
    if (open) {
      setFilter('');
    }
  }, [open]);

  // Handle escape to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const filteredGroups = SHORTCUT_GROUPS.map((group) => {
    const matching = group.shortcuts.filter(
      (s) =>
        s.description.toLowerCase().includes(filter.toLowerCase()) ||
        s.keys.some((k) => k.toLowerCase().includes(filter.toLowerCase()))
    );
    return { ...group, shortcuts: matching };
  }).filter((group) => group.shortcuts.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard Shortcuts"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-[var(--card-main)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Work faster with NOVA quick navigation & commands
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close shortcuts dialog"
                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Input */}
            <div className="px-6 pt-3 pb-2 border-b border-[var(--border-color)]/60 bg-[var(--bg-secondary)]/30">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Filter shortcuts..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Content List */}
            <div className="overflow-y-auto px-6 py-4 space-y-6 flex-1">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--text-secondary)]">
                  No shortcuts found matching &quot;{filter}&quot;
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.name} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      {group.name}
                    </h3>
                    <div className="space-y-1.5">
                      {group.shortcuts.map((shortcut, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--bg-secondary)]/50 transition-colors text-sm"
                        >
                          <span className="text-xs text-[var(--text-primary)] font-medium">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIdx) => (
                              <React.Fragment key={keyIdx}>
                                <kbd className="px-2 py-0.5 text-[11px] font-mono font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded shadow-sm">
                                  {key}
                                </kbd>
                                {keyIdx < shortcut.keys.length - 1 && (
                                  <span className="text-[10px] text-[var(--text-secondary)] px-0.5">
                                    +
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-[var(--bg-secondary)]/40 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Press <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-[var(--card-main)] border border-[var(--border-color)] rounded">?</kbd> anytime to open this modal
              </span>
              <span>NOVA Productivity Platform</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
