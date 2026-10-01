'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { apiUpdateComment, apiDeleteComment } from '@/lib/api/client';
import { relativeTimeFrom } from '@/lib/format';
import { parseMentionTokens } from '@/lib/comments/mentions';
import type { CommentItem as CommentItemType } from '@/types/comment';

const AVATAR_TONES = [
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'bg-teal-500/15 text-teal-400 border-teal-500/25',
  'bg-lime-500/15 text-lime-400 border-lime-500/25',
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

interface CommentItemProps {
  comment: CommentItemType;
  canModerate: boolean;
  onEdited: (comment: CommentItemType) => void;
  onDeleted: (commentId: string) => void;
}

export function CommentItem({ comment, canModerate, onEdited, onDeleted }: CommentItemProps) {
  const { user } = useAuth();
  const isOwn = user?.id === comment.author.id;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tone = AVATAR_TONES[
    comment.author.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_TONES.length
  ];

  async function saveEdit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Comment cannot be empty.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await apiUpdateComment(comment.id, { content: trimmed });
      onEdited(res.data);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save comment.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this comment?')) return;
    setBusy(true);
    try {
      await apiDeleteComment(comment.id);
      onDeleted(comment.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment.');
      setBusy(false);
    }
  }

  const canEdit = isOwn;
  const canDelete = isOwn || canModerate;

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div
        aria-hidden="true"
        className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${tone}`}
      >
        {initials(comment.author.name)}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {comment.author.name}
          </span>
          <span className="text-xs text-[var(--text-muted)]" title={new Date(comment.createdAt).toLocaleString()}>
            {relativeTimeFrom(comment.createdAt)}
          </span>
        </div>

        {/* Body / editor */}
        {editing ? (
          <div className="mt-1.5 space-y-2">
            <label htmlFor={`comment-edit-${comment.id}`} className="sr-only">
              Edit comment
            </label>
            <textarea
              id={`comment-edit-${comment.id}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              maxLength={2000}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm resize-none focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void saveEdit()}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraft(comment.body);
                  setError(null);
                }}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-all"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap break-words">
              {parseMentionTokens(comment.body).map((token, i) =>
                token.type === 'mention' ? (
                  <span
                    key={i}
                    className="inline-flex items-center text-emerald-400 bg-emerald-500/10 font-semibold px-1 py-0.5 rounded text-xs mx-0.5 border border-emerald-500/20"
                  >
                    {token.content}
                  </span>
                ) : (
                  <span key={i}>{token.content}</span>
                )
              )}
            </p>

            {/* Actions */}
            {(canEdit || canDelete) && (
              <div className="mt-1.5 flex items-center gap-1">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setDraft(comment.body);
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-elevated)] transition-all"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => void remove()}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>
            )}
            {error && <p className="mt-1 text-xs text-red-400" role="alert">{error}</p>}
          </>
        )}
      </div>
    </motion.article>
  );
}