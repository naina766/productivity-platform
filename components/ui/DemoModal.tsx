'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  Layers,
  CheckSquare2,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    const timeout = setTimeout(() => {
      const closeBtn = modalRef.current?.querySelector<HTMLButtonElement>('#modal-close-btn');
      closeBtn?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      clearTimeout(timeout);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, [isOpen, isPlaying]);

  const walkthroughSteps = [
    {
      title: '1. Organize',
      icon: Layers,
      headline: 'Create a workspace and structure your projects',
      description:
        'Set up a workspace, invite your team members, and organize work into dedicated projects — each with its own board and task list.',
      details: [
        'One workspace per team',
        'Unlimited projects inside each workspace',
        'Role-based member access',
      ],
      previewState: (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 border border-white/8">
            <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-white font-medium">NOVA Workspace — Product Team</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Marketing Site', 'Mobile App', 'API Platform', 'Design System'].map((name) => (
              <div
                key={name}
                className="p-2.5 rounded-lg bg-white/4 border border-white/8 text-xs text-neutral-300"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '2. Track Tasks',
      icon: CheckSquare2,
      headline: 'Assign work and track it across four clear statuses',
      description:
        'Create tasks, assign owners, set due dates, and move them through to do, in progress, in review, and done — all in one place.',
      details: [
        'Four clear task statuses',
        'Assign tasks to any team member',
        'Due dates and labels',
      ],
      previewState: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'To Do', color: 'bg-neutral-500', tasks: ['Write docs', 'Design survey'] },
            { label: 'In Progress', color: 'bg-teal-400', tasks: ['Task board UI'] },
            { label: 'In Review', color: 'bg-lime-400', tasks: ['Project roadmap'] },
            { label: 'Done', color: 'bg-emerald-400', tasks: ['Set up workspace'] },
          ].map((col) => (
            <div key={col.label} className="p-2 rounded-lg bg-white/4 border border-white/8">
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  {col.label}
                </span>
              </div>
              {col.tasks.map((task) => (
                <div
                  key={task}
                  className="p-2 rounded bg-white/5 border border-white/8 text-xs text-neutral-300 mb-1.5"
                >
                  {task}
                </div>
              ))}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '3. Stay Aligned',
      icon: MessageSquare,
      headline: 'See every change in the activity feed and task comments',
      description:
        'Review what your team has been working on without chasing status updates — task moves, new comments, and member changes are all recorded on the project timeline.',
      details: [
        'Activity feed per project',
        'Task-level comments',
        'No status meetings required',
      ],
      previewState: (
        <div className="space-y-2">
          {[
            {
              text: 'Design moved "Task board UI" to In Progress',
              time: 'just now',
              icon: CheckSquare2,
              color: 'text-teal-400',
            },
            {
              text: 'PM added a comment to "Write docs"',
              time: '5 min ago',
              icon: MessageSquare,
              color: 'text-emerald-400',
            },
            {
              text: 'Eng completed "Set up workspace"',
              time: '1 hr ago',
              icon: CheckCircle2,
              color: 'text-emerald-400',
            },
            {
              text: 'A new member joined the workspace',
              time: '2 hrs ago',
              icon: Clock,
              color: 'text-neutral-400',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-white/4 border border-white/8 flex items-center gap-2.5 text-xs"
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${item.color}`} />
                <span className="text-neutral-300 flex-1 min-w-0 truncate">{item.text}</span>
                <span className="text-neutral-500 flex-shrink-0 text-[10px]">{item.time}</span>
              </div>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-3xl rounded-2xl bg-[#111111] border border-emerald-500/20 text-white shadow-2xl shadow-emerald-900/20 overflow-hidden z-10"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent"
            />

            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-lime-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Play className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <div>
                  <h3 id="modal-title" className="text-sm font-bold tracking-tight text-white">
                    NOVA product walkthrough
                  </h3>
                  <p className="text-[11px] text-neutral-500">See how teams use NOVA day to day</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? 'Pause walkthrough' : 'Play walkthrough'}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 text-emerald-400" />
                  )}
                </button>

                <button
                  id="modal-close-btn"
                  type="button"
                  onClick={onClose}
                  aria-label="Close walkthrough modal"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-white/8 bg-white/3 text-xs">
              {walkthroughSteps.map((step, idx) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`py-3 px-2 sm:px-4 text-center font-medium transition-all relative focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    activeStep === idx
                      ? 'text-white font-semibold bg-white/8'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <span className="truncate block">{step.title}</span>
                  {activeStep === idx && (
                    <motion.div
                      layoutId="modal-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-4">
                    <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      {walkthroughSteps[activeStep].headline}
                    </h4>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      {walkthroughSteps[activeStep].description}
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-black/30 border border-white/8 shadow-inner mb-4">
                    {walkthroughSteps[activeStep].previewState}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {walkthroughSteps[activeStep].details.map((detail) => (
                      <div key={detail} className="flex items-center gap-2 text-xs text-neutral-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="px-6 py-4 bg-black/20 border-t border-white/8 flex items-center justify-between">
              <div className="text-xs text-neutral-500">
                Step {activeStep + 1} of {walkthroughSteps.length}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : 2))}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Previous
                </button>

                {activeStep < walkthroughSteps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => prev + 1)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 shadow-md shadow-emerald-500/20"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 shadow-md shadow-emerald-500/20"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};