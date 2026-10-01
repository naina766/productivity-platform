'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiGetTaskComments } from '@/lib/api/client';
import { useRealtimeSubscription } from '@/components/realtime/RealtimeProvider';
import { CommentComposer } from '@/components/comments/CommentComposer';
import { CommentItem } from '@/components/comments/CommentItem';
import type { CommentItem as CommentItemType } from '@/types/comment';

interface CommentSectionProps {
  taskId: string;
  canModerate: boolean;
}

export function CommentSection({ taskId, canModerate }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGetTaskComments(taskId, 200);
      setComments(res.data.comments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  useRealtimeSubscription('COMMENT_CREATED', (event) => {
    const data = event.data as { taskId?: string; comment?: CommentItemType };
    if (data?.taskId === taskId && data?.comment) {
      setComments((prev) => {
        if (prev.some((c) => c.id === data.comment!.id)) return prev;
        return [...prev, data.comment!];
      });
    }
  });

  useRealtimeSubscription('COMMENT_DELETED', (event) => {
    const data = event.data as { taskId?: string; commentId?: string };
    if (data?.taskId === taskId && data?.commentId) {
      setComments((prev) => prev.filter((c) => c.id !== data.commentId));
    }
  });

  return (
    <div className="space-y-4">
      <CommentComposer taskId={taskId} onSubmit={() => void fetchComments()} />

      <div className="pt-2 border-t border-[var(--border-color)] space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button
              type="button"
              onClick={() => void fetchComments()}
              className="ml-auto inline-flex items-center gap-1 underline hover:no-underline"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        ) : comments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--card-elevated)] border border-[var(--border-color)] flex items-center justify-center mb-2">
              <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              No comments yet
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Start the conversation.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                canModerate={canModerate}
                onEdited={(updated) =>
                  setComments((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c)),
                  )
                }
                onDeleted={(id) =>
                  setComments((prev) => prev.filter((c) => c.id !== id))
                }
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}