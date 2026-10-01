'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Download,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  Filter,
  Layers,
} from 'lucide-react';
import {
  exportTasksToCSV,
  exportTasksToJSON,
  triggerFileDownload,
} from '@/lib/export/task-export';
import type { TaskSummary } from '@/types/task';

export interface ExportTasksDialogProps {
  open: boolean;
  onClose: () => void;
  filteredTasks: TaskSummary[];
  allTasks: TaskSummary[];
  projectName?: string;
}

export function ExportTasksDialog({
  open,
  onClose,
  filteredTasks,
  allTasks,
  projectName = 'tasks',
}: ExportTasksDialogProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [scope, setScope] = useState<'filtered' | 'all'>('filtered');
  const [downloaded, setDownloaded] = useState(false);

  if (!open) return null;

  const targetTasks = scope === 'filtered' ? filteredTasks : allTasks;
  const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const dateStr = new Date().toISOString().slice(0, 10);
  const defaultFilename = `nova-${sanitizedName}-${dateStr}.${format}`;

  const handleExport = () => {
    if (format === 'csv') {
      const csv = exportTasksToCSV(targetTasks);
      triggerFileDownload(csv, defaultFilename, 'text/csv;charset=utf-8;');
    } else {
      const json = exportTasksToJSON(
        targetTasks,
        projectName ? { id: sanitizedName, name: projectName } : undefined
      );
      triggerFileDownload(json, defaultFilename, 'application/json;charset=utf-8;');
    }

    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-[var(--card-main)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Export Tasks</h2>
              <p className="text-xs text-[var(--text-muted)]">Download tasks for reporting and backups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {/* Format selection */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">
              EXPORT FORMAT
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  format === 'csv'
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-300'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold">CSV Format</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Spreadsheets & Excel</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  format === 'json'
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-300'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                }`}
              >
                <FileJson className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                <div>
                  <p className="text-xs font-semibold">JSON Format</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Complete raw backup</p>
                </div>
              </button>
            </div>
          </div>

          {/* Scope selection */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">
              TASKS TO INCLUDE
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScope('filtered')}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  scope === 'filtered'
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-300'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Filter className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                  <span className="text-xs font-medium truncate">Filtered</span>
                </div>
                <span className="text-xs font-mono font-bold ml-1">{filteredTasks.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('all')}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  scope === 'all'
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-300'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Layers className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  <span className="text-xs font-medium truncate">All Tasks</span>
                </div>
                <span className="text-xs font-mono font-bold ml-1">{allTasks.length}</span>
              </button>
            </div>
          </div>

          {/* File summary */}
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] truncate max-w-[240px]">
              {defaultFilename}
            </span>
            <span className="font-semibold text-teal-400 font-mono">
              {targetTasks.length} task{targetTasks.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={targetTasks.length === 0 || downloaded}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-semibold shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
          >
            {downloaded ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Download {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
