'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Clock,
  Bot,
  Zap,
  Check,
  TrendingUp,
  Search,
  Shield,
} from 'lucide-react';

interface HeroProps {
  onOpenDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDemo }) => {
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-dot-pattern">
      {/* Subtle green/teal glow backgrounds — NO blue/violet */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-500/12 via-teal-500/8 to-transparent blur-[120px] rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -left-32 w-80 h-80 bg-emerald-600/6 blur-[90px] rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-32 w-80 h-80 bg-teal-600/6 blur-[90px] rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 light:bg-emerald-50 border border-emerald-500/20 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 text-xs sm:text-sm font-medium mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-lime-400 animate-pulse" />
            <span>AI-powered productivity for modern teams</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-extrabold tracking-tight text-white dark:text-white light:text-neutral-950 font-sans leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}
          >
            Build Better.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-lime-400 to-teal-400 bg-clip-text text-transparent">
              Work Smarter.
            </span>
          </motion.h1>

          {/* Supporting copy */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-neutral-400 dark:text-neutral-400 light:text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Projects, people, automation, and intelligent insights — all in one workspace designed for teams that move fast.
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-6"
          >
            <a
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 group active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span>Start Free</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              type="button"
              onClick={onOpenDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-neutral-200 dark:text-neutral-200 light:text-neutral-800 bg-neutral-900/80 dark:bg-neutral-900/80 light:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-800 light:hover:bg-neutral-200 border border-white/10 dark:border-white/10 light:border-neutral-300 transition-all duration-200 group active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Play className="w-4 h-4 mr-2 text-emerald-400 fill-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Watch Demo</span>
            </button>
          </motion.div>

          {/* Trust statement */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-500 light:text-neutral-500 flex items-center justify-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>No credit card required · Free 14-day trial</span>
          </motion.p>
        </div>

        {/* NOVA Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-14 max-w-5xl mx-auto"
        >
          {/* Outer glow ring */}
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-emerald-500/30 via-white/8 to-white/0 shadow-2xl shadow-emerald-900/20">
            <div className="bg-[#111111] dark:bg-[#111111] light:bg-white rounded-[14px] border border-white/8 light:border-neutral-200 overflow-hidden text-left">
              {/* Browser window chrome */}
              <div className="bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-neutral-100 px-4 py-3 border-b border-white/8 light:border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs text-neutral-500 font-mono hidden sm:inline-block">
                    app.nova.io/workspace
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded bg-white/5 dark:bg-white/5 light:bg-neutral-200/80 text-[11px] text-neutral-500 flex items-center gap-1.5">
                    <Search className="w-3 h-3" />
                    <span className="hidden sm:inline">Search anything... ⌘K</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-400 font-medium">Live Sync</span>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Mini Sidebar */}
                <div className="hidden lg:block lg:col-span-3 border-r border-white/8 light:border-neutral-200 pr-5 space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-white/5 light:border-neutral-200">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-lime-500 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-emerald-500/20">
                      N
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white dark:text-white light:text-neutral-900">
                        Nova Core Team
                      </div>
                      <div className="text-[10px] text-neutral-500">14 Active Members</div>
                    </div>
                  </div>

                  {/* Nav Items */}
                  <div className="space-y-1 text-xs">
                    {[
                      { label: 'Overview', active: false },
                      { label: 'Sprint 42 (Current)', active: true, badge: '82%' },
                      { label: 'Roadmap Q3', active: false, meta: '12 tasks' },
                      { label: 'Design System v2', active: false, meta: '6 tasks' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                          item.active
                            ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] bg-emerald-500/25 px-1.5 py-0.5 rounded text-emerald-300">
                            {item.badge}
                          </span>
                        )}
                        {item.meta && (
                          <span className="text-[10px] text-neutral-600">{item.meta}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-2">
                      Collaborators
                    </div>
                    <div className="flex -space-x-1.5">
                      {['MC', 'EK', 'JL'].map((initials, i) => (
                        <div
                          key={initials}
                          className={`w-6 h-6 rounded-full border border-[#111111] flex items-center justify-center text-[8px] font-bold text-white ${
                            ['bg-emerald-700', 'bg-teal-700', 'bg-lime-700'][i]
                          }`}
                        >
                          {initials}
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full bg-neutral-800 border border-[#111111] flex items-center justify-center text-[10px] text-neutral-400 font-medium">
                        +8
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 space-y-4">
                  {/* Good morning greeting */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-neutral-500">Wednesday, Sep 10</p>
                      <h2 className="text-sm font-bold text-white dark:text-white light:text-neutral-900">
                        Good morning, Naina 👋
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 font-medium">3 tasks ready</span>
                    </div>
                  </div>

                  {/* Top Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white/4 light:bg-neutral-50 border border-white/6 light:border-neutral-200">
                      <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                        <span>Sprint Velocity</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-lg font-bold text-white dark:text-white light:text-neutral-900">
                        94.2%
                      </div>
                      <div className="w-full bg-white/8 light:bg-neutral-200 rounded-full h-1.5 mt-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full w-[94%]" />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/4 light:bg-neutral-50 border border-white/6 light:border-neutral-200">
                      <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                        <span>Automated Tasks</span>
                        <Zap className="w-3.5 h-3.5 text-lime-400" />
                      </div>
                      <div className="text-lg font-bold text-white dark:text-white light:text-neutral-900">
                        128{' '}
                        <span className="text-xs text-emerald-400 font-normal">+18 today</span>
                      </div>
                      <div className="w-full bg-white/8 light:bg-neutral-200 rounded-full h-1.5 mt-2">
                        <div className="bg-gradient-to-r from-lime-400 to-emerald-500 h-1.5 rounded-full w-[78%]" />
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/4 light:bg-neutral-50 border border-white/6 light:border-neutral-200">
                      <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                        <span>AI Score</span>
                        <Bot className="w-3.5 h-3.5 text-teal-400" />
                      </div>
                      <div className="text-lg font-bold text-white dark:text-white light:text-neutral-900">
                        96{' '}
                        <span className="text-xs text-emerald-400 font-normal">Excellent</span>
                      </div>
                      <div className="w-full bg-white/8 light:bg-neutral-200 rounded-full h-1.5 mt-2">
                        <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-1.5 rounded-full w-[96%]" />
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion Panel */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/50 via-teal-950/30 to-emerald-950/50 light:from-emerald-50 light:to-teal-50 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-emerald-300 dark:text-emerald-300 light:text-emerald-900 flex items-center gap-1.5">
                          <span>AI Copilot Recommendation</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            97% confidence
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 light:text-neutral-600">
                          {suggestionAccepted
                            ? '✓ Workflows re-balanced! 2 PR review blockers automatically resolved.'
                            : 'Workload imbalance detected in Backend Sprint. Shift 2 tasks to maintain 94% on-time delivery.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!suggestionAccepted ? (
                        <button
                          type="button"
                          onClick={() => setSuggestionAccepted(true)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                        >
                          Apply Fix
                        </button>
                      ) : (
                        <span className="inline-flex items-center text-xs text-emerald-400 font-medium">
                          <Check className="w-3.5 h-3.5 mr-1" /> Applied
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task Progress Rows */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 px-1">
                      <span>Active Project Tasks</span>
                      <span>Status</span>
                    </div>

                    {[
                      {
                        label: 'Deploy AI Summarization Pipeline to Prod',
                        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
                        badge: 'Completed',
                        badgeClass: 'bg-emerald-500/20 text-emerald-400',
                      },
                      {
                        label: 'Automate Cross-Team PR Reviews & Retros',
                        icon: (
                          <div className="w-4 h-4 rounded-full border-2 border-teal-400 border-t-transparent animate-spin flex-shrink-0" />
                        ),
                        badge: 'In Progress (85%)',
                        badgeClass: 'bg-teal-500/20 text-teal-400',
                      },
                      {
                        label: 'Sync Multi-Tenant Enterprise RBAC Schema',
                        icon: <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />,
                        badge: 'In Review',
                        badgeClass: 'bg-amber-500/20 text-amber-400',
                      },
                    ].map((task) => (
                      <div
                        key={task.label}
                        className="p-2.5 rounded-lg bg-white/4 light:bg-neutral-50 border border-white/6 light:border-neutral-200 flex items-center justify-between gap-3 hover:border-emerald-500/20 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {task.icon}
                          <span className="text-xs font-medium text-white dark:text-white light:text-neutral-800 truncate">
                            {task.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${task.badgeClass}`}>
                            {task.badge}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};