'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { TaskList } from '@/components/tasks/TaskList';
import type { TaskSummary } from '@/types/task';

// Extend the task type returned by the My Tasks API with the project name.
interface MyTaskSummary extends TaskSummary {
  projectName: string;
}

export default function MyTasksPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  const [tasks, setTasks] = useState<MyTaskSummary[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyTasks = useCallback(async () => {
    setLoadingTasks(true);
    setError(null);
    try {
      const res = await fetch('/api/my-tasks', {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.message ?? 'Failed to load tasks.';
        throw new Error(msg);
      }
      const data = (await res.json()) as { success: true; data: MyTaskSummary[] };
      setTasks(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // Load tasks when auth is ready.
  useEffect(() => {
    if (!loading && isAuthenticated) {
      void fetchMyTasks();
    }
  }, [loading, isAuthenticated, fetchMyTasks]);

  // Redirect to login if not authenticated.
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleTaskClick = useCallback((task: TaskSummary) => {
    // Navigate to the dashboard and open the task detail panel via query param.
    router.push(`/dashboard?task=${task.id}`);
  }, [router]);

  if (loading || loadingTasks) {
    return (
      <main className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-1">{error}</p>
          <button
            type="button"
            onClick={() => void fetchMyTasks()}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Tasks</h1>
        {tasks.length === 0 ? (
          <p className="text-[var(--text-muted)]">You have no tasks assigned.</p>
        ) : (
          <TaskList tasks={tasks as import("@/types/task").TaskSummary[]} onTaskClick={handleTaskClick} />
        )}
      </div>
    </main>
  );
}
