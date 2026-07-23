"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface Beam {
  left: string;
  duration: number; // in seconds
  delay: number; // in seconds
  height: string;
}

const BEAMS: Beam[] = [
  { left: "10%", duration: 6, delay: 0, height: "h-24" },
  { left: "30%", duration: 8, delay: 2, height: "h-32" },
  { left: "55%", duration: 5, delay: 1, height: "h-20" },
  { left: "75%", duration: 7, delay: 3, height: "h-28" },
  { left: "90%", duration: 9, delay: 1.5, height: "h-24" },
];

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden bg-[#020617] w-full",
        className
      )}
    >
      {/* GPU Accelerated Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {BEAMS.map((beam, index) => (
          <GPUBeam key={index} beam={beam} />
        ))}
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

const GPUBeam = ({ beam }: { beam: Beam }) => {
  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{ left: beam.left }}
    >
      {/* Laser beam sliding down via pure CSS GPU animation */}
      <div
        className={cn(
          "w-[2px] rounded-full bg-gradient-to-b from-transparent via-cyan-400 to-blue-600 shadow-[0_0_12px_#06b6d4]",
          beam.height
        )}
        style={{
          animation: `beamDrop ${beam.duration}s linear infinite`,
          animationDelay: `${beam.delay}s`,
          willChange: "transform",
        }}
      />

      {/* Impact explosion at bottom synchronized with beam drop */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 pointer-events-none"
        style={{
          animation: `impactBurst ${beam.duration}s ease-out infinite`,
          animationDelay: `${beam.delay}s`,
          willChange: "transform, opacity",
        }}
      >
        <div className="w-8 h-8 -left-2 -top-2 absolute rounded-full bg-cyan-400/40 blur-sm" />
        <div className="w-2 h-2 left-1 top-1 absolute rounded-full bg-cyan-300 shadow-[0_0_10px_#06b6d4]" />
      </div>

      <style jsx>{`
        @keyframes beamDrop {
          0% {
            transform: translate3d(0, -150px, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, calc(100vh + 150px), 0);
            opacity: 0;
          }
        }

        @keyframes impactBurst {
          0%, 85% {
            transform: scale(0);
            opacity: 0;
          }
          90% {
            transform: scale(1.4);
            opacity: 1;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
