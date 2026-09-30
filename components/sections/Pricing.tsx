'use client';

import React, { useState } from 'react';
import { pricingPlans } from '@/data/pricing';
import { PricingCard } from '@/components/ui/PricingCard';
import { Sparkles, HelpCircle } from 'lucide-react';

interface PricingProps {
  onOpenDemo?: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenDemo }) => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* NOVA green glow — no blue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-600/6 blur-[120px] rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-emerald-500/20 text-[var(--accent-primary)] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pricing concept</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
            Simple, transparent pricing.
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-2">
            Every feature shown here is available to every account.
          </p>

          <p className="text-xs text-[var(--text-muted)] mb-8">
            This is a portfolio demo. Actual pricing has not been finalized.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-inner">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                !isYearly
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Monthly Billing
            </button>

            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isYearly
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-lime-400 text-[#050505] text-[10px] font-extrabold uppercase">
                Concept only
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isYearly={isYearly}
              onOpenDemo={onOpenDemo}
            />
          ))}
        </div>

        {/* Footnote */}
        <div className="mt-14 text-center">
          <p className="text-xs sm:text-sm text-[var(--text-muted)] flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[var(--accent-teal)]" />
            <span>Questions about a plan?</span>
            <a
              href="#faq"
              className="text-[var(--accent-primary)] hover:text-[var(--accent-highlight)] underline font-medium ml-1"
            >
              Check the FAQ
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};