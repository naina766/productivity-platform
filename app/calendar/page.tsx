'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Plus,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { apiGetCalendarTasks, apiGetProjects } from '@/lib/api/client';
import { CalendarView } from '@/components/calendar/CalendarView';
import { formatDateKey } from '@/lib/calendar/calendar-utils';
import { TaskDetailPanel } from '@/components/tasks/TaskDetail';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import type {
  MyTaskSummary,
  TaskSummary,
  TaskDetail,
  TaskStatus,
  TaskPriority,
} from '@/types/task';
import {
  ALL_TASK_STATUSES,
  ALL_TASK_PRIORITIES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from '@/types/task';
import type { ProjectSummary } from '@/types/project';

export default function CalendarPage() {
  const router = useRouter();
  const { workspace, loading, isAuthenticated } = useAuth();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const [tasks, setTasks] = useState<MyTaskSummary[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');

  // Detail panel and create dialog states
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTargetDate, setCreateTargetDate] = useState<Date | null>(null);
  const [createProjectId, setCreateProjectId] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Load workspace projects
  useEffect(() => {
    if (!loading && isAuthenticated && workspace?.id) {
      apiGetProjects(workspace.id)
        .then((res) => {
          setProjects(res.data);
          if (res.data.length > 0) {
            setCreateProjectId(res.data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [loading, isAuthenticated, workspace?.id]);

  // Fetch calendar tasks for current view range
  const fetchCalendarTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setTasksLoading(true);
    setTasksError(null);

    try {
      // Calculate date boundary: 1 month before to 1 month after
      const startRange = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const endRange = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);

      const res = await apiGetCalendarTasks({
        start: startRange.toISOString(),
        end: endRange.toISOString(),
        projectId: selectedProjectId === 'ALL' ? undefined : selectedProjectId,
        assigneeId:
          selectedAssignee === 'me'
            ? 'me'
            : selectedAssignee === 'unassigned'
            ? 'unassigned'
            : undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
      });

      setTasks(res.data);
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : 'Failed to load calendar tasks.');
    } finally {
      setTasksLoading(false);
    }
  }, [
    isAuthenticated,
    currentDate,
    selectedProjectId,
    selectedAssignee,
    statusFilter,
    priorityFilter,
  ]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      void fetchCalendarTasks();
    }
  }, [loading, isAuthenticated, fetchCalendarTasks]);

  const handleTaskClick = useCallback((task: TaskSummary) => {
    setSelectedTask(task as TaskDetail);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setCreateTargetDate(date);
    setCreateOpen(true);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-600/5 blur-[160px] rounded-full"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-xl bg-[var(--card-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-all"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Calendar</h1>
                <p className="text-xs text-[var(--text-muted)]">
                  {workspace ? workspace.name : 'Personal Workspace'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation bar & Quick Links */}
          <div className="flex items-center gap-2 flex-wrap">
            <nav className="hidden md:flex items-center gap-1 text-xs">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-main)] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/my-tasks"
                className="px-3 py-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-main)] transition-colors"
              >
                My Tasks
              </Link>
              <Link
                href="/my-tasks?view=today"
                className="px-3 py-1.5 rounded-xl text-[var(--text-secondary)] hover:text-lime-400 hover:bg-[var(--card-main)] transition-colors"
              >
                Today
              </Link>
              <Link
                href="/my-tasks?view=upcoming"
                className="px-3 py-1.5 rounded-xl text-[var(--text-secondary)] hover:text-teal-400 hover:bg-[var(--card-main)] transition-colors"
              >
                Upcoming
              </Link>
              <Link
                href="/my-tasks?view=overdue"
                className="px-3 py-1.5 rounded-xl text-[var(--text-secondary)] hover:text-red-400 hover:bg-[var(--card-main)] transition-colors"
              >
                Overdue
              </Link>
              <span className="px-3 py-1.5 rounded-xl font-semibold bg-[var(--card-main)] text-emerald-400 border border-[var(--border-color)]">
                Calendar
              </span>
            </nav>

            <NotificationBell />

            {projects.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCreateTargetDate(new Date());
                  setCreateOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] mr-1">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Filters:</span>
            </div>

            {/* Project Filter */}
            {projects.length > 1 && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
              >
                <option value="ALL">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            {/* Assignee Filter */}
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
            >
              <option value="ALL">All Assignees</option>
              <option value="me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
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
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
            >
              <option value="ALL">All Priorities</option>
              {ALL_TASK_PRIORITIES.map((pr) => (
                <option key={pr} value={pr}>
                  {TASK_PRIORITY_LABELS[pr]}
                </option>
              ))}
            </select>

            {tasksLoading && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>Updating calendar...</span>
              </div>
            )}
          </div>
        </div>

        {/* Error message if any */}
        {tasksError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{tasksError}</span>
            </div>
            <button
              type="button"
              onClick={() => void fetchCalendarTasks()}
              className="underline hover:no-underline font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Calendar View Component */}
        <CalendarView
          tasks={tasks}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onTaskClick={handleTaskClick}
          onDayClick={handleDayClick}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          open={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {
            router.push(`/projects/${selectedTask.projectId}`);
          }}
          canModerate={false}
        />
      )}

      {/* Create Task Dialog */}
      {createOpen && createProjectId && (
        <CreateTaskDialog
          projectId={createProjectId}
          initialDueDate={createTargetDate ? formatDateKey(createTargetDate) : undefined}
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
            setCreateTargetDate(null);
          }}
          onCreated={() => {
            void fetchCalendarTasks();
          }}
        />
      )}
    </main>
  );
}
