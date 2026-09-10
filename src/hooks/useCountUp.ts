import { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  decimals?: number;
  startWhen?: boolean;
}

export function useCountUp({
  end,
  duration = 1800,
  decimals = 0,
  startWhen = false,
}: UseCountUpOptions) {
  const prefersReducedMotion = useReducedMotion();
  const [count, setCount] = useState<number>(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startWhen || hasAnimated.current) return;
    hasAnimated.current = true;

    if (prefersReducedMotion) {
      // In reduced motion mode, directly assign the end value asynchronously
      const id = requestAnimationFrame(() => setCount(end));
      return () => cancelAnimationFrame(id);
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeProgress * end;

      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration, startWhen, prefersReducedMotion]);

  return count.toFixed(decimals);
}
