import { RefreshCw, BookmarkCheck } from '@/components/icons';
import React from 'react';
import { motion } from 'framer-motion';

interface ResultsPanelProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  certName: string;
  onRetry: () => void;
  onExit: () => void;
}

export default function ResultsPanel({
  score,
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  certName,
  onRetry,
  onExit,
}: ResultsPanelProps) {
  const success = score >= 80;

  return (
    <div className="bg-[#080d1a] border border-slate-800 rounded-[32px] p-8 sm:p-10 text-center space-y-6 relative overflow-hidden shadow-sm">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/[0.02] blur-3xl pointer-events-none" />

      <div className="space-y-2 relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Résultats de la simulation</p>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {success ? 'Félicitations, examen réussi ! 🎉' : 'Score insuffisant pour l\'instant ❌'}
        </h2>
        <p className="text-xs text-slate-400 font-bold max-w-md mx-auto leading-relaxed mt-2">
          {success
            ? 'Excellent travail ! Vous avez dépassé le seuil requis de 80%. Vous êtes prêt pour l\'examen officiel.'
            : 'Ne vous découragez pas. Le seuil de réussite est fixé à 80%. Révisez vos points faibles et réessayez !'}
        </p>
      </div>

      <div className="flex justify-center py-4 relative z-10">
        <div className="relative w-44 h-44 flex items-center justify-center transition-transform duration-300 hover:scale-105">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="70"
              className="stroke-slate-800 fill-none"
              strokeWidth="12"
            />
            <motion.circle
              cx="88"
              cy="88"
              r="70"
              className={`fill-none ${success ? 'stroke-emerald-500' : 'stroke-rose-500'}`}
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 70}
              initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - score / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-4xl font-black tracking-tight ${success ? 'text-emerald-500' : 'text-rose-500'}`}>{score}%</span>
            <span className="text-[10px] font-black uppercase tracking-wider mt-1.5 text-slate-400">Score obtenu</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 relative z-10">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
        >
          <RefreshCw className="w-4 h-4 animate-spin-hover" />
          <span>Recommencer le test</span>
        </button>

        <button
          onClick={onExit}
          className="flex items-center gap-2 px-5 py-3.5 border border-slate-700 hover:border-slate-600 bg-[#020617] text-slate-400 hover:text-white font-bold rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider shadow-sm"
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Tableau de bord</span>
        </button>
      </div>
    </div>
  );
}
