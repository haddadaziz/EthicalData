'use client';

import React, { useEffect, useState, useRef } from 'react';

interface CounterNumberProps {
  value: number;
  duration?: number;
}

export function CounterNumber({ value, duration = 2000 }: CounterNumberProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = value;
          const totalFrames = 60;
          const frameDuration = duration / totalFrames;
          let frame = 0;

          const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentCount = Math.round(end * progress);
            setCount(currentCount);

            if (frame >= totalFrames) {
              setCount(end);
              clearInterval(timer);
            }
          }, frameDuration);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{count}</span>;
}
