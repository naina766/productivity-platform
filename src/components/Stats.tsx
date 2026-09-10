import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '../hooks/useCountUp';
import { Users, FolderCheck, Zap, Smile } from 'lucide-react';

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
    <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] dark:bg-[#111111] light:bg-white border border-white/8 dark:border-white/8 light:border-neutral-200 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 light:hover:border-emerald-500/30 shadow-xl transition-all duration-300 text-center flex flex-col items-center group">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 light:bg-emerald-50 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
        <Icon className="w-6 h-6" />
      </div>

      <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white dark:text-white light:text-neutral-950 font-mono tracking-tight mb-2">
        {prefix}
        {animatedValue}
        {suffix}
      </div>

      <div className="text-base font-bold text-neutral-200 dark:text-neutral-200 light:text-neutral-800 mb-1">
        {label}
      </div>

      <div className="text-xs text-neutral-500 dark:text-neutral-500 light:text-neutral-500">
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
    <section ref={ref} className="py-20 bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-neutral-50/70 border-y border-white/6 dark:border-white/6 light:border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-neutral-900 tracking-tight">
            Proven velocity at enterprise scale.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
            Real metrics from teams shipping every day with NOVA.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatItem
            end={10}
            suffix="K+"
            label="Teams"
            sublabel="Worldwide on NOVA"
            startWhen={isInView}
            icon={Users}
          />
          <StatItem
            end={250}
            suffix="K+"
            label="Projects completed"
            sublabel="Delivered on schedule"
            startWhen={isInView}
            icon={FolderCheck}
          />
          <StatItem
            end={1.2}
            decimals={1}
            suffix="M+"
            label="Tasks automated"
            sublabel="Without manual intervention"
            startWhen={isInView}
            icon={Zap}
          />
          <StatItem
            end={98}
            suffix="%"
            label="Customer satisfaction"
            sublabel="CSAT across 24 countries"
            startWhen={isInView}
            icon={Smile}
          />
        </div>
      </div>
    </section>
  );
};
