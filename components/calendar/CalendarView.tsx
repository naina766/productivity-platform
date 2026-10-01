'use client';

import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import type { TaskSummary, TaskPriority, TaskStatus } from '@/types/task';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/types/task';
import {
  getMonthDays,
  getWeekDays,
  groupTasksByDate,
  formatMonthYear,
  formatDateKey,
  type CalendarDay,
} from '@/lib/calendar/calendar-utils';

const STATUS_CHIP: Record<TaskStatus, { bg: string; text: string; border: string }> = {
  TODO: {
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-300',
    border: 'border-neutral-500/20',
  },
  IN_PROGRESS: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  IN_REVIEW: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/20',
  },
  DONE: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400 line-through opacity-75',
    border: 'border-emerald-500/20',
  },
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  LOW: 'bg-neutral-400',
  MEDIUM: 'bg-lime-400',
  HIGH: 'bg-amber-400',
  URGENT: 'bg-red-400',
};

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CalendarViewProps<T extends TaskSummary = TaskSummary> {
  tasks: T[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onTaskClick: (task: T) => void;
  onDayClick?: (date: Date) => void;
  viewMode?: 'month' | 'week';
  onViewModeChange?: (mode: 'month' | 'week') => void;
}

export function CalendarView<T extends TaskSummary = TaskSummary>({
  tasks,
  currentDate,
  onDateChange,
  onTaskClick,
  onDayClick,
  viewMode = 'month',
  onViewModeChange,
}: CalendarViewProps<T>) {
  const [selectedDayPopover, setSelectedDayPopover] = useState<{
    day: CalendarDay;
    tasks: T[];
  } | null>(null);

  const groupedTasks = useMemo(() => groupTasksByDate(tasks), [tasks]);

  const monthDays = useMemo(
    () => getMonthDays(currentDate.getFullYear(), currentDate.getMonth(), new Date()),
    [currentDate]
  );

  const weekDays = useMemo(
    () => getWeekDays(currentDate, new Date()),
    [currentDate]
  );

  // Month navigation
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    onDateChange(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    onDateChange(next);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] overflow-hidden shadow-sm">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            {viewMode === 'month'
              ? formatMonthYear(currentDate)
              : `Week of ${formatMonthYear(weekDays[0].date)}`}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          {onViewModeChange && (
            <div className="flex items-center bg-[var(--bg-secondary)] rounded-xl p-0.5 border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => onViewModeChange('month')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'month'
                    ? 'bg-[var(--card-main)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('week')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'week'
                    ? 'bg-[var(--card-main)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Week
              </button>
            </div>
          )}

          {/* Navigation arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-muted)] transition-all"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous"
              className="w-7 h-7 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-muted)] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next"
              className="w-7 h-7 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-muted)] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday column names */}
      <div className="grid grid-cols-7 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-center text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase py-2.5">
        {WEEKDAY_NAMES.map((name) => (
          <div key={name}>{name}</div>
        ))}
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-7 auto-rows-[minmax(95px,1fr)] sm:auto-rows-[minmax(120px,1fr)] divide-x divide-y divide-[var(--border-color)]">
          {monthDays.map((day) => {
            const dayTasks = groupedTasks.get(day.dateKey) ?? [];
            const isSelected = selectedDayPopover?.day.dateKey === day.dateKey;

            return (
              <div
                key={day.dateKey}
                onClick={() => onDayClick?.(day.date)}
                className={`relative p-1.5 sm:p-2 flex flex-col group transition-colors min-h-[95px] sm:min-h-[120px] ${
                  !day.isCurrentMonth
                    ? 'bg-[var(--bg-secondary)]/20 text-[var(--text-muted)] opacity-60'
                    : 'bg-transparent text-[var(--text-primary)]'
                } ${day.isWeekend ? 'bg-[var(--bg-secondary)]/10' : ''} ${
                  day.isToday ? 'bg-emerald-500/[0.03]' : ''
                } hover:bg-[var(--bg-secondary)]/40`}
              >
                {/* Day header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-semibold rounded-full w-6 h-6 ${
                      day.isToday
                        ? 'bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/30'
                        : day.isCurrentMonth
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Add task button on day hover */}
                  {onDayClick && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDayClick(day.date);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-emerald-400 border border-[var(--border-color)] flex items-center justify-center transition-all"
                      title="Add task on this day"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Task chips list */}
                <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((task) => {
                    const chipStyle = STATUS_CHIP[task.status];
                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                        className={`group/task flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border truncate cursor-pointer transition-all hover:scale-[1.02] shadow-xs ${chipStyle.bg} ${chipStyle.text} ${chipStyle.border}`}
                        title={`${task.title} (${TASK_STATUS_LABELS[task.status]})`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            PRIORITY_DOT[task.priority]
                          }`}
                        />
                        <span className="truncate">{task.title}</span>
                      </div>
                    );
                  })}

                  {/* +N more indicator */}
                  {dayTasks.length > 3 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDayPopover({ day, tasks: dayTasks });
                      }}
                      className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 text-left px-1 mt-auto hover:underline"
                    >
                      +{dayTasks.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Week View Grid */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-color)] min-h-[350px]">
          {weekDays.map((day) => {
            const dayTasks = groupedTasks.get(day.dateKey) ?? [];

            return (
              <div
                key={day.dateKey}
                onClick={() => onDayClick?.(day.date)}
                className={`p-3 flex flex-col transition-colors ${
                  day.isToday ? 'bg-emerald-500/[0.04]' : 'bg-transparent'
                } hover:bg-[var(--bg-secondary)]/30`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-color)]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold sm:hidden mr-2">
                      {WEEKDAY_NAMES[(day.date.getDay() + 6) % 7]}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center text-xs font-semibold rounded-full w-6 h-6 ${
                        day.isToday
                          ? 'bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/30'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                  </div>

                  <span className="text-[10px] font-medium text-[var(--text-muted)]">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                {/* Full tasks list in week view */}
                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[320px]">
                  {dayTasks.length === 0 ? (
                    <div className="text-[11px] text-[var(--text-muted)] py-4 text-center italic">
                      No tasks
                    </div>
                  ) : (
                    dayTasks.map((task) => {
                      const chipStyle = STATUS_CHIP[task.status];
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(task);
                          }}
                          className={`p-2 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.02] shadow-xs ${chipStyle.bg} ${chipStyle.border}`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${chipStyle.border} ${chipStyle.text}`}
                            >
                              {TASK_STATUS_LABELS[task.status]}
                            </span>
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                PRIORITY_DOT[task.priority]
                              }`}
                              title={TASK_PRIORITY_LABELS[task.priority]}
                            />
                          </div>
                          <p className="font-medium text-[var(--text-primary)] truncate">
                            {task.title}
                          </p>
                          {(task as { projectName?: string }).projectName && (
                            <span className="text-[10px] text-emerald-400 mt-1 block truncate">
                              {(task as { projectName?: string }).projectName}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day details modal / popover when +N more clicked */}
      {selectedDayPopover && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedDayPopover(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] shadow-2xl p-5 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Tasks for {selectedDayPopover.day.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {selectedDayPopover.tasks.length} tasks scheduled
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayPopover(null)}
                className="w-7 h-7 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {selectedDayPopover.tasks.map((task) => {
                const chipStyle = STATUS_CHIP[task.status];
                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedDayPopover(null);
                      onTaskClick(task);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer hover:border-emerald-500/40 transition-all ${chipStyle.bg} ${chipStyle.border}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {task.title}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                      <span>{TASK_STATUS_LABELS[task.status]}</span>
                      <span>•</span>
                      <span>{TASK_PRIORITY_LABELS[task.priority]}</span>
                      {(task as { projectName?: string }).projectName && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">
                            {(task as { projectName?: string }).projectName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
