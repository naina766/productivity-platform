import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Close on Escape & trap scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus close button initially
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

  // Auto-advance when playing
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4500);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying]);

  const walkthroughSteps = [
    {
      title: '1. Task Automation',
      badge: 'Natural Language AI',
      icon: Bot,
      headline: 'Transform meeting notes into prioritized sprint backlog in seconds',
      description:
        'NOVA scans project specs, transcripts, and pull requests to extract actionable epics, calculate story points, and auto-assign tasks based on engineer context.',
      details: [
        'Automatic dependency mapping',
        'Natural language sprint creation',
        'Smart engineer context assignment',
      ],
      previewState: (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/25 text-xs">
            <div className="text-emerald-400 font-mono text-[11px] mb-1">
              INPUT: &quot;Need to launch OAuth2 by Thursday and write documentation&quot;
            </div>
            <div className="text-white font-medium">⚡ Synthesizing 3 engineering tasks...</div>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded bg-white/5 border border-white/8 flex items-center justify-between">
              <span className="text-neutral-200">Task 1: Setup OAuth2 Provider with PKCE</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                3 pts · Alex M.
              </span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/8 flex items-center justify-between">
              <span className="text-neutral-200">Task 2: Write API authentication docs</span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">
                2 pts · Sarah J.
              </span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/8 flex items-center justify-between">
              <span className="text-neutral-200">Task 3: Security audit & penetration test</span>
              <span className="text-[10px] bg-lime-500/20 text-lime-300 px-2 py-0.5 rounded">
                5 pts · Ravi K.
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '2. AI Insights',
      badge: 'Predictive Intelligence',
      icon: AlertTriangle,
      headline: 'Flag stalled PR reviews before they endanger release deadlines',
      description:
        'Our telemetry detects when pull requests stall beyond SLA thresholds, instantly alerting squad leads and recommending re-assignment.',
      details: [
        'Proactive critical-path notifications',
        'PR review latency heatmaps',
        'Automated workload balance',
      ],
      previewState: (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-amber-300 font-bold">Bottleneck Alert: PR #402 Pending 48h</div>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Reviewer Marcus is over capacity. Shift to Maya to unblock 3 dependent frontend components.
              </p>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Auto-rebalance applied — saves estimated 1.8 days</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/4 border border-white/8 text-xs flex items-center justify-between">
            <span className="text-neutral-400">Your Design Sprint is 18% ahead of schedule.</span>
            <span className="text-emerald-400 font-semibold">On track</span>
          </div>
        </div>
      ),
    },
    {
      title: '3. Team Velocity',
      badge: 'DORA Telemetry',
      icon: TrendingUp,
      headline: 'Deliver on predictable schedules with objective engineering analytics',
      description:
        'Gain unprecedented visibility into team throughput, lead time for changes, and cycle time — without manual time-tracking.',
      details: [
        'Zero manual logging required',
        'Automatic Git commit & PR tracking',
        'Transparent squad retrospectives',
      ],
      previewState: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded bg-white/5 border border-white/8">
              <span className="text-neutral-500 text-[10px]">Sprint Delivery Probability</span>
              <div className="text-base font-bold text-emerald-400 font-mono">98.4%</div>
            </div>
            <div className="p-2.5 rounded bg-white/5 border border-white/8">
              <span className="text-neutral-500 text-[10px]">Avg PR Review Time</span>
              <div className="text-base font-bold text-teal-400 font-mono">1.4 hrs</div>
            </div>
            <div className="p-2.5 rounded bg-white/5 border border-white/8">
              <span className="text-neutral-500 text-[10px]">Deploy Frequency</span>
              <div className="text-base font-bold text-lime-400 font-mono">8.4/day</div>
            </div>
            <div className="p-2.5 rounded bg-white/5 border border-white/8">
              <span className="text-neutral-500 text-[10px]">Change Failure Rate</span>
              <div className="text-base font-bold text-emerald-400 font-mono">0.08%</div>
            </div>
          </div>
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Milestone &quot;v3.0 Production&quot; scheduled to ship 2 days early</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Dialog Window */}
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
            {/* Top border beam */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent"
            />

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-lime-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 id="modal-title" className="text-sm font-bold tracking-tight text-white">
                    NOVA Interactive Walkthrough
                  </h3>
                  <p className="text-[11px] text-neutral-500">Experience the AI productivity engine</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? 'Pause walkthrough' : 'Play walkthrough'}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
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

            {/* Step Tabs */}
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

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                      {walkthroughSteps[activeStep].badge}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      {walkthroughSteps[activeStep].headline}
                    </h4>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      {walkthroughSteps[activeStep].description}
                    </p>
                  </div>

                  {/* Interactive Preview Area */}
                  <div className="p-4 sm:p-5 rounded-xl bg-black/30 border border-white/8 shadow-inner mb-4">
                    {walkthroughSteps[activeStep].previewState}
                  </div>

                  {/* Key Capabilities */}
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

            {/* Modal Footer */}
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
                  <a
                    href="#pricing"
                    onClick={onClose}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 shadow-md shadow-emerald-500/20"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
