'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { ProductSidebar } from './ProductSidebar';
import { ProductMetrics } from './ProductMetrics';
import { ProductActivity } from './ProductActivity';
import type { ProductTab } from './ProductTabs';

interface ProductPreviewProps {
  variant: ProductTab;
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({ variant }) => {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-emerald-500/20 via-white/6 to-white/0 shadow-2xl shadow-emerald-900/10">
      <div className="bg-[var(--card-main)] rounded-[14px] border border-[var(--border-color)] overflow-hidden text-left min-h-[440px] flex flex-col">
        {/* Topbar */}
        <div className="bg-[var(--bg-secondary)] px-5 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-3 text-xs text-neutral-500 font-mono hidden sm:inline-block">
              app.nova.io/projects
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded bg-[var(--card-main)]/50 text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
              <Search className="w-3 h-3" />
              <span className="hidden sm:inline">Search tasks, projects…</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">Saved</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <ProductSidebar />

          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={variant}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {variant === 'overview' && <ProductMetrics />}
                {(variant === 'tasks' || variant === 'activity') && (
                  <ProductActivity variant={variant} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer status */}
        <div className="bg-[var(--bg-secondary)] px-5 py-2.5 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
          NOVA product demo · sample workspace data
        </div>
      </div>
    </div>
  );
};