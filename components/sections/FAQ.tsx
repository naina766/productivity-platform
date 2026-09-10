'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqData } from '@/data/faq';

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(faqData[0].id);

  const toggleFAQ = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section id="faq" className="py-24 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-emerald-500/20 text-[var(--accent-primary)] text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
            Frequently Asked Questions
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-secondary)]">
            Everything you need to know about NOVA, pricing, security, and onboarding.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqData.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl bg-[var(--card-main)] border overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                    : 'border-[var(--border-color)]'
                }`}
              >
                <button
                  type="button"
                  id={`faq-btn-${item.id}`}
                  aria-controls={`faq-answer-${item.id}`}
                  aria-expanded={isOpen}
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:bg-[var(--card-elevated)] transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    {item.question}
                  </span>

                  <ChevronDown
                    className={`w-5 h-5 text-emerald-400 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${item.id}`}
                      role="region"
                      aria-labelledby={`faq-btn-${item.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)]">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};