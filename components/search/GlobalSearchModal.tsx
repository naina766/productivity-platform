'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  SquareKanban,
  FolderGit2,
  Flag,
  User,
  Calendar,
  Loader2,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';
import { apiGlobalSearch } from '@/lib/api/client';
import type {
  GlobalSearchResults,
  SearchCategory,
  SearchTaskResult,
  SearchProjectResult,
  SearchMilestoneResult,
  SearchMemberResult,
} from '@/types/search';
import { TASK_STATUS_LABELS } from '@/types/task';
import { useAuth } from '@/components/auth/AuthContext';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

type FlatItem =
  | { type: 'task'; data: SearchTaskResult }
  | { type: 'project'; data: SearchProjectResult }
  | { type: 'milestone'; data: SearchMilestoneResult }
  | { type: 'member'; data: SearchMemberResult };

export function GlobalSearchModal({ open, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { workspace } = useAuth();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setCategory('all');
      setResults(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search effect with debounce
  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await apiGlobalSearch({
          q: trimmed,
          workspaceId: workspace?.id,
          category,
          limit: 8,
        });
        setResults(res.data);
        setSelectedIndex(0);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, category, workspace?.id, open]);

  // Flatten active items for keyboard navigation
  const flatItems: FlatItem[] = React.useMemo(() => {
    if (!results) return [];
    const list: FlatItem[] = [];

    if (category === 'all' || category === 'tasks') {
      results.tasks.forEach((t) => list.push({ type: 'task', data: t }));
    }
    if (category === 'all' || category === 'projects') {
      results.projects.forEach((p) => list.push({ type: 'project', data: p }));
    }
    if (category === 'all' || category === 'milestones') {
      results.milestones.forEach((m) => list.push({ type: 'milestone', data: m }));
    }
    if (category === 'all' || category === 'members') {
      results.members.forEach((m) => list.push({ type: 'member', data: m }));
    }

    return list;
  }, [results, category]);

  const handleSelectItem = useCallback((item: FlatItem) => {
    onClose();
    switch (item.type) {
      case 'task':
        router.push(`/projects/${item.data.projectId}?task=${item.data.id}`);
        break;
      case 'project':
        router.push(`/projects/${item.data.id}`);
        break;
      case 'milestone':
        router.push(`/projects/${item.data.projectId}?milestone=${item.data.id}`);
        break;
      case 'member':
        // Stay on page or filter by member
        break;
    }
  }, [router, onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (flatItems.length > 0 ? (prev + 1) % flatItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          flatItems.length > 0 ? (prev - 1 + flatItems.length) % flatItems.length : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flatItems[selectedIndex];
        if (selected) {
          handleSelectItem(selected);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [flatItems, selectedIndex, handleSelectItem, onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onKeyDown={handleKeyDown}
            className="relative w-full max-w-2xl bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)]">
              <Search className="w-5 h-5 text-emerald-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, projects, milestones, members..."
                className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-base outline-none"
              />
              {loading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--text-muted)] border border-[var(--border-color)] rounded-md px-1.5 py-0.5 font-mono">
                <span>ESC</span>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/40 overflow-x-auto text-xs">
              {(
                [
                  { id: 'all' as const, label: 'All', count: results?.totalCount },
                  { id: 'tasks' as const, label: 'Tasks', count: results?.tasks.length },
                  { id: 'projects' as const, label: 'Projects', count: results?.projects.length },
                  { id: 'milestones' as const, label: 'Milestones', count: results?.milestones.length },
                  { id: 'members' as const, label: 'Members', count: results?.members.length },
                ]
              ).map((cat) => {
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-main)]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {typeof cat.count === 'number' && cat.count > 0 && (
                      <span className="ml-1 text-[10px] opacity-75">({cat.count})</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Results Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {!query.trim() ? (
                <div className="py-12 text-center text-[var(--text-muted)]">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Search your workspace</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Find tasks, projects, milestones, or teammates instantly.
                  </p>
                </div>
              ) : flatItems.length === 0 && !loading ? (
                <div className="py-12 text-center text-[var(--text-muted)]">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">No results found</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    No items match &quot;{query.trim()}&quot;
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {flatItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;

                    return (
                      <button
                        key={`${item.type}-${item.data.id}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/10 text-[var(--text-primary)]'
                            : 'hover:bg-[var(--card-main)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              item.type === 'task'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : item.type === 'project'
                                ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                                : item.type === 'milestone'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                            }`}
                          >
                            {item.type === 'task' && <SquareKanban className="w-4 h-4" />}
                            {item.type === 'project' && <FolderGit2 className="w-4 h-4" />}
                            {item.type === 'milestone' && <Flag className="w-4 h-4" />}
                            {item.type === 'member' && <User className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate text-[var(--text-primary)]">
                                {item.type === 'task' && item.data.title}
                                {item.type === 'project' && item.data.name}
                                {item.type === 'milestone' && item.data.title}
                                {item.type === 'member' && item.data.name}
                              </span>
                              {item.type === 'task' && (
                                <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded shrink-0">
                                  {TASK_STATUS_LABELS[item.data.status]}
                                </span>
                              )}
                              {item.type === 'task' && item.data.milestoneTitle && (
                                <span className="text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded shrink-0 truncate max-w-[100px]">
                                  {item.data.milestoneTitle}
                                </span>
                              )}
                              {item.type === 'member' && (
                                <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded shrink-0">
                                  {item.data.role}
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-[var(--text-muted)] truncate mt-0.5 flex items-center gap-2">
                              {item.type === 'task' && (
                                <span>In project {item.data.projectName}</span>
                              )}
                              {item.type === 'project' && (
                                <span>{item.data.description || 'Project'} • {item.data.memberCount} members</span>
                              )}
                              {item.type === 'milestone' && (
                                <span>In project {item.data.projectName}</span>
                              )}
                              {item.type === 'member' && (
                                <span>{item.data.email}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.type === 'task' && item.data.dueDate && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.data.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                          <ArrowRight
                            className={`w-4 h-4 transition-transform ${
                              isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-transparent'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer keyboard hints */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[11px] text-[var(--text-muted)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-[var(--card-main)] border border-[var(--border-color)] font-mono text-[10px]">
                    ↑↓
                  </span>
                  <span>to navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-[var(--card-main)] border border-[var(--border-color)] font-mono text-[10px]">
                    ↵
                  </span>
                  <span>to open</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Command className="w-3 h-3 text-emerald-400" />
                <span className="font-medium text-emerald-400">NOVA Search</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
