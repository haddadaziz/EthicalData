"use client";

import React, { useRef, useState, useEffect } from 'react';

type AnimVariant = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: AnimVariant;
  duration?: number;
  threshold?: number;
}

const getInitialTransform = (variant: AnimVariant) => {
  switch (variant) {
    case 'up':    return 'translate3d(0, 32px, 0)';
    case 'down':  return 'translate3d(0, -32px, 0)';
    case 'left':  return 'translate3d(32px, 0, 0)';
    case 'right': return 'translate3d(-32px, 0, 0)';
    case 'scale': return 'scale(0.94)';
    case 'fade':
    default:      return 'translate3d(0, 0, 0)';
  }
};

export const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
  variant = 'up',
  duration = 0.65,
  threshold = 0.07,
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '40px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${className} transform-gpu`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? (variant === 'scale' ? 'scale(1)' : 'translate3d(0,0,0)') : getInitialTransform(variant),
        transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};
