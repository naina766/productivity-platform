'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { CheckSquare2, ShieldCheck, Palette, Layers } from 'lucide-react';

interface StatItemProps {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix: string;
  label: string;
  sublabel: string;
  startWhen: boolean;
  icon: React.ElementType;
}

const StatItem: React.FC<StatItemProps> = ({
  end,
  decimals = 0,
  prefix = '',
  suffix,
  label,
  sublabel,
  startWhen,
  icon: Icon,
}) => {
  const animatedValue = useCountUp({
    end,
    decimals,
    startWhen,
    duration: 2000,
  });

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] hover:border-emerald-500/30 shadow-xl transition-all duration-300 text-center flex flex-col items-center group">
      <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
        <Icon className="w-6 h-6" />
      </div>

      <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight mb-2">
        {prefix}
        {animatedValue}
        {suffix}
      </div>

      <div className="text-base font-bold text-[var(--text-primary)] mb-1">
        {label}
      </div>

      <div className="text-xs text-[var(--text-muted)]">
        {sublabel}
      </div>
    </div>
  );
};

export const Stats: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            A focused product, not a platform.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)]">
            The core building blocks of NOVA, built from the ground up.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatItem
            end={4}
            suffix=" states"
            label="Task statuses"
            sublabel="To do, in progress, in review, done"
            startWhen={isInView}
            icon={CheckSquare2}
          />
          <StatItem
            end={3}
            suffix=" roles"
            label="Workspace roles"
            sublabel="Owner, admin, member"
            startWhen={isInView}
            icon={ShieldCheck}
          />
          <StatItem
            end={3}
            suffix=" modes"
            label="Theme modes"
            sublabel="Dark, light, and system"
            startWhen={isInView}
            icon={Palette}
          />
          <StatItem
            end={10}
            suffix="+"
            label="Core data models"
            sublabel="Workspaces, projects, tasks, comments, and more"
            startWhen={isInView}
            icon={Layers}
          />
        </div>
      </div>
    </section>
  );
};