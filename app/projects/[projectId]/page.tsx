'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  ChevronLeft,
  Pencil,
  Archive,
  Loader2,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  PauseCircle,
  SquareKanban,
  Plus,
  LayoutList,
  LayoutGrid,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import {
  apiGetProject,
  apiGetTask,
  apiGetTasks,
} from '@/lib/api/client';
import { EditProjectDialog } from '@/components/projects/EditProjectDialog';
import { ArchiveProjectDialog } from '@/components/projects/ArchiveProjectDialog';
import { ExportTasksDialog } from '@/components/export/ExportTasksDialog';
import { ProjectMembers } from '@/components/projects/ProjectMembers';
import { ProjectProgressCard } from '@/components/projects/ProjectProgressCard';
import { MilestonesList } from '@/components/milestones/MilestonesList';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskList } from '@/components/tasks/TaskList';
import { CalendarView } from '@/components/calendar/CalendarView';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { SavedViewsSelector } from '@/components/views/SavedViewsSelector';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog';
import { TaskDetailPanel } from '@/components/tasks/TaskDetail';
import { useRealtimeSubscription } from '@/components/realtime/RealtimeProvider';
import type { ProjectDetail, ProjectStatus, ProjectPriority, WorkspaceRole } from '@/types/project';
import type { TaskSummary, TaskDetail, TaskStatus, TaskPriority, TaskSort } from '@/types/task';
import type { MilestoneItem } from '@/types/milestone';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { GlobalSearchTrigger } from '@/components/search/GlobalSearchTrigger';

const VALID_TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;
const VALID_TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const VALID_TASK_SORTS = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'position'] as const;

