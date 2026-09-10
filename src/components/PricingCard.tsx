import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import type { PricingPlan } from '../types';

interface PricingCardProps {
  plan: PricingPlan;
  isYearly: boolean;
  onOpenDemo?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isYearly, onOpenDemo }) => {
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
        plan.highlighted
          ? 'bg-gradient-to-b from-[#0d1f12] to-[#111111] dark:from-[#0d1f12] dark:to-[#111111] light:from-emerald-50/70 light:to-white border-2 border-emerald-500 shadow-2xl shadow-emerald-500/12 lg:-translate-y-2'
          : 'bg-[#111111] dark:bg-[#111111] light:bg-white border border-white/8 dark:border-white/8 light:border-neutral-200 shadow-lg'
      }`}
    >
      {/* Most Popular Badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${
              plan.highlighted
                ? 'bg-gradient-to-r from-emerald-600 to-lime-500 text-white shadow-emerald-500/20'
                : 'bg-neutral-800 text-neutral-300 border border-white/10'
            }`}
          >
            {plan.badge}
          </span>
        </div>
      )}

      {/* Subtle animated border beam for highlighted card */}
      {plan.highlighted && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />
        </div>
      )}

      <div>
        {/* Tier Name & Subtitle */}
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold text-white dark:text-white light:text-neutral-900 mb-2">
            {plan.name}
          </h3>
          <p className="text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600 min-h-[40px]">
            {plan.description}
          </p>
        </div>

        {/* Price Display */}
        <div className="mb-8 pb-6 border-b border-white/8 dark:border-white/8 light:border-neutral-200">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-extrabold text-white dark:text-white light:text-neutral-950 font-mono">
              ${price}
            </span>
            <span className="text-neutral-500 dark:text-neutral-500 light:text-neutral-500 text-sm font-medium">
              /month
            </span>
          </div>

          <div className="text-xs text-neutral-500 dark:text-neutral-500 light:text-neutral-500 mt-2">
            {plan.monthlyPrice === 0 ? (
              'Free forever for small teams'
            ) : isYearly ? (
              <span className="text-emerald-400 font-medium">Billed annually (Save 20%)</span>
            ) : (
              'Billed monthly, cancel anytime'
            )}
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-3.5 mb-8">
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-500 light:text-neutral-500 uppercase tracking-wider">
            Included in {plan.name}:
          </div>
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start gap-3 text-sm text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                  plan.highlighted
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/8 text-neutral-400'
                }`}
              >
                <Check className="w-3 h-3" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={plan.ctaText.includes('Demo') ? onOpenDemo : undefined}
        className={`w-full py-3.5 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          plan.highlighted
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35'
            : 'bg-white/5 dark:bg-white/5 light:bg-neutral-100 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-neutral-200 text-white dark:text-white light:text-neutral-800 border border-white/8 dark:border-white/8 light:border-neutral-300'
        }`}
      >
        <span>{plan.ctaText}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
