import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { testimonialsData } from '../data/testimonials';
import { TestimonialCard } from './TestimonialCard';

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonialsData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonialsData.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-24 bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-neutral-50/60 border-y border-white/6 dark:border-white/6 light:border-neutral-200 relative overflow-hidden">
      {/* Subtle glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-600/5 blur-[120px] rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 light:bg-emerald-50 border border-emerald-500/20 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Success</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white dark:text-white light:text-neutral-950 tracking-tight">
              Loved by high-velocity teams.
            </h2>

            <p className="mt-3 text-base sm:text-lg text-neutral-400 dark:text-neutral-400 light:text-neutral-600 max-w-xl">
              See how visionary product and engineering leaders scale execution with NOVA.
            </p>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="p-3 rounded-full bg-[#111111] dark:bg-[#111111] light:bg-white border border-white/8 dark:border-white/8 light:border-neutral-200 text-neutral-400 dark:text-neutral-400 light:text-neutral-700 hover:text-white dark:hover:text-white hover:border-emerald-500/40 shadow-md transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="p-3 rounded-full bg-[#111111] dark:bg-[#111111] light:bg-white border border-white/8 dark:border-white/8 light:border-neutral-200 text-neutral-400 dark:text-neutral-400 light:text-neutral-700 hover:text-white dark:hover:text-white hover:border-emerald-500/40 shadow-md transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile: Single card */}
        <div className="lg:hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <TestimonialCard testimonial={testimonialsData[currentIndex]} />
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonialsData.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to testimonial ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-neutral-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: 3-card slice */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((offset) => {
            const itemIndex = (currentIndex + offset) % testimonialsData.length;
            const item = testimonialsData[itemIndex];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: offset * 0.08 }}
              >
                <TestimonialCard testimonial={item} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
