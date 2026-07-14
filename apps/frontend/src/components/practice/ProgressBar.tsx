import { motion } from 'framer-motion';
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  answers: Record<string, string>;
}

export default function ProgressBar({ current, total, answers }: ProgressBarProps) {
  const answeredCount = Object.keys(answers).length;
  const progressPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
      <div className="flex-1">
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5 pl-0.5">
          <span>Progression de l'examen</span>
          <span>{progressPercent}% ({answeredCount}/{total} répondues)</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
