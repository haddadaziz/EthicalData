"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CometCardProps {
  children: React.ReactNode;
  className?: string;
  rotateDepth?: number;
}

export const CometCard = ({
  children,
  className,
  rotateDepth = 10,
}: CometCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [transformStyle, setTransformStyle] = useState("");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      const clientX = e.clientX;
      const clientY = e.clientY;

      rafRef.current = requestAnimationFrame(() => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const xPct = mouseX / width;
        const yPct = mouseY / height;

        // Calculate 3D tilt angles
        const rotateX = (0.5 - yPct) * rotateDepth;
        const rotateY = (xPct - 0.5) * rotateDepth;

        setTransformStyle(
          `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
        );
      });
    },
    [rotateDepth]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setIsHovered(false);
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative group/comet cursor-pointer select-none", className)}
      style={{
        transform: transformStyle,
        transition: isHovered
          ? "transform 0.08s ease-out"
          : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Card Content */}
      <div className="relative z-0 h-full w-full rounded-[inherit] overflow-hidden">
        {children}
      </div>
    </div>
  );
};
