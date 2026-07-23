import React, { useEffect, useRef } from 'react';

export function AnimatedNumber({ end, suffix = "+" }: { end: number, suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || animated.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animated.current = true;
          observer.unobserve(el);
          let start: number | null = null;
          const duration = 2000;
          const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            el!.textContent = `${Math.floor(ease * end)}${suffix}`;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}
