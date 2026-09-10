'use client';

import { motion } from 'framer-motion';
import { FolderPlus } from 'lucide-react';

interface ProjectEmptyStateProps {
  onCreateClick: () => void;
}

export function ProjectEmptyState({ onCreateClick }: ProjectEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="col-span-full flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-dashed border-[var(--border-color)]"
    >
      {/* Icon container */}
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
        <FolderPlus className="w-7 h-7 text-emerald-400" />
      </div>

      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        No projects yet
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6 leading-relaxed">
        Create your first project to start organizing your work in this workspace.
      </p>

      <button
        id="empty-state-create-project-btn"
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all duration-150 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
      >
        <FolderPlus className="w-4 h-4" />
        Create Project
      </button>
    </motion.div>
  );
}
