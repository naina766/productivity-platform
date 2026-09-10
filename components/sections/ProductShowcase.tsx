'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  CheckSquare,
  Users2,
  BrainCircuit,
  LineChart,
  ArrowRight,
  Sparkles,
  Activity,
  Check,
} from 'lucide-react';

export const ProductShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sprint' | 'ai' | 'analytics'>('sprint');

  const pillars = [
    {
      icon: FolderKanban,
      title: 'Projects',
      desc: 'Hierarchical roadmaps, customizable epics, and live dependency tracking.',
    },
    {
      icon: CheckSquare,
      title: 'Tasks',
      desc: 'Bi-directional issue tracking synced with GitHub, GitLab, and Jira.',
    },
    {
      icon: Users2,
      title: 'Collaboration',
      desc: 'Real-time multi-cursor documents, thread resolution, and audio huddles.',
    },
    {
      icon: BrainCircuit,
      title: 'AI Automation',
      desc: 'Auto-generate PRDs, draft release notes, and summarize async standups.',
    },
    {
      icon: LineChart,
      title: 'Analytics',
      desc: 'Objective DORA metrics, PR review latency, and team capacity forecasts.',
    },
  ];

  return (
    <section id="product" className="py-24 bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-neutral-50/50 border-y border-white/6 dark:border-white/6 light:border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-teal-500/10 light:bg-teal-50 border border-teal-500/20 text-teal-400 dark:text-teal-400 light:text-teal-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unified Operating Platform</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white dark:text-white light:text-neutral-950 tracking-tight leading-tight">
                Your team's entire workflow.{' '}
                <span className="text-emerald-400">Reimagined.</span>
              </h2>

              <p className="mt-4 text-base sm:text-lg text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed">
                Traditional software stacks force teams to toggle between five isolated tools. NOVA brings together projects, tasks, collaboration, AI automation, and analytics into one intelligent workspace.
              </p>
            </div>

            {/* 5 Pillars */}
            <div className="space-y-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex items-start gap-3.5 p-3 rounded-xl bg-white/4 dark:bg-white/4 light:bg-white border border-white/6 dark:border-white/6 light:border-neutral-200 hover:border-emerald-500/25 transition-all duration-200"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white dark:text-white light:text-neutral-900">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 light:text-neutral-600 mt-0.5">
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
                <span>Explore the full feature suite</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Product Mockup */}
          <div className="lg:col-span-7">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 mb-4 p-1.5 rounded-xl bg-neutral-900/80 dark:bg-neutral-900/80 light:bg-neutral-200/80 border border-white/8 dark:border-white/8 light:border-neutral-300 w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('sprint')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'sprint'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-900'
                }`}
              >
                Sprint Board
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'ai'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-900'
                }`}
              >
                <Sparkles className="w-3 h-3 text-lime-300" />
                <span>AI Insights</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-neutral-900'
                }`}
              >
                DORA Metrics
              </button>
            </div>

            {/* Mockup Frame */}
            <div className="rounded-2xl p-[1px] bg-gradient-to-b from-emerald-500/20 via-white/6 to-white/0 shadow-2xl shadow-emerald-900/10">
              <div className="bg-[#111111] dark:bg-[#111111] light:bg-white rounded-[14px] border border-white/8 light:border-neutral-200 overflow-hidden text-left min-h-[440px] flex flex-col">
                {/* Topbar */}
                <div className="bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-neutral-100 px-5 py-3 border-b border-white/8 light:border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white dark:text-white light:text-neutral-900">
                      NOVA Workspace — Production
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                    All Systems Operational
                  </span>
                </div>

                {/* Tabbed Content */}
                <div className="p-5 sm:p-6 flex-1">
                  <AnimatePresence mode="wait">
                    {activeTab === 'sprint' && (
                      <motion.div
                        key="sprint"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-white dark:text-white light:text-neutral-900">
                              Platform 3.0 Release
                            </h4>
                            <p className="text-xs text-neutral-500">18 done · 4 in progress · 2 in review</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-400 px-2 py-1 rounded bg-emerald-500/15">
                            86% Complete
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {[
                            {
                              label: 'In Progress (4)',
                              dot: 'bg-teal-400',
                              tasks: [
                                { name: 'Rust Kernel Optimizer', meta: 'PR #492', status: 'Due Tomorrow', statusClass: 'text-amber-400', strike: false },
                                { name: 'Webhook Circuit Breaker', meta: 'PR #494', status: '92% Passing', statusClass: 'text-emerald-400', strike: false },
                              ],
                            },
                            {
                              label: 'AI Review (2)',
                              dot: 'bg-lime-400',
                              tasks: [
                                { name: 'SSO Token Refresher', meta: 'Security Scan', status: '3.2x faster', statusClass: 'text-lime-400', strike: false },
                              ],
                            },
                            {
                              label: 'Shipped (18)',
                              dot: 'bg-emerald-400',
                              tasks: [
                                { name: 'Global CDN Cache', meta: 'Verified', status: '0 errors', statusClass: 'text-emerald-400', strike: true },
                              ],
                            },
                          ].map((col) => (
                            <div
                              key={col.label}
                              className="p-3 rounded-xl bg-white/4 light:bg-neutral-50 border border-white/6 light:border-neutral-200 space-y-2.5"
                            >
                              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                                <span>{col.label}</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                              </div>
                              {col.tasks.map((task) => (
                                <div
                                  key={task.name}
                                  className="p-2.5 rounded-lg bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white border border-white/8 light:border-neutral-200 shadow-sm"
                                >
                                  <div className={`text-xs font-semibold text-white dark:text-white light:text-neutral-900 mb-1 ${task.strike ? 'line-through text-neutral-500' : ''}`}>
                                    {task.name}
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                                    <span>{task.meta}</span>
                                    <span className={task.statusClass}>{task.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'ai' && (
                      <motion.div
                        key="ai"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="p-4 rounded-xl bg-emerald-950/40 dark:bg-emerald-950/40 light:bg-emerald-50 border border-emerald-500/25">
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
                            <Sparkles className="w-4 h-4" />
                            <span>AI Sprint Synthesis (generated in 1.2s)</span>
                          </div>
                          <p className="text-xs text-neutral-300 dark:text-neutral-300 light:text-neutral-700 leading-relaxed">
                            Sprint 42 is pacing <strong className="text-white light:text-neutral-900">18% ahead</strong> of historic velocity. 4 frontend–backend dependency pairs were auto-linked, preventing an estimated 6 hours of blocker meetings.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-neutral-500">Autonomous Actions Taken:</div>
                          {[
                            { label: 'Auto-generated release changelog from 14 commits', status: 'Published' },
                            { label: 'Re-routed 2 bug tickets to Frontend Core squad', status: 'Assigned' },
                            { label: 'Optimized sprint capacity — shifted 3 tasks', status: 'Applied' },
                          ].map((action) => (
                            <div
                              key={action.label}
                              className="p-2.5 rounded-lg bg-white/4 light:bg-neutral-50 border border-white/6 light:border-neutral-200 flex items-center justify-between text-xs"
                            >
                              <span className="text-neutral-300 dark:text-neutral-300 light:text-neutral-800">
                                {action.label}
                              </span>
                              <span className="text-emerald-400 font-medium flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> {action.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                      <motion.div
                        key="analytics"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: 'Deploy Freq', value: '8.4/day', sub: 'Top 5%' },
                            { label: 'Lead Time', value: '1.8 hrs', sub: '-52% MoM' },
                            { label: 'Change Fail', value: '0.08%', sub: 'Exceptional' },
                            { label: 'MTTR', value: '14 min', sub: 'Auto-rollback' },
                          ].map((stat) => (
                            <div
                              key={stat.label}
                              className="p-3 rounded-xl bg-white/4 light:bg-neutral-50 border border-white/6 light:border-neutral-200"
                            >
                              <div className="text-[11px] text-neutral-500">{stat.label}</div>
                              <div className="text-lg font-bold text-white dark:text-white light:text-neutral-900">{stat.value}</div>
                              <div className="text-[10px] text-emerald-400">{stat.sub}</div>
                            </div>
                          ))}
                        </div>

                        {/* Bar chart */}
                        <div className="p-4 rounded-xl bg-white/4 light:bg-neutral-50 border border-white/6 light:border-neutral-200">
                          <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                            <span className="font-semibold text-white dark:text-white light:text-neutral-900 flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-emerald-400" />
                              Sprint Velocity Trajectory
                            </span>
                            <span>Last 8 Sprints</span>
                          </div>
                          <div className="flex items-end justify-between h-28 gap-2">
                            {[45, 52, 60, 58, 74, 82, 91, 98].map((val, idx) => (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                  style={{ height: `${val}%` }}
                                  className="w-full rounded-t-sm bg-gradient-to-t from-emerald-700 to-lime-400 transition-all duration-500 hover:brightness-125"
                                />
                                <span className="text-[9px] text-neutral-600">S{idx + 35}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer status */}
                <div className="bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-neutral-100 px-5 py-2.5 border-t border-white/8 light:border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>⚡ NOVA Engine v4.2 · Connected to GitHub</span>
                  <span className="text-emerald-400 font-medium">Latency: 28ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};