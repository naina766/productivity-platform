'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, AtSign } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { apiCreateComment, apiGetWorkspaceMembers } from '@/lib/api/client';
import type { WorkspaceMemberItem } from '@/types/workspace';

const MAX_LENGTH = 2000;

interface CommentComposerProps {
  taskId: string;
  onSubmit?: () => void;
}

export function CommentComposer({ taskId, onSubmit }: CommentComposerProps) {
  const { user, workspace } = useAuth();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Mentions autocomplete state
  const [members, setMembers] = useState<WorkspaceMemberItem[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionCursor, setMentionCursor] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch workspace members for mention suggestions
  useEffect(() => {
    if (!workspace?.id) return;
    apiGetWorkspaceMembers(workspace.id)
      .then((res) => setMembers(res.data))
      .catch(() => {});
  }, [workspace?.id]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart ?? val.length;
    setContent(val);
    if (error && val.trim()) setError(null);

    // Check if user is typing an @mention
    const textBeforeCursor = val.slice(0, pos);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt !== -1) {
      const queryCandidate = textBeforeCursor.slice(lastAt + 1);
      // Valid if not containing space or newline
      if (!/\s/.test(queryCandidate)) {
        setMentionQuery(queryCandidate.toLowerCase());
        setMentionCursor(lastAt);
        return;
      }
    }

    setMentionQuery(null);
  };

  const handleSelectMention = (memberName: string) => {
    if (!textareaRef.current) return;
    const before = content.slice(0, mentionCursor);
    const after = content.slice(textareaRef.current.selectionStart);
    const newContent = `${before}@${memberName} ${after}`;
    setContent(newContent);
    setMentionQuery(null);

    const newCursor = mentionCursor + memberName.length + 2;
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(newCursor, newCursor);
    }, 10);
  };

  const matchingMembers = mentionQuery !== null
    ? members.filter(
        (m) =>
          m.user.id !== user?.id &&
          (m.user.name.toLowerCase().includes(mentionQuery) ||
            m.user.email.toLowerCase().includes(mentionQuery))
      ).slice(0, 5)
    : [];

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
      setMentionQuery(null);
      onSubmit?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 relative">
      <label htmlFor={`comment-composer-${taskId}`} className="sr-only">
        Write a comment
      </label>

      {/* Mention suggestions popover */}
      <AnimatePresence>
        {mentionQuery !== null && matchingMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-1 left-0 w-64 bg-[var(--card-main)] border border-[var(--border-color)] rounded-xl shadow-xl z-30 overflow-hidden text-xs"
          >
            <div className="p-2 border-b border-[var(--border-color)] text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
              <AtSign className="w-3 h-3 text-emerald-400" />
              <span>MENTION COLLABORATOR</span>
            </div>
            <div className="max-h-40 overflow-y-auto p-1 space-y-0.5">
              {matchingMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleSelectMention(member.user.name)}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {member.user.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">
                      {member.user.email}
                    </p>
                  </div>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {member.role}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <textarea
          ref={textareaRef}
          id={`comment-composer-${taskId}`}
          value={content}
          onChange={handleTextChange}
          rows={2}
          maxLength={MAX_LENGTH}
          placeholder={user ? 'Write a comment… Type @ to mention a teammate' : 'Sign in to comment'}
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

      <div className="flex justify-between items-center">
        <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
          <AtSign className="w-3 h-3 text-emerald-400" />
          Tip: Use <kbd className="px-1 py-0.2 text-[10px] font-mono bg-[var(--card-main)] border border-[var(--border-color)] rounded">@Name</kbd> to notify teammates
        </span>

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