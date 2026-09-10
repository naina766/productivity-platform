'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  CheckSquare,
  MessagesSquare,
  LineChart,
  ArrowRight,
} from 'lucide-react';
import { ProductTabs, type ProductTab } from './product/ProductTabs';
import { ProductPreview } from './product/ProductPreview';

export const ProductShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProductTab>('overview');

  const pillars = [
    {
      icon: FolderKanban,
      title: 'Project Workspaces',
      desc: 'Organize projects into workspaces, each with its own projects, tasks, members, and labels.',
    },
    {
      icon: CheckSquare,
      title: 'Task Tracking',
      desc: 'Every task moves through four clear states: to do, in progress, in review, and done.',
    },
    {
      icon: MessagesSquare,
      title: 'Team Collaboration',
      desc: 'Assign owners, leave comments, and follow work in progress without switching tabs.',
    },
    {
      icon: LineChart,
      title: 'Progress Tracking',
      desc: 'See what is on track, what is due next, and where your team needs help.',
    },
  ];

  return (
    <section id="product" className="py-24 bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-teal)]/10 border border-teal-500/20 text-[var(--accent-teal)] text-xs font-semibold uppercase tracking-wider mb-4">
                <span>How NOVA works</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
                One place for all your{' '}
                <span className="text-emerald-400">project work.</span>
              </h2>

              <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                NOVA combines project organization, task tracking, and team collaboration in a
                single workspace — so you can stop stitching together disconnected tools.
              </p>
            </div>

            {/* Honest core pillars */}
            <div className="space-y-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex items-start gap-3.5 p-3 rounded-xl bg-[var(--card-main)] border border-[var(--border-color)] hover:border-emerald-500/25 transition-all duration-200"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <a
                href="#features"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group"
              >
                <span>Explore the full feature list</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Product Mockup */}
          <div className="lg:col-span-7">
            <ProductTabs active={activeTab} onChange={setActiveTab} />
            <ProductPreview variant={activeTab} />
          </div>
        </div>
      </div>
    </section>
  );
};