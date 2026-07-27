"use client";

import { cn } from "@/lib/utils";
import { motion, MotionValue } from "framer-motion";
import React from "react";

export const GoogleGeminiEffect = ({
  pathLengths,
  title = "Derniers Articles & Astuces de Révision",
  description = "Retrouvez nos conseils d'experts pour préparer vos examens officiels et propulser votre carrière IT.",
  className,
}: {
  pathLengths: MotionValue<number>[];
  title?: string;
  description?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative py-10 md:py-16 w-full flex flex-col items-center justify-center overflow-hidden bg-transparent pointer-events-none",
        className
      )}
    >
      {/* Exact Aceternity UI Google Gemini SVG Paths */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-85 pointer-events-none transform-gpu">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full max-w-6xl"
        >
          <motion.path
            d="M 100 200 Q 400 50 720 450 T 1340 700"
            stroke="#06b6d4"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              pathLength: pathLengths[0],
            }}
          />
          <motion.path
            d="M 100 300 Q 500 100 720 450 T 1340 600"
            stroke="#2563eb"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              pathLength: pathLengths[1],
            }}
          />
          <motion.path
            d="M 100 400 Q 600 200 720 450 T 1340 500"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              pathLength: pathLengths[2],
            }}
          />
          <motion.path
            d="M 100 500 Q 700 300 720 450 T 1340 400"
            stroke="#1d4ed8"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              pathLength: pathLengths[3],
            }}
          />
          <motion.path
            d="M 100 600 Q 800 400 720 450 T 1340 300"
            stroke="#60a5fa"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              pathLength: pathLengths[4],
            }}
          />
        </svg>
      </div>

      {/* Title & Description floating directly on top of the Gemini paths */}
      <div className="relative z-10 text-center space-y-3 px-4 max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
            {title}
          </span>
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
