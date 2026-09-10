'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { apiCreateComment } from '@/lib/api/client';

const MAX_LENGTH = 2000;

interface CommentComposerProps {
  taskId: string;
  onSubmit?: () => void;
}

/**
 * Post a comment on a task. Handles loading, validation feedback and the
 * empty/whitespace-only guard locally; the server re-validates with Zod.
 */
export function CommentComposer({ taskId, onSubmit }: CommentComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Comment cannot be empty.');
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Comment must be at most ${MAX_LENGTH} characters.`);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await apiCreateComment(taskId, { content: trimmed });
      setContent('');
      onSubmit?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor={`comment-composer-${taskId}`} className="sr-only">
        Write a comment
      </label>
      <div className="relative">
        <textarea
          id={`comment-composer-${taskId}`}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error && e.target.value.trim()) setError(null);
          }}
          rows={2}
          maxLength={MAX_LENGTH}
          placeholder={user ? 'Write a comment…' : 'Sign in to comment'}
          disabled={!user || submitting}
          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm resize-none focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
        />
        <p className="absolute right-3 bottom-2 text-[10px] tabular-nums text-[var(--text-muted)]">
          {content.length}/{MAX_LENGTH}
        </p>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400"
          role="alert"
        >
          {error}
        </motion.p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!user || submitting || content.trim().length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all duration-150 shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Comment
            </>
          )}
        </button>
      </div>
    </form>
  );
}