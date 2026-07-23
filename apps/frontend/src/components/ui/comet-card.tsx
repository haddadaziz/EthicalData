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
  const [cometStyle, setCometStyle] = useState({ opacity: 0, angle: 0, x: 50, y: 50 });

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

        // Calculate comet glow angle around center
        const dx = mouseX - width / 2;
        const dy = mouseY - height / 2;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        setTransformStyle(
          `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
        );

        setCometStyle({
          opacity: 1,
          angle,
          x: Math.round(xPct * 100),
          y: Math.round(yPct * 100),
        });
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
    setCometStyle((prev) => ({ ...prev, opacity: 0 }));
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
      {/* Comet Border Light Sweep */}
      <div
        className="pointer-events-none absolute -inset-[1px] rounded-[inherit] transition-opacity duration-300 z-10"
        style={{
          opacity: cometStyle.opacity,
          background: `conic-gradient(from ${cometStyle.angle}deg at ${cometStyle.x}% ${cometStyle.y}%, #06b6d4 0deg, #2563eb 40deg, transparent 120deg, transparent 360deg)`,
          borderRadius: "inherit",
          maskImage: "linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
        }}
      />

      {/* Radial Spotlight Overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-20"
        style={{
          opacity: isHovered ? 0.25 : 0,
          background: `radial-gradient(400px circle at ${cometStyle.x}% ${cometStyle.y}%, rgba(6, 182, 212, 0.4), transparent 80%)`,
          borderRadius: "inherit",
        }}
      />

      {/* Card Content */}
      <div className="relative z-0 h-full w-full rounded-[inherit] overflow-hidden">
        {children}
      </div>
    </div>
  );
};
