'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  LogOut,
  FolderPlus,
  Building2,
  Shield,
  Loader2,
  RefreshCw,
  AlertCircle,
  Search,
  ListTodo,
  Calendar,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { apiLogout, apiGetProjects } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/errors';
import { ProjectCard } from '@/components/projects/ProjectCard';

import { ProjectEmptyState } from '@/components/projects/ProjectEmptyState';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import type { ProjectSummary, ProjectDetail, WorkspaceRole } from '@/types/project';
import { WorkspaceMembers } from '@/components/workspace/WorkspaceMembers';

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
};

function ProjectSkeleton() {
  return (
    <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-20 rounded-lg bg-[var(--bg-secondary)]" />
        <div className="h-4 w-14 rounded-lg bg-[var(--bg-secondary)]" />
      </div>
      <div className="h-5 w-3/4 rounded-lg bg-[var(--bg-secondary)] mb-2" />
      <div className="h-4 w-full rounded-lg bg-[var(--bg-secondary)] mb-1" />
      <div className="h-4 w-2/3 rounded-lg bg-[var(--bg-secondary)] mb-4" />
      <div className="pt-3 border-t border-[var(--border-color)] flex justify-between">
        <div className="h-3.5 w-24 rounded bg-[var(--bg-secondary)]" />
        <div className="h-3.5 w-16 rounded bg-[var(--bg-secondary)]" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, workspace, loading, isAuthenticated, loadUser } = useAuth();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  const fetchProjects = useCallback(async () => {
    if (!workspace?.id) return;
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const res = await apiGetProjects(workspace.id, {
        search: searchTerm || undefined,
      });
      setProjects(res.data);
    } catch (err) {
      setProjectsError(getErrorMessage(err));
    } finally {
      setProjectsLoading(false);
    }
  }, [workspace, searchTerm]);

  useEffect(() => {
    if (!loading && isAuthenticated && workspace?.id) {
      void fetchProjects();
    }
  }, [loading, isAuthenticated, workspace?.id, fetchProjects]);

  async function handleLogout() {
    try {
      await apiLogout();
    } catch {
      // Best-effort logout
    }
    try {
      await loadUser();
    } catch {
      // Ignore
    }
    router.replace('/login');
  }

  function handleProjectCreated(project: ProjectDetail) {
    setProjects((prev) => [
      {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate,
        dueDate: project.dueDate,
        memberCount: project.memberCount,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      ...prev,
    ]);
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </main>
    );
  }

  const roleLabel = workspace ? (ROLE_LABELS[workspace.role] ?? workspace.role) : null;

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-600/5 blur-[160px] rounded-full"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-[1.5px] shadow-md shadow-emerald-500/20">
                <div className="w-full h-full bg-[var(--card-main)] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight">NOVA</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-main)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/my-tasks"
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-main)] transition-colors"
              >
                My Tasks
              </Link>
              <Link
                href="/my-tasks?view=today"
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-lime-400 hover:bg-[var(--card-main)] transition-colors"
              >
                Today
              </Link>
              <Link
                href="/my-tasks?view=upcoming"
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-teal-400 hover:bg-[var(--card-main)] transition-colors"
              >
                Upcoming
              </Link>
              <Link
                href="/my-tasks?view=overdue"
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-red-400 hover:bg-[var(--card-main)] transition-colors"
              >
                Overdue
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              id="dashboard-logout-btn"
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-muted)] transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mb-8"
        >
          <p className="text-sm font-medium text-emerald-500 mb-2 tracking-wide uppercase">
            Dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1">
            Welcome back, {user.name ? user.name.split(' ')[0] : 'there'}.
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">{user.email}</p>
        </motion.div>

        {workspace && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-5 mb-8 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-0.5">
                Workspace
              </p>
              <p className="font-semibold text-[var(--text-primary)]">{workspace.name}</p>
            </div>
            {roleLabel && (
              <div className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">{roleLabel}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Task Views Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.11 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          <Link
            href="/my-tasks"
            className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] hover:border-emerald-500/40 p-4 transition-all group flex items-center gap-3 shadow-sm hover:shadow-emerald-500/5"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ListTodo className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors truncate">
                My Tasks
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">All assigned to you</p>
            </div>
          </Link>

          <Link
            href="/my-tasks?view=today"
            className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] hover:border-lime-500/40 p-4 transition-all group flex items-center gap-3 shadow-sm hover:shadow-lime-500/5"
          >
            <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4 text-lime-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-lime-400 transition-colors truncate">
                Today
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">Due before midnight</p>
            </div>
          </Link>

          <Link
            href="/my-tasks?view=upcoming"
            className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] hover:border-teal-500/40 p-4 transition-all group flex items-center gap-3 shadow-sm hover:shadow-teal-500/5"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4 text-teal-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-teal-400 transition-colors truncate">
                Upcoming
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">Future deadlines</p>
            </div>
          </Link>

          <Link
            href="/my-tasks?view=overdue"
            className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] hover:border-red-500/40 p-4 transition-all group flex items-center gap-3 shadow-sm hover:shadow-red-500/5"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-red-400 transition-colors truncate">
                Overdue
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">Past due date</p>
            </div>
          </Link>
        </motion.div>

        {workspace && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.125 }}
          >
            <WorkspaceMembers
              workspaceId={workspace.id}
              currentRole={workspace.role as WorkspaceRole}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Projects</h2>
              {!projectsLoading && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {projects.length} active {projects.length === 1 ? 'project' : 'projects'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSearchTerm(searchInput.trim());
                  }}
                  placeholder="Search projects…"
                  aria-label="Search projects"
                  className="w-40 sm:w-52 pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => void fetchProjects()}
                disabled={projectsLoading}
                aria-label="Refresh projects"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-main)] border border-transparent hover:border-[var(--border-color)] transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${projectsLoading ? 'animate-spin' : ''}`} />
              </button>
              {workspace && (
                <button
                  id="create-project-btn"
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all duration-150 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Project</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
            </div>
          </div>

          {/* Project error */}
          {projectsError && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {projectsError}
              <button
                type="button"
                onClick={() => void fetchProjects()}
                className="ml-auto text-xs underline hover:no-underline"
              >
                Retry
              </button>

            </div>
          )}

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projectsLoading ? (
              // Skeletons
              Array.from({ length: 3 }).map((_, i) => <ProjectSkeleton key={i} />)
            ) : projects.length === 0 ? (
              // Empty state
              <ProjectEmptyState onCreateClick={() => setCreateOpen(true)} />
            ) : (
              // Project cards
              projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))
            )}
          </div>
        </motion.div>
      </div>

      {workspace && (
        <CreateProjectDialog
          workspaceId={workspace.id}
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </main>
  );
}
