import React from 'react';
import { trustedCompanies } from '../data/companies';

export const TrustedCompanies: React.FC = () => {
  // Duplicate for seamless loop
  const doubled = [...trustedCompanies, ...trustedCompanies];

  return (
    <section className="py-12 border-y border-white/6 dark:border-white/6 light:border-neutral-200 bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs sm:text-sm font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-500 light:text-neutral-500 mb-8">
          Powering ambitious teams
        </p>

        {/* Marquee container with fade edges */}
        <div className="relative overflow-hidden">
          {/* Left fade */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0A0A0A] to-transparent dark:from-[#0A0A0A] light:from-neutral-50 z-10" />
          {/* Right fade */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0A0A0A] to-transparent dark:from-[#0A0A0A] light:from-neutral-50 z-10" />

          <div className="flex gap-10 sm:gap-14 animate-marquee whitespace-nowrap" aria-hidden="false">
            {doubled.map((company, idx) => (
              <div
                key={`${company.name}-${idx}`}
                className="inline-flex items-center gap-2 group cursor-default flex-shrink-0"
              >
                <span className="text-lg sm:text-xl text-neutral-500 dark:text-neutral-500 light:text-neutral-500 group-hover:text-emerald-400 transition-colors duration-300">
                  {company.symbol}
                </span>
                <span className="text-sm sm:text-base font-bold tracking-widest text-neutral-400 dark:text-neutral-400 light:text-neutral-600 group-hover:text-white dark:group-hover:text-white light:group-hover:text-neutral-900 transition-colors duration-300">
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
