'use client';

import React from 'react';

export type ProductTab = 'overview' | 'tasks' | 'activity';

interface ProductTabsProps {
  active: ProductTab;
  onChange: (tab: ProductTab) => void;
}

const tabs: { id: ProductTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'activity', label: 'Activity' },
];

export const ProductTabs: React.FC<ProductTabsProps> = ({ active, onChange }) => {
  return (
    <div
      role="tablist"
      aria-label="Product views"
      className="flex items-center gap-2 mb-4 p-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] w-fit"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            active === tab.id
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};