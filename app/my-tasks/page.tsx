'use client';

import { Suspense, useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  Search,
  Loader2,
  AlertCircle,
  Download,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { apiGetMyTasks } from '@/lib/api/client';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetailPanel } from '@/components/tasks/TaskDetail';
import { ExportTasksDialog } from '@/components/export/ExportTasksDialog';
import { AppNavbar } from '@/components/layout/AppNavbar';
import type {
  MyTaskSummary,
  TaskSummary,
  TaskDetail,
  TaskDateView,
  TaskStatus,
  TaskPriority,
  TaskViewCounts,
} from '@/types/task';
import {
  ALL_TASK_STATUSES,
  ALL_TASK_PRIORITIES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from '@/types/task';

function MyTasksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspace, loading, isAuthenticated } = useAuth();

  const initialView = (searchParams.get('view') as TaskDateView) || 'all';
  const [activeView, setActiveView] = useState<TaskDateView>(
    ['all', 'today', 'upcoming', 'overdue'].includes(initialView) ? initialView : 'all'
  );

  const [tasks, setTasks] = useState<MyTaskSummary[]>([]);
  const [counts, setCounts] = useState<TaskViewCounts>({
    all: 0,
    today: 0,
    upcoming: 0,
    overdue: 0,
  });
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');

  // Selected task for detail panel
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);

  // Export dialog
  const [exportOpen, setExportOpen] = useState(false);
  const [allUserTasks, setAllUserTasks] = useState<MyTaskSummary[]>([]);

  // Sync activeView with URL param if it changes
  useEffect(() => {
    const viewParam = searchParams.get('view') as TaskDateView | null;
    if (viewParam && ['all', 'today', 'upcoming', 'overdue'].includes(viewParam)) {
      setActiveView(viewParam);
    }
  }, [searchParams]);

  const handleViewChange = useCallback(
    (view: TaskDateView) => {
      setActiveView(view);
      const url = view === 'all' ? '/my-tasks' : `/my-tasks?view=${view}`;
      router.push(url, { scroll: false });
    },
    [router]
  );

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingTasks(true);
    setError(null);
    try {
      const tzOffset = new Date().getTimezoneOffset();
      const res = await apiGetMyTasks({
        view: activeView,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
        projectId: selectedProjectId === 'ALL' ? undefined : selectedProjectId,
        search: searchQuery.trim() || undefined,
        timezoneOffset: tzOffset,
      });

      setTasks(res.data);
      if (res.counts) {
        setCounts(res.counts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setLoadingTasks(false);
    }
  }, [isAuthenticated, activeView, statusFilter, priorityFilter, selectedProjectId, searchQuery]);

  // Auth redirect
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Load tasks when ready or when view/filters change
  useEffect(() => {
    if (!loading && isAuthenticated) {
      void fetchTasks();
    }
  }, [loading, isAuthenticated, fetchTasks]);

  // Unique projects from current task dataset
  const availableProjects = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.projectId && t.projectName) {
        map.set(t.projectId, t.projectName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const handleTaskClick = useCallback((task: TaskSummary) => {
    setSelectedTask(task as TaskDetail);
  }, []);

  const handleOpenExport = useCallback(async () => {
    setExportOpen(true);
    const hasFilters = Boolean(
      activeView !== 'all' ||
      statusFilter !== 'ALL' ||
      priorityFilter !== 'ALL' ||
      selectedProjectId !== 'ALL' ||
      searchQuery.trim()
    );
    if (hasFilters) {
      try {
        const res = await apiGetMyTasks({ view: 'all' });
        setAllUserTasks(res.data);
      } catch {
        setAllUserTasks(tasks);
      }
    } else {
      setAllUserTasks(tasks);
    }
  }, [activeView, statusFilter, priorityFilter, selectedProjectId, searchQuery, tasks]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] relative overflow-hidden">
      <AppNavbar />

      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-600/5 blur-[160px] rounded-full"
      />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ListTodo className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">My Tasks</h1>
              <p className="text-xs text-[var(--text-muted)]">
                {workspace ? workspace.name : 'Personal Workspace'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => void handleOpenExport()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-teal-400 hover:bg-[var(--card-main)] border border-[var(--border-color)] hover:border-teal-500/30 transition-all"
              title="Export tasks to CSV or JSON"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs & Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* All Tasks Tab */}
          <button
            type="button"
            onClick={() => handleViewChange('all')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeView === 'all'
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                : 'bg-[var(--card-main)] border-[var(--border-color)] hover:border-[var(--text-muted)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                All Assigned
              </span>
              <ListTodo
                className={`w-4 h-4 ${
                  activeView === 'all' ? 'text-emerald-400' : 'text-[var(--text-muted)]'
                }`}
              />
            </div>
            <div className="text-2xl font-extrabold">{counts.all}</div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Total active tasks</p>
          </button>

          {/* Today Tab */}
          <button
            type="button"
            onClick={() => handleViewChange('today')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeView === 'today'
                ? 'bg-lime-500/10 border-lime-500/30 shadow-md shadow-lime-500/5'
                : 'bg-[var(--card-main)] border-[var(--border-color)] hover:border-[var(--text-muted)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Today
              </span>
              <Calendar
                className={`w-4 h-4 ${
                  activeView === 'today' ? 'text-lime-400' : 'text-[var(--text-muted)]'
                }`}
              />
            </div>
            <div className="text-2xl font-extrabold text-lime-400">{counts.today}</div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Due before midnight</p>
          </button>

          {/* Upcoming Tab */}
          <button
            type="button"
            onClick={() => handleViewChange('upcoming')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeView === 'upcoming'
                ? 'bg-teal-500/10 border-teal-500/30 shadow-md shadow-teal-500/5'
                : 'bg-[var(--card-main)] border-[var(--border-color)] hover:border-[var(--text-muted)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Upcoming
              </span>
              <Clock
                className={`w-4 h-4 ${
                  activeView === 'upcoming' ? 'text-teal-400' : 'text-[var(--text-muted)]'
                }`}
              />
            </div>
            <div className="text-2xl font-extrabold text-teal-400">{counts.upcoming}</div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Future deadlines</p>
          </button>

          {/* Overdue Tab */}
          <button
            type="button"
            onClick={() => handleViewChange('overdue')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeView === 'overdue'
                ? 'bg-red-500/10 border-red-500/30 shadow-md shadow-red-500/5'
                : 'bg-[var(--card-main)] border-[var(--border-color)] hover:border-[var(--text-muted)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Overdue
              </span>
              <AlertTriangle
                className={`w-4 h-4 ${
                  counts.overdue > 0
                    ? 'text-red-400 animate-pulse'
                    : activeView === 'overdue'
                    ? 'text-red-400'
                    : 'text-[var(--text-muted)]'
                }`}
              />
            </div>
            <div
              className={`text-2xl font-extrabold ${
                counts.overdue > 0 ? 'text-red-400' : 'text-[var(--text-primary)]'
              }`}
            >
              {counts.overdue}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              {counts.overdue > 0 ? 'Needs attention' : 'All clear'}
            </p>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by title or description..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
                className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
              >
                <option value="ALL">All Statuses</option>
                {ALL_TASK_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {TASK_STATUS_LABELS[st]}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'ALL')}
                className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
              >
                <option value="ALL">All Priorities</option>
                {ALL_TASK_PRIORITIES.map((pr) => (
                  <option key={pr} value={pr}>
                    {TASK_PRIORITY_LABELS[pr]}
                  </option>
                ))}
              </select>

              {/* Project Filter (if tasks from multiple projects exist) */}
              {availableProjects.length > 1 && (
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="ALL">All Projects</option>
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Content State: Loading, Error, Empty, or List */}
        {loadingTasks ? (
          <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
            <p className="text-sm text-[var(--text-muted)]">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-[var(--card-main)] border border-red-500/20 p-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-3">{error}</p>
            <button
              type="button"
              onClick={() => void fetchTasks()}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-500/20"
            >
              Retry
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-12 text-center">
            {activeView === 'overdue' ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  Zero Overdue Tasks
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  You are completely on schedule! All assigned tasks are on track.
                </p>
              </>
            ) : activeView === 'today' ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-lime-400" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  No Tasks Due Today
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Nothing scheduled for today. Take this opportunity to plan ahead or review upcoming deadlines.
                </p>
              </>
            ) : activeView === 'upcoming' ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  No Upcoming Tasks
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  There are no scheduled future deadlines assigned to you right now.
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-3">
                  <ListTodo className="w-6 h-6 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  No Tasks Found
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                    ? 'No tasks matched your active filter criteria.'
                    : 'You currently have no tasks assigned in this workspace.'}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
              <span>
                Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </span>
              <span className="capitalize">{activeView} view</span>
            </div>
            <TaskList tasks={tasks} onTaskClick={handleTaskClick} />
          </div>
        )}

      {/* Task Detail Slide-out / Modal */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          open={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {
            // Task edit can be handled or navigate to project board
            router.push(`/projects/${selectedTask.projectId}`);
          }}
          canModerate={false}
        />
      )}

      {/* Export Tasks Dialog */}
      <ExportTasksDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        filteredTasks={tasks}
        allTasks={allUserTasks.length > 0 ? allUserTasks : tasks}
        projectName="my-tasks"
      />
      </main>
    </div>
  );
}

export default function MyTasksPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </main>
      }
    >
      <MyTasksContent />
    </Suspense>
  );
}
