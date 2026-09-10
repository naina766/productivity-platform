import React from 'react';
import { Star, Quote } from 'lucide-react';
import type { Testimonial } from '@/types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="h-full p-7 sm:p-8 rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] shadow-xl flex flex-col justify-between relative group hover:border-emerald-500/30 transition-all duration-300">
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/3 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Rating Stars & Quote Icon */}
        <div className="flex items-center justify-between mb-5">
          <div
            className="flex items-center gap-1"
            aria-label={`Rating: ${testimonial.rating} out of 5 stars`}
          >
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <Quote className="w-6 h-6 text-neutral-600 group-hover:text-emerald-500 transition-colors" />
        </div>

        {/* Quote text */}
        <blockquote className="text-base sm:text-lg text-[var(--text-primary)] leading-relaxed italic mb-6">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
      </div>

      <div className="relative">
        {/* Metric badge */}
        {testimonial.metric && (
          <div className="mb-4 inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-[var(--accent-primary)] text-xs font-semibold border border-emerald-500/20">
            ⚡ {testimonial.metric}
          </div>
        )}

        {/* Author details */}
        <div className="flex items-center gap-3.5 pt-4 border-t border-[var(--border-color)]/50">
          {/* Avatar initials instead of external images */}
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white border border-emerald-500/30 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #22C55E 0%, #14B8A6 100%)' }}
            aria-label={testimonial.name}
          >
            {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">
              {testimonial.name}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {testimonial.role},{' '}
              <span className="text-[var(--text-secondary)] font-medium">
                {testimonial.company}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};