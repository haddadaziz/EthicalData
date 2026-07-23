"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";

export const GlareCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const refElement = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const [styleState, setStyleState] = useState<{
    rotateX: number;
    rotateY: number;
    glareX: number;
    glareY: number;
    opacity: number;
  }>({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    opacity: 0,
  });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rotateFactor = 0.35;
    const rect = refElement.current?.getBoundingClientRect();
    if (!rect) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const clientX = event.clientX;
    const clientY = event.clientY;

    rafRef.current = requestAnimationFrame(() => {
      const position = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
      const percentage = {
        x: (100 / rect.width) * position.x,
        y: (100 / rect.height) * position.y,
      };
      const delta = {
        x: percentage.x - 50,
        y: percentage.y - 50,
      };

      const rotate = {
        x: -(delta.x / 3.5) * rotateFactor,
        y: (delta.y / 2) * rotateFactor,
      };

      setStyleState({
        rotateX: rotate.y,
        rotateY: rotate.x,
        glareX: percentage.x,
        glareY: percentage.y,
        opacity: 1,
      });
    });
  };

  const handlePointerLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setStyleState({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      opacity: 0,
    });
  };

  return (
    <div
      ref={refElement}
      className={cn(
        "relative isolate [perspective:600px] cursor-pointer select-none w-full",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div
        className="w-full h-full relative rounded-2xl overflow-hidden transition-transform duration-100 ease-out will-change-transform"
        style={{
          transform: `rotateX(${styleState.rotateX}deg) rotateY(${styleState.rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Card Content */}
        <div className="w-full h-full relative z-10">{children}</div>

        {/* Glare Radial Reflex */}
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-[inherit]"
          style={{
            opacity: styleState.opacity,
            background: `radial-gradient(circle at ${styleState.glareX}% ${styleState.glareY}%, rgba(255, 255, 255, 0.25) 0%, rgba(6, 182, 212, 0.12) 40%, transparent 70%)`,
          }}
        />

        {/* Holographic Glossy Linear Diagonal Shine */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-[inherit]"
          style={{
            opacity: styleState.opacity * 0.7,
            background: `linear-gradient(${135 + styleState.rotateX * 2}deg, rgba(255, 255, 255, 0.22) 0%, transparent 45%, rgba(37, 99, 235, 0.15) 100%)`,
          }}
        />
      </div>
    </div>
  );
};
