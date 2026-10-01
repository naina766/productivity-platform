'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  Flame,
} from 'lucide-react';
import type { WorkspaceAnalytics } from '@/types/analytics';

interface AnalyticsOverviewProps {
  analytics: WorkspaceAnalytics | null;
  loading: boolean;
}

export function AnalyticsOverview({ analytics, loading }: AnalyticsOverviewProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-6 mb-8 animate-pulse">
        <div className="h-5 w-44 rounded-lg bg-[var(--bg-secondary)] mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="h-20 rounded-xl bg-[var(--bg-secondary)]" />
          <div className="h-20 rounded-xl bg-[var(--bg-secondary)]" />
          <div className="h-20 rounded-xl bg-[var(--bg-secondary)]" />
          <div className="h-20 rounded-xl bg-[var(--bg-secondary)]" />
        </div>
        <div className="h-6 rounded-lg bg-[var(--bg-secondary)]" />
      </div>
    );
  }

  if (!analytics || analytics.tasks.total === 0) {
    return null; // When workspace has no tasks yet, don't show empty analytics clutter
  }

  const { tasks, priorities, projects } = analytics;

  // Percentages for status bar
  const todoPct = tasks.total > 0 ? (tasks.todo / tasks.total) * 100 : 0;
  const inProgressPct = tasks.total > 0 ? (tasks.inProgress / tasks.total) * 100 : 0;
  const inReviewPct = tasks.total > 0 ? (tasks.inReview / tasks.total) * 100 : 0;
  const donePct = tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0;

  return (
    <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-5 sm:p-6 mb-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Workspace Analytics
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Real-time progress across all projects and tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {tasks.completionRate}% Done
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Total Tasks */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Total Tasks</span>
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">
            {tasks.total}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            {tasks.total - tasks.completed} active
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Completion</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {tasks.completionRate}%
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            {tasks.completed} of {tasks.total} done
          </div>
        </div>

        {/* In Progress */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>In Flight</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {tasks.inProgress + tasks.inReview}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            {tasks.inProgress} ongoing, {tasks.inReview} review
          </div>
        </div>

        {/* Overdue */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Overdue</span>
            <AlertTriangle
              className={`w-3.5 h-3.5 ${tasks.overdue > 0 ? 'text-red-400' : 'text-emerald-400'}`}
            />
          </div>
          <div
            className={`text-2xl font-extrabold ${
              tasks.overdue > 0 ? 'text-red-400' : 'text-[var(--text-primary)]'
            }`}
          >
            {tasks.overdue}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            {tasks.overdue > 0 ? 'Requires attention' : 'All deadlines on track'}
          </div>
        </div>
      </div>

      {/* Status Progress Multi-Segment Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
          <span>Task Status Distribution</span>
          <span>{tasks.total} Tasks</span>
        </div>

        <div className="h-3 w-full rounded-full bg-[var(--bg-secondary)] overflow-hidden flex">
          {donePct > 0 && (
            <div
              style={{ width: `${donePct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Done: ${tasks.completed} (${Math.round(donePct)}%)`}
            />
          )}
          {inReviewPct > 0 && (
            <div
              style={{ width: `${inReviewPct}%` }}
              className="bg-teal-400 transition-all duration-500"
              title={`In Review: ${tasks.inReview} (${Math.round(inReviewPct)}%)`}
            />
          )}
          {inProgressPct > 0 && (
            <div
              style={{ width: `${inProgressPct}%` }}
              className="bg-amber-400 transition-all duration-500"
              title={`In Progress: ${tasks.inProgress} (${Math.round(inProgressPct)}%)`}
            />
          )}
          {todoPct > 0 && (
            <div
              style={{ width: `${todoPct}%` }}
              className="bg-neutral-500 transition-all duration-500"
              title={`To Do: ${tasks.todo} (${Math.round(todoPct)}%)`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[var(--text-secondary)]">Done ({tasks.completed})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span className="text-[var(--text-secondary)]">In Review ({tasks.inReview})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-[var(--text-secondary)]">In Progress ({tasks.inProgress})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
            <span className="text-[var(--text-secondary)]">To Do ({tasks.todo})</span>
          </div>
        </div>
      </div>

      {/* Priority Distribution & Top Project Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-[var(--border-color)]">
        {/* Priority Breakdown */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Priority Breakdown</span>
          </h3>

          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-red-400 font-medium">Urgent</span>
                <span className="text-[var(--text-muted)]">{priorities.urgent} tasks</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div
                  style={{
                    width: `${tasks.total > 0 ? (priorities.urgent / tasks.total) * 100 : 0}%`,
                  }}
                  className="h-full bg-red-400 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-amber-400 font-medium">High</span>
                <span className="text-[var(--text-muted)]">{priorities.high} tasks</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div
                  style={{
                    width: `${tasks.total > 0 ? (priorities.high / tasks.total) * 100 : 0}%`,
                  }}
                  className="h-full bg-amber-400 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-lime-400 font-medium">Medium</span>
                <span className="text-[var(--text-muted)]">{priorities.medium} tasks</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div
                  style={{
                    width: `${tasks.total > 0 ? (priorities.medium / tasks.total) * 100 : 0}%`,
                  }}
                  className="h-full bg-lime-400 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-400 font-medium">Low</span>
                <span className="text-[var(--text-muted)]">{priorities.low} tasks</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div
                  style={{
                    width: `${tasks.total > 0 ? (priorities.low / tasks.total) * 100 : 0}%`,
                  }}
                  className="h-full bg-neutral-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Project Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Project Completion</span>
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">
              {projects.total} {projects.total === 1 ? 'project' : 'projects'}
            </span>
          </div>

          <div className="space-y-2.5">
            {projects.progressList.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group block p-2.5 rounded-xl bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors truncate max-w-[200px]">
                    {p.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-semibold text-emerald-400">
                      {p.completionRate}%
                    </span>
                    <ArrowRight className="w-3 h-3 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div className="h-1.5 rounded-full bg-[var(--card-main)] overflow-hidden">
                  <div
                    style={{ width: `${p.completionRate}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