const STATUS_CONFIG: Record<ProjectStatus, { label: string; icon: React.ReactNode; className: string }> = {
  PLANNING: { label: 'Planning', icon: <Clock className="w-3.5 h-3.5" />, className: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20' },
  ACTIVE: { label: 'Active', icon: <Zap className="w-3.5 h-3.5" />, className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  ON_HOLD: { label: 'On Hold', icon: <PauseCircle className="w-3.5 h-3.5" />, className: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  COMPLETED: { label: 'Completed', icon: <CheckCircle2 className="w-3.5 h-3.5" />, className: 'text-teal-400 bg-teal-400/10 border-teal-400/20' },
  ARCHIVED: { label: 'Archived', icon: <Archive className="w-3.5 h-3.5" />, className: 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20' },
};

const PRIORITY_CONFIG: Record<ProjectPriority, { label: string; dotClass: string }> = {
  LOW: { label: 'Low', dotClass: 'bg-neutral-400' },
  MEDIUM: { label: 'Medium', dotClass: 'bg-lime-400' },
  HIGH: { label: 'High', dotClass: 'bg-amber-400' },
  URGENT: { label: 'Urgent', dotClass: 'bg-red-400' },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">
        {label}
      </p>
      <div className="text-sm text-[var(--text-primary)]">{children}</div>
    </div>
  );
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const { user, workspace, loading, isAuthenticated } = useAuth();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [allProjectTasks, setAllProjectTasks] = useState<TaskSummary[]>([]);

  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'calendar'>('board');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus | undefined>();
  const [editTask, setEditTask] = useState<TaskDetail | null>(null);
  const [detailTask, setDetailTask] = useState<TaskDetail | null>(null);

  const [filterStatus, setFilterStatus] = useState<TaskStatus | undefined>();
  const [filterPriority, setFilterPriority] = useState<TaskPriority | undefined>();
  const [filterAssigneeId, setFilterAssigneeId] = useState('');
  const [filterMilestoneId, setFilterMilestoneId] = useState<string | undefined>();
  const [filterSearch, setFilterSearch] = useState('');
  const [filterSort, setFilterSort] = useState<TaskSort>('position');
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Read bookmarked filter/task params once on mount and reflect filter changes
  // back into the URL so views are shareable without full page navigations.
  useEffect(() => {
    if (!isAuthenticated) return;
    const qs = new URLSearchParams(window.location.search);

    const status = qs.get('status');
    if (status && (VALID_TASK_STATUSES as readonly string[]).includes(status)) {
      setFilterStatus(status as TaskStatus);
    }
    const priority = qs.get('priority');
    if (priority && (VALID_TASK_PRIORITIES as readonly string[]).includes(priority)) {
      setFilterPriority(priority as TaskPriority);
    }
    const assignee = qs.get('assignee') ?? qs.get('assigneeId');
    if (assignee) setFilterAssigneeId(assignee);
    const milestone = qs.get('milestone') ?? qs.get('milestoneId');
    if (milestone) setFilterMilestoneId(milestone);
    const search = qs.get('search');
    if (search) setFilterSearch(search);
    const sort = qs.get('sort');
    if (sort && (VALID_TASK_SORTS as readonly string[]).includes(sort)) {
      setFilterSort(sort as TaskSort);
    }

    const taskId = qs.get('task');
    if (taskId) {
      apiGetTask(taskId)
        .then((res) => setDetailTask(res.data))
        .catch(() => { /* Stay on the project view if the task is unreachable. */ });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated]);

  // Mirror active filters back into the URL (non-invasive, no navigation).
  useEffect(() => {
    if (!isAuthenticated) return;
    const qs = new URLSearchParams();
    if (filterStatus) qs.set('status', filterStatus);
    if (filterPriority) qs.set('priority', filterPriority);
    if (filterAssigneeId) qs.set('assignee', filterAssigneeId);
    if (filterMilestoneId) qs.set('milestone', filterMilestoneId);
    if (filterSearch) qs.set('search', filterSearch);
    if (filterSort !== 'position') qs.set('sort', filterSort);
    const existingTask = new URLSearchParams(window.location.search).get('task');
    if (existingTask) qs.set('task', existingTask);
    const next = qs.toString();
    const current = window.location.search.replace(/^\?/, '');
    if (next !== current) {
      window.history.replaceState(null, '', next ? `?${next}` : window.location.pathname);
    }
  }, [filterStatus, filterPriority, filterAssigneeId, filterMilestoneId, filterSearch, filterSort, isAuthenticated]);

  const fetchProject = useCallback(async () => {
    if (!isAuthenticated) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const res = await apiGetProject(projectId);
      setProject(res.data);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load project.');
    } finally {
      setPageLoading(false);
    }
  }, [projectId, isAuthenticated]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      void fetchProject();
    }
  }, [loading, isAuthenticated, fetchProject]);

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setTasksLoading(true);
    setTasksError(null);
    try {
      const res = await apiGetTasks(projectId, {
        status: filterStatus,
        priority: filterPriority,
        assigneeId: filterAssigneeId || undefined,
        milestoneId: filterMilestoneId || undefined,
        search: filterSearch || undefined,
        sort: filterSort,
      });
      setTasks(res.data);
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setTasksLoading(false);
    }
  }, [projectId, isAuthenticated, filterStatus, filterPriority, filterAssigneeId, filterMilestoneId, filterSearch, filterSort]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      void fetchTasks();
    }
  }, [fetchTasks, loading, isAuthenticated]);

  const handleTaskCreated = useCallback((task: TaskDetail) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  const handleTaskUpdated = useCallback((updated: TaskSummary | TaskDetail) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setDetailTask((prev) => (prev?.id === updated.id ? (updated as TaskDetail) : prev));
    setEditTask((prev) => (prev?.id === updated.id ? (updated as TaskDetail) : prev));
  }, []);

  const handleTaskDeleted = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDetailTask(null);
    setEditTask(null);
  }, []);

  // Real-time collaboration: sync tasks and project state across tabs and users
  useRealtimeSubscription(
    '*',
    useCallback(
      (event) => {
        if (event.projectId && event.projectId !== projectId) return;

        if (event.type === 'TASK_CREATED') {
          const task = event.data as TaskDetail;
          if (task && event.actorId !== user?.id) {
            setTasks((prev) => {
              if (prev.some((t) => t.id === task.id)) return prev;
              return [task, ...prev];
            });
          }
        } else if (event.type === 'TASK_UPDATED') {
          const updated = event.data as TaskSummary;
          if (updated && event.actorId !== user?.id) {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setDetailTask((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
          }
        } else if (event.type === 'TASK_DELETED') {
          const payload = event.data as { taskId?: string };
          if (payload?.taskId && event.actorId !== user?.id) {
            setTasks((prev) => prev.filter((t) => t.id !== payload.taskId));
            setDetailTask((prev) => (prev?.id === payload.taskId ? null : prev));
            setEditTask((prev) => (prev?.id === payload.taskId ? null : prev));
          }
        } else if (event.type === 'PROJECT_UPDATED') {
          if (event.actorId !== user?.id) {
            void fetchProject();
          }
        }
      },
      [projectId, user?.id, fetchProject]
    )
  );

  const handleNewTask = useCallback((status?: TaskStatus) => {
    setCreateDefaultStatus(status);
    setCreateOpen(true);
  }, []);

  const handleTaskClick = useCallback(async (task: TaskSummary) => {
    // Fetch full detail
    try {
      const res = await apiGetTask(task.id);
      setDetailTask(res.data);
    } catch {
      // Fallback to summary
      setDetailTask(task as TaskDetail);
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterStatus(undefined);
    setFilterPriority(undefined);
    setFilterAssigneeId('');
    setFilterMilestoneId(undefined);
    setFilterSearch('');
    setFilterSort('position');
  }, []);

  const handleOpenExport = useCallback(async () => {
    setExportOpen(true);
    const hasFilters = Boolean(
      filterStatus || filterPriority || filterAssigneeId || filterMilestoneId || filterSearch
    );
    if (hasFilters) {
      try {
        const res = await apiGetTasks(projectId);
        setAllProjectTasks(res.data);
      } catch {
        setAllProjectTasks(tasks);
      }
    } else {
      setAllProjectTasks(tasks);
    }
  }, [projectId, filterStatus, filterPriority, filterAssigneeId, filterMilestoneId, filterSearch, tasks]);

  const workspaceRole = workspace?.role as WorkspaceRole | undefined;
  const canManage =
    workspaceRole === 'OWNER' || workspaceRole === 'ADMIN';

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </main>
    );
  }

  if (!user) return null;

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-24 rounded bg-[var(--card-main)]" />
            <div className="h-8 w-64 rounded-xl bg-[var(--card-main)]" />
            <div className="h-4 w-full rounded bg-[var(--card-main)]" />
            <div className="h-4 w-3/4 rounded bg-[var(--card-main)]" />
            <div className="h-48 rounded-2xl bg-[var(--card-main)]" />
          </div>
        </div>
      </main>
    );
  }

  if (pageError || !project) {
    return (
      <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Project not found</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {pageError ?? 'This project does not exist or you do not have access.'}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.ACTIVE;
  const priority = PRIORITY_CONFIG[project.priority] ?? PRIORITY_CONFIG.MEDIUM;
  const isArchived = project.status === 'ARCHIVED';

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] relative">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/4 blur-[160px] rounded-full"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Dashboard
          </Link>

          {/* Logo + actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/calendar"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-emerald-400 hover:bg-[var(--card-main)] border border-[var(--border-color)] transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </Link>
            <Link
              href="/my-tasks"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-main)] border border-[var(--border-color)] transition-all"
            >
              <span className="hidden sm:inline">My Tasks</span>
            </Link>
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-[1.5px] shadow-sm shadow-emerald-500/20">
              <div className="w-full h-full bg-[var(--card-main)] rounded-[9px] flex items-center justify-center">
                <Zap className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
            <span className="text-sm font-bold tracking-tight">NOVA</span>
            <div className="flex items-center gap-1.5 ml-1">
              <GlobalSearchTrigger compact />
              <NotificationBell />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          {/* Status + priority */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${status.className}`}
            >
              {status.icon}
              {status.label}
            </span>
            <div className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${priority.dotClass}`} />
              <span className="text-xs text-[var(--text-muted)]">{priority.label} priority</span>
            </div>
          </div>

          {/* Name + actions */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{project.name}</h1>

            {canManage && !isArchived && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="edit-project-btn"
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-muted)] transition-all"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  id="archive-project-btn"
                  type="button"
                  onClick={() => setArchiveOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-amber-400 border border-amber-500/20 hover:bg-amber-500/10 transition-all"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
              </div>
            )}
          </div>

          {project.description && (
            <p className="text-[var(--text-secondary)] mt-3 leading-relaxed">{project.description}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-6 mb-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Field label="Workspace">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                <span>{project.workspaceName}</span>
              </div>
            </Field>

            <Field label="Created">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                {new Date(project.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </Field>

            <Field label="Start date">
              {project.startDate ? (
                new Date(project.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              ) : (
                <span className="text-[var(--text-muted)]">Not set</span>
              )}
            </Field>

            <Field label="Due date">
              {project.dueDate ? (
                new Date(project.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              ) : (
                <span className="text-[var(--text-muted)]">Not set</span>
              )}
            </Field>
          </div>
        </motion.div>

        <ProjectProgressCard tasks={tasks} loading={tasksLoading} />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-6 mb-6"
        >
          <ProjectMembers
            projectId={project.id}
            initialMembers={project.members}
            canManage={canManage && !isArchived}
          />
        </motion.div>

        <MilestonesList
          projectId={project.id}
          canManage={canManage && !isArchived}
          selectedMilestoneId={filterMilestoneId}
          onFilterByMilestone={setFilterMilestoneId}
          onMilestonesChange={setMilestones}
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Task header */}
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <SquareKanban className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Tasks</h2>
              {!tasksLoading && (
                <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md font-medium">
                  {tasks.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center rounded-xl border border-[var(--border-color)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('board')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
                    viewMode === 'board'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Board
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Calendar
                </button>
              </div>

              {/* Export button */}
              <button
                id="export-tasks-btn"
                type="button"
                onClick={() => void handleOpenExport()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--text-secondary)] hover:text-teal-400 hover:bg-[var(--card-main)] hover:border-teal-500/30 transition-all"
                title="Export tasks to CSV or JSON"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {!isArchived && (
                <button
                  id="new-task-btn"
                  type="button"
                  onClick={() => handleNewTask()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all duration-150 shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              )}
            </div>
          </div>

          {/* Filters & Saved Views */}
          <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex-1">
              <TaskFilters
                status={filterStatus}
                priority={filterPriority}
                assigneeId={filterAssigneeId}
                milestoneId={filterMilestoneId}
                search={filterSearch}
                sort={filterSort}
                members={project.members}
                milestones={milestones}
                onStatusChange={setFilterStatus}
                onPriorityChange={setFilterPriority}
                onAssigneeChange={setFilterAssigneeId}
                onMilestoneChange={(mId) => setFilterMilestoneId(mId || undefined)}
                onSearchChange={setFilterSearch}
                onSortChange={setFilterSort}
                onClear={handleClearFilters}
              />
            </div>
            {workspace?.id && (
              <SavedViewsSelector
                workspaceId={workspace.id}
                projectId={project.id}
                currentFilters={{
                  status: filterStatus,
                  priority: filterPriority,
                  assigneeId: filterAssigneeId,
                  milestoneId: filterMilestoneId,
                  search: filterSearch,
                  sort: filterSort,
                }}
                onApplyView={(view) => {
                  if (view.filters.status && view.filters.status[0]) {
                    setFilterStatus(view.filters.status[0]);
                  } else {
                    setFilterStatus(undefined);
                  }

                  if (view.filters.priority && view.filters.priority[0]) {
                    setFilterPriority(view.filters.priority[0]);
                  } else {
                    setFilterPriority(undefined);
                  }

                  setFilterAssigneeId(view.filters.assigneeId || '');
                  setFilterMilestoneId(view.filters.milestoneId || undefined);
                  setFilterSearch(view.filters.search || '');

                  if (view.sortBy && view.sortOrder) {
                    setFilterSort(`${view.sortBy}-${view.sortOrder}` as TaskSort);
                  }
                  if (view.viewType === 'list' || view.viewType === 'board' || view.viewType === 'calendar') {
                    setViewMode(view.viewType);
                  }
                }}
                onResetView={handleClearFilters}
              />
            )}
          </div>

          {/* Task content */}
          {tasksLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : tasksError ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Something went wrong</p>
              <p className="text-xs text-[var(--text-muted)] mb-4">{tasksError}</p>
              <button
                type="button"
                onClick={() => void fetchTasks()}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-[var(--border-color)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--card-main)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-3">
                <SquareKanban className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              {filterStatus || filterPriority || filterAssigneeId || filterMilestoneId || filterSearch ? (
                <>
                  <p className="text-sm font-semibold text-[var(--text-secondary)] mb-1">
                    No tasks match your filters
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[var(--text-secondary)] mb-1">
                    No tasks yet
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mb-4">
                    Create your first task to get started.
                  </p>
                  {!isArchived && (
                    <button
                      type="button"
                      onClick={() => handleNewTask()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Create Task
                    </button>
                  )}
                </>
              )}
            </div>
          ) : viewMode === 'board' ? (
            <TaskBoard
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onTaskUpdated={handleTaskUpdated}
              onNewTask={handleNewTask}
            />
          ) : viewMode === 'list' ? (
            <TaskList
              tasks={tasks}
              onTaskClick={handleTaskClick}
            />
          ) : (
            <CalendarView
              tasks={tasks}
              currentDate={calendarDate}
              onDateChange={setCalendarDate}
              onTaskClick={handleTaskClick}
              onDayClick={() => {
                handleNewTask();
              }}
            />
          )}
        </motion.div>
      </div>

      {project && (
        <>
          <EditProjectDialog
            project={project}
            open={editOpen}
            onClose={() => setEditOpen(false)}
            onUpdated={(updated) => {
              setProject(updated);
              setEditOpen(false);
            }}
          />
          <ArchiveProjectDialog
            projectId={project.id}
            projectName={project.name}
            open={archiveOpen}
            onClose={() => setArchiveOpen(false)}
            onArchived={() => {
              setProject((p) => p ? { ...p, status: 'ARCHIVED' } : p);
            }}
          />
          <ExportTasksDialog
            open={exportOpen}
            onClose={() => setExportOpen(false)}
            filteredTasks={tasks}
            allTasks={allProjectTasks.length > 0 ? allProjectTasks : tasks}
            projectName={project.name}
          />
          <CreateTaskDialog
            projectId={project.id}
            members={project.members}
            milestones={milestones}
            defaultStatus={createDefaultStatus}
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreated={handleTaskCreated}
          />
          {editTask && (
            <EditTaskDialog
              task={editTask}
              members={project.members}
              milestones={milestones}
              canDelete={canManage && !isArchived}
              open={!!editTask}
              onClose={() => setEditTask(null)}
              onUpdated={(updated) => {
                handleTaskUpdated(updated);
                setEditTask(null);
              }}
              onDeleted={handleTaskDeleted}
            />
          )}
          {detailTask && (
            <TaskDetailPanel
              task={detailTask}
              open={!!detailTask}
              onClose={() => setDetailTask(null)}
              onEdit={(t) => {
                setDetailTask(null);
                setEditTask(t);
              }}
              canModerate={canManage}
            />
          )}
        </>
      )}
    </main>
  );
}
