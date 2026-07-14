import { RefreshCw, BookmarkCheck } from '@/components/icons';
import React from 'react';

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
    <div className="bg-white border border-slate-200/80 rounded-[32px] p-8 sm:p-10 text-center space-y-6 relative overflow-hidden shadow-sm">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-red-600/[0.02] blur-3xl pointer-events-none" />

      <div className="space-y-2 relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Résultats de la simulation</p>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          {success ? 'Félicitations, examen réussi ! 🎉' : 'Score insuffisant pour l\'instant ❌'}
        </h2>
        <p className="text-xs text-slate-500 font-bold max-w-md mx-auto leading-relaxed mt-2">
          {success
            ? 'Excellent travail ! Vous avez dépassé le seuil requis de 80%. Vous êtes prêt pour l\'examen officiel.'
            : 'Ne vous découragez pas. Le seuil de réussite est fixé à 80%. Révisez vos points faibles et réessayez !'}
        </p>
      </div>

      <div className="flex justify-center py-2 relative z-10">
        <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 ${success
          ? 'border-emerald-500/20 bg-emerald-50/30 text-emerald-600'
          : 'border-rose-500/20 bg-rose-50/30 text-rose-600'
          }`}>
          <span className="text-4xl font-black tracking-tight">{score}%</span>
          <span className="text-[9px] font-black uppercase tracking-wider mt-1.5">Score obtenu</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 relative z-10">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest shadow-md hover:shadow-lg"
        >
          <RefreshCw className="w-4 h-4 animate-spin-hover" />
          <span>Recommencer le test</span>
        </button>

        <button
          onClick={onExit}
          className="flex items-center gap-2 px-5 py-3.5 border border-slate-200/85 hover:border-slate-350 bg-white text-slate-650 hover:text-slate-950 font-bold rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider shadow-sm"
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Tableau de bord</span>
        </button>
      </div>
    </div>
  );
}
