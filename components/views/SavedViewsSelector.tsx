'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bookmark,
  Plus,
  Trash2,
  Share2,
  User,
  Check,
  Loader2,
  ChevronDown,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import {
  apiGetSavedViews,
  apiCreateSavedView,
  apiDeleteSavedView,
} from '@/lib/api/client';
import type { SavedView } from '@/types/saved-view';
import type { TaskStatus, TaskPriority, TaskSort } from '@/types/task';

interface SavedViewsSelectorProps {
  workspaceId: string;
  projectId?: string;
  currentFilters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    milestoneId?: string;
    search?: string;
    sort?: TaskSort;
  };
  onApplyView: (view: SavedView) => void;
  onResetView?: () => void;
}

export function SavedViewsSelector({
  workspaceId,
  projectId,
  currentFilters,
  onApplyView,
  onResetView,
}: SavedViewsSelectorProps) {
  const { user } = useAuth();

  const [views, setViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchViews = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await apiGetSavedViews(workspaceId, projectId);
      setViews(res.data);
    } catch {
      // Best-effort
    } finally {
      setLoading(false);
    }
  }, [workspaceId, projectId]);

  useEffect(() => {
    void fetchViews();
  }, [fetchViews]);

  const handleApply = (view: SavedView) => {
    setActiveViewId(view.id);
    onApplyView(view);
    setDropdownOpen(false);
  };

  const handleReset = () => {
    setActiveViewId(null);
    if (onResetView) onResetView();
    setDropdownOpen(false);
  };

  const handleSaveView = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim() || saving) return;

    setSaving(true);
    try {
      const filters = {
        status: currentFilters.status ? [currentFilters.status] : undefined,
        priority: currentFilters.priority ? [currentFilters.priority] : undefined,
        assigneeId: currentFilters.assigneeId || undefined,
        milestoneId: currentFilters.milestoneId || undefined,
        search: currentFilters.search || undefined,
      };

      const res = await apiCreateSavedView(workspaceId, {
        name: newViewName.trim(),
        projectId: projectId ?? null,
        filters,
        sortBy: currentFilters.sort?.split('-')[0] ?? null,
        sortOrder: (currentFilters.sort?.split('-')[1] as 'asc' | 'desc') ?? null,
        isShared,
      });

      setViews((prev) => [...prev, res.data]);
      setActiveViewId(res.data.id);
      setSaveModalOpen(false);
      setNewViewName('');
      setIsShared(false);
    } catch {
      // Handled by UI feedback
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteView = async (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiDeleteSavedView(viewId);
      setViews((prev) => prev.filter((v) => v.id !== viewId));
      if (activeViewId === viewId) {
        setActiveViewId(null);
      }
      setDeleteConfirmId(null);
    } catch {
      // Best-effort
    }
  };

  const activeView = views.find((v) => v.id === activeViewId);

  return (
    <div className="relative inline-block text-left">
      {/* Selector Trigger Button */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            activeView
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/10'
              : 'bg-[var(--card-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]'
          }`}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
          <span className="truncate max-w-[120px]">
            {activeView ? activeView.name : 'Views'}
          </span>
          <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
        </button>

        {/* Quick Save Button */}
        <button
          type="button"
          onClick={() => setSaveModalOpen(true)}
          title="Save current filters as view"
          className="p-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-main)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setDropdownOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] shadow-xl z-40 overflow-hidden text-xs"
            >
              <div className="p-2 border-b border-[var(--border-color)] flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)]">
                <span>SAVED VIEWS</span>
                {loading && <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />}
              </div>

              <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                {/* Reset to Default */}
                <button
                  type="button"
                  onClick={handleReset}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    !activeViewId
                      ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <span className="truncate">Default (All Tasks)</span>
                  {!activeViewId && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>

                {views.length === 0 && !loading && (
                  <div className="p-3 text-center text-[11px] text-[var(--text-muted)]">
                    No custom views saved yet
                  </div>
                )}

                {views.map((view) => {
                  const isSelected = view.id === activeViewId;
                  const isOwner = user?.id === view.userId;

                  return (
                    <div
                      key={view.id}
                      onClick={() => handleApply(view)}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {view.isShared ? (
                          <span title="Shared with workspace" className="shrink-0 flex items-center">
                            <Share2 className="w-3 h-3 text-blue-400" />
                          </span>
                        ) : (
                          <span title="Personal view" className="shrink-0 flex items-center">
                            <User className="w-3 h-3 text-[var(--text-muted)]" />
                          </span>
                        )}
                        <span className="truncate">{view.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />}
                        {isOwner && (
                          <button
                            type="button"
                            onClick={(e) => {
                              if (deleteConfirmId === view.id) {
                                void handleDeleteView(view.id, e);
                              } else {
                                e.stopPropagation();
                                setDeleteConfirmId(view.id);
                              }
                            }}
                            className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                              deleteConfirmId === view.id
                                ? 'bg-rose-500/20 text-rose-400 opacity-100'
                                : 'text-[var(--text-muted)] hover:text-rose-400'
                            }`}
                            title={deleteConfirmId === view.id ? 'Click to confirm delete' : 'Delete view'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Footer */}
              <div className="p-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setSaveModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save current filters</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Save View Modal */}
      <AnimatePresence>
        {saveModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Save View Preset"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] shadow-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Save View Preset
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveView} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    View Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urgent frontend bugs"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer text-[var(--text-secondary)] select-none">
                  <input
                    type="checkbox"
                    checked={isShared}
                    onChange={(e) => setIsShared(e.target.checked)}
                    className="rounded border-[var(--border-color)] text-emerald-500 focus:ring-emerald-500 bg-[var(--bg-secondary)] w-3.5 h-3.5"
                  />
                  <span>Share this view with all workspace members</span>
                </label>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSaveModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newViewName.trim() || saving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save View</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
