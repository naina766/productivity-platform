'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';

interface CTAProps {
  onOpenDemo?: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onOpenDemo }) => {
  return (
    <section className="py-24 relative overflow-hidden bg-dot-pattern">
      {/* Green/teal background glow — no blue/violet */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="w-[650px] h-[350px] bg-gradient-to-r from-emerald-600/12 via-teal-500/10 to-lime-600/8 blur-[130px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl p-8 sm:p-14 lg:p-16 bg-gradient-to-b from-[#0d1f12] to-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl shadow-emerald-900/20 text-center overflow-hidden">
          {/* Decorative top glow line */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent"
          />
          {/* Decorative orb */}
          <div
            aria-hidden="true"
            className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/8 rounded-full blur-2xl pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-emerald-500/20 text-[var(--accent-primary)] text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start In Seconds</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mb-6">
              Turn busywork into momentum.
            </h2>

            <p className="text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
              Give your team one intelligent workspace to plan, collaborate, and deliver better work.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="#pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 group active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span>Start Free</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                type="button"
                onClick={onOpenDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-[var(--text-primary)] bg-[var(--card-main)]/50 hover:bg-[var(--card-main)] border border-[var(--border-color)] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <MessageSquare className="w-4 h-4 mr-2 text-teal-400" />
                <span>Talk to Sales</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SOC-2 Type II Certified
              </span>
              <span>•</span>
              <span>14-day free trial on Pro</span>
              <span>•</span>
              <span>No credit card required</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};