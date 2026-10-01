'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  LayoutDashboard,
  ListTodo,
  Clock,
  AlertTriangle,
  SunMoon,
  HelpCircle,
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
import { toggleTheme } from '@/lib/theme';

export type ExtendedCategory = SearchCategory | 'commands';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenShortcuts?: () => void;
}

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'navigation' | 'actions';
  shortcut?: string[];
  icon: React.ReactNode;
  run: () => void | Promise<void>;
  keywords: string[];
}

type PaletteItem =
  | { kind: 'command'; data: CommandItem }
  | { kind: 'task'; data: SearchTaskResult }
  | { kind: 'project'; data: SearchProjectResult }
  | { kind: 'milestone'; data: SearchMilestoneResult }
  | { kind: 'member'; data: SearchMemberResult };

export function CommandPalette({ open, onClose, onOpenShortcuts }: CommandPaletteProps) {
  const router = useRouter();
  const { workspace } = useAuth();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ExtendedCategory>('all');
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Available built-in commands
  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'cmd-dashboard',
        title: 'Go to Dashboard',
        description: 'Overview of workspace projects and activity metrics',
        category: 'navigation',
        shortcut: ['G', 'D'],
        icon: <LayoutDashboard className="w-4 h-4 text-emerald-400" />,
        run: () => router.push('/dashboard'),
        keywords: ['dashboard', 'home', 'overview', 'projects'],
      },
      {
        id: 'cmd-my-tasks',
        title: 'Go to My Tasks',
        description: 'View all tasks assigned to your account',
        category: 'navigation',
        shortcut: ['G', 'M'],
        icon: <ListTodo className="w-4 h-4 text-emerald-400" />,
        run: () => router.push('/my-tasks'),
        keywords: ['tasks', 'my tasks', 'assigned', 'mine', 'work'],
      },
      {
        id: 'cmd-today',
        title: "Go to Today's Tasks",
        description: 'Tasks scheduled or due by end of today',
        category: 'navigation',
        shortcut: ['G', 'T'],
        icon: <Clock className="w-4 h-4 text-amber-400" />,
        run: () => router.push('/tasks/today'),
        keywords: ['today', 'due today', 'tasks', 'urgent', 'now'],
      },
      {
        id: 'cmd-upcoming',
        title: 'Go to Upcoming Tasks',
        description: 'Tasks scheduled for tomorrow and upcoming weeks',
        category: 'navigation',
        shortcut: ['G', 'U'],
        icon: <Calendar className="w-4 h-4 text-blue-400" />,
        run: () => router.push('/tasks/upcoming'),
        keywords: ['upcoming', 'future', 'next', 'schedule', 'planning'],
      },
      {
        id: 'cmd-overdue',
        title: 'Go to Overdue Tasks',
        description: 'Tasks past their due date requiring immediate attention',
        category: 'navigation',
        shortcut: ['G', 'O'],
        icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
        run: () => router.push('/tasks/overdue'),
        keywords: ['overdue', 'late', 'past due', 'delayed', 'urgent'],
      },
      {
        id: 'cmd-calendar',
        title: 'Go to Calendar',
        description: 'Interactive monthly & weekly workspace calendar view',
        category: 'navigation',
        shortcut: ['G', 'C'],
        icon: <Calendar className="w-4 h-4 text-purple-400" />,
        run: () => router.push('/calendar'),
        keywords: ['calendar', 'month', 'week', 'schedule', 'deadlines'],
      },
      {
        id: 'cmd-toggle-theme',
        title: 'Toggle Dark / Light Theme',
        description: 'Switch between dark and light appearance modes',
        category: 'actions',
        shortcut: ['T', 'T'],
        icon: <SunMoon className="w-4 h-4 text-amber-300" />,
        run: () => {
          toggleTheme();
        },
        keywords: ['theme', 'dark', 'light', 'mode', 'color', 'appearance'],
      },
      {
        id: 'cmd-shortcuts',
        title: 'Keyboard Shortcuts Cheatsheet',
        description: 'View all keyboard shortcuts and navigation commands',
        category: 'actions',
        shortcut: ['?'],
        icon: <HelpCircle className="w-4 h-4 text-cyan-400" />,
        run: () => {
          if (onOpenShortcuts) onOpenShortcuts();
        },
        keywords: ['keyboard', 'shortcuts', 'help', 'hotkeys', 'cheatsheet', '?'],
      },
    ],
    [router, onOpenShortcuts]
  );

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
          category: category === 'commands' ? 'all' : category,
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

  // Filter commands by query
  const matchingCommands = useMemo(() => {
    if (category !== 'all' && category !== 'commands') return [];
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return commands;
    return commands.filter((cmd) => {
      return (
        cmd.title.toLowerCase().includes(trimmed) ||
        cmd.description.toLowerCase().includes(trimmed) ||
        cmd.keywords.some((k) => k.includes(trimmed))
      );
    });
  }, [commands, query, category]);

  // Flatten active items for keyboard selection
  const flatItems: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [];

    // Commands first
    if (category === 'all' || category === 'commands') {
      matchingCommands.forEach((cmd) => list.push({ kind: 'command', data: cmd }));
    }

    // Results from search
    if (results) {
      if (category === 'all' || category === 'tasks') {
        results.tasks.forEach((t) => list.push({ kind: 'task', data: t }));
      }
      if (category === 'all' || category === 'projects') {
        results.projects.forEach((p) => list.push({ kind: 'project', data: p }));
      }
      if (category === 'all' || category === 'milestones') {
        results.milestones.forEach((m) => list.push({ kind: 'milestone', data: m }));
      }
      if (category === 'all' || category === 'members') {
        results.members.forEach((m) => list.push({ kind: 'member', data: m }));
      }
    }

    return list;
  }, [matchingCommands, results, category]);

  const handleSelectItem = useCallback(
    (item: PaletteItem) => {
      onClose();
      switch (item.kind) {
        case 'command':
          item.data.run();
          break;
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
          // Keep member reference
          break;
      }
    },
    [router, onClose]
  );

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (flatItems.length > 0 ? (prev + 1) % flatItems.length : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (flatItems.length > 0 ? (prev - 1 + flatItems.length) % flatItems.length : 0));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          handleSelectItem(flatItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, flatItems, selectedIndex, onClose, handleSelectItem]);

  const hasAnyResults = flatItems.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette and Search"
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6"
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
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-[var(--card-main)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-[var(--border-color)] gap-3 bg-[var(--bg-secondary)]/40">
              <Search className="w-5 h-5 text-emerald-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search tasks, projects, milestones..."
                className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none"
              />
              {loading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />}
              {query && !loading && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-1 shrink-0">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--card-main)] border border-[var(--border-color)] rounded">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-[var(--border-color)]/60 bg-[var(--bg-secondary)]/20 overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'commands', label: 'Commands' },
                  { id: 'tasks', label: 'Tasks' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'milestones', label: 'Milestones' },
                  { id: 'members', label: 'Members' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors shrink-0 ${
                    category === tab.id
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Items List */}
            <div className="overflow-y-auto p-2 space-y-1 flex-1">
              {!hasAnyResults && !loading && query && (
                <div className="text-center py-12 px-4">
                  <Command className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-[var(--text-primary)]">No matching results found</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Try searching with another keyword or change the filter category.
                  </p>
                </div>
              )}

              {/* Render Flat List */}
              {flatItems.map((item, index) => {
                const isSelected = index === selectedIndex;

                if (item.kind === 'command') {
                  const cmd = item.data;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-[var(--text-primary)]'
                          : 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center shrink-0">
                          {cmd.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate text-[var(--text-primary)]">
                            {cmd.title}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            {cmd.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {cmd.shortcut && (
                          <div className="flex items-center gap-1">
                            {cmd.shortcut.map((k, i) => (
                              <kbd
                                key={i}
                                className="px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded"
                              >
                                {k}
                              </kbd>
                            ))}
                          </div>
                        )}
                        <ArrowRight
                          className={`w-3.5 h-3.5 transition-opacity ${
                            isSelected ? 'opacity-100 text-emerald-400' : 'opacity-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                }

                if (item.kind === 'task') {
                  const task = item.data;
                  return (
                    <div
                      key={`task-${task.id}`}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-[var(--text-primary)]'
                          : 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                          <SquareKanban className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium truncate text-[var(--text-primary)]">
                              {task.title}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                              {TASK_STATUS_LABELS[task.status] ?? task.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            Project: {task.projectName}
                            {task.assigneeName ? ` • ${task.assigneeName}` : ''}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                          isSelected ? 'opacity-100 text-emerald-400' : 'opacity-0'
                        }`}
                      />
                    </div>
                  );
                }

                if (item.kind === 'project') {
                  const proj = item.data;
                  return (
                    <div
                      key={`project-${proj.id}`}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-[var(--text-primary)]'
                          : 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium truncate text-[var(--text-primary)]">
                              {proj.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {proj.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            {proj.description || 'Project'} • {proj.memberCount} members
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                          isSelected ? 'opacity-100 text-blue-400' : 'opacity-0'
                        }`}
                      />
                    </div>
                  );
                }

                if (item.kind === 'milestone') {
                  const ms = item.data;
                  return (
                    <div
                      key={`milestone-${ms.id}`}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-[var(--text-primary)]'
                          : 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                          <Flag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium truncate text-[var(--text-primary)]">
                              {ms.title}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {ms.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            Project: {ms.projectName}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                          isSelected ? 'opacity-100 text-amber-400' : 'opacity-0'
                        }`}
                      />
                    </div>
                  );
                }

                if (item.kind === 'member') {
                  const m = item.data;
                  return (
                    <div
                      key={`member-${m.id}`}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-[var(--text-primary)]'
                          : 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium truncate text-[var(--text-primary)]">
                              {m.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {m.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            {m.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                        Workspace member
                      </span>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Footer Hints */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-color)] text-[11px] text-[var(--text-secondary)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 font-mono text-[10px] bg-[var(--card-main)] border border-[var(--border-color)] rounded">
                    ↑
                  </kbd>
                  <kbd className="px-1 py-0.2 font-mono text-[10px] bg-[var(--card-main)] border border-[var(--border-color)] rounded">
                    ↓
                  </kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.2 font-mono text-[10px] bg-[var(--card-main)] border border-[var(--border-color)] rounded">
                    ↵
                  </kbd>
                  <span>execute</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.2 font-mono text-[10px] bg-[var(--card-main)] border border-[var(--border-color)] rounded">
                    ?
                  </kbd>
                  <span>shortcuts</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                NOVA Command
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
