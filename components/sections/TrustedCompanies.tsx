import React from 'react';
import { Layers, Terminal, Rocket, Users2, Briefcase, Globe } from 'lucide-react';

const categories = [
  { label: 'Product Teams', icon: Layers },
  { label: 'Engineering Teams', icon: Terminal },
  { label: 'Startups', icon: Rocket },
  { label: 'Student Teams', icon: Users2 },
  { label: 'Small Agencies', icon: Briefcase },
  { label: 'Remote Teams', icon: Globe },
];

export const TrustedCompanies: React.FC = () => {
  return (
    <section className="py-12 border-y border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs sm:text-sm font-medium tracking-widest uppercase text-[var(--text-muted)] mb-8">
          Built for modern teams
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.label}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--card-main)] border border-[var(--border-color)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-500/30 transition-all duration-200"
              >
                <Icon className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>{cat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};