import React from 'react';
import { trustedCompanies } from '@/data/companies';

export const TrustedCompanies: React.FC = () => {
  // Duplicate for seamless loop
  const doubled = [...trustedCompanies, ...trustedCompanies];

  return (
    <section className="py-12 border-y border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs sm:text-sm font-medium tracking-widest uppercase text-[var(--text-muted)] mb-8">
          Powering ambitious teams
        </p>

        {/* Marquee container with fade edges */}
        <div className="relative overflow-hidden">
          {/* Left fade */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--bg-secondary)] to-transparent z-10" />
          {/* Right fade */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--bg-secondary)] to-transparent z-10" />

          <div className="flex gap-10 sm:gap-14 animate-marquee whitespace-nowrap" aria-hidden="false">
            {doubled.map((company, idx) => (
              <div
                key={`${company.name}-${idx}`}
                className="inline-flex items-center gap-2 group cursor-default flex-shrink-0"
              >
                <span className="text-lg sm:text-xl text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors duration-300">
                  {company.symbol}
                </span>
                <span className="text-sm sm:text-base font-bold tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-300">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};