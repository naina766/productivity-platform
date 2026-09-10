import React from 'react';

const navItems = [
  { label: 'Overview', active: true },
  { label: 'Projects', meta: '4' },
  { label: 'Tasks', meta: '12' },
  { label: 'Team', meta: '5' },
];

const memberColors = ['bg-emerald-700', 'bg-teal-700', 'bg-lime-700'];

export const ProductSidebar: React.FC = () => {
  return (
    <div className="hidden lg:block lg:col-span-3 border-r border-[var(--border-color)] pr-5 space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-color)]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-lime-500 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-emerald-500/20">
          N
        </div>
        <div>
          <div className="text-xs font-semibold text-[var(--text-primary)]">NOVA Workspace</div>
          <div className="text-[10px] text-neutral-500">Product Team</div>
        </div>
      </div>

      <div className="space-y-1 text-xs">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
              item.active
                ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <span>{item.label}</span>
            {item.meta && (
              <span className="text-[10px] text-neutral-600">{item.meta}</span>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-2">
          Members
        </div>
        <div className="flex -space-x-1.5">
          {memberColors.map((color, i) => (
            <div
              key={color}
              className={`w-6 h-6 rounded-full border border-[#111111] flex items-center justify-center text-[8px] font-bold text-white ${color}`}
            >
              {i + 1}
            </div>
          ))}
          <div className="w-6 h-6 rounded-full bg-neutral-800 border border-[#111111] flex items-center justify-center text-[10px] text-neutral-400 font-medium">
            +2
          </div>
        </div>
      </div>
    </div>
  );
};