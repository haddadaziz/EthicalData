import { Flag } from '@/components/icons';
import React from 'react';

interface QuestionCardProps {
  question: any;
  selectedAnswer: string | null;
  onAnswerSelect: (lettre: string) => void;
  showExplanation: boolean;
  questionNumber: number;
  totalQuestions: number;
  isFlagged?: boolean;
  onToggleFlag?: () => void;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  showExplanation,
  questionNumber,
  totalQuestions,
  isFlagged,
  onToggleFlag,
}: QuestionCardProps) {
  if (!question) return null;

  return (
    <div className="bg-white shadow-sm border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{question.categorie || "Général"}</span>
          <h2 className="text-sm font-bold text-slate-500 mt-1">Question {questionNumber} sur {totalQuestions}</h2>
        </div>
        <div className="flex items-center gap-4">
          {onToggleFlag && (
            <button
              onClick={onToggleFlag}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${isFlagged
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                : 'border-slate-200 text-slate-400 hover:text-slate-950 hover:bg-slate-50'
                }`}
              title="Marquer pour révision"
            >
              <Flag className={`w-4 h-4 ${isFlagged ? 'fill-amber-500' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="py-2">
        <p className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed">{question.enonce}</p>
      </div>

      <div className="space-y-3">
        {question.type === 'OUVERTE' || question.type === 'CAS_PRATIQUE' ? (
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Saisissez votre réponse rédigée :</label>
            <textarea
              value={selectedAnswer || ''}
              onChange={(e) => onAnswerSelect(e.target.value)}
              placeholder="Tapez votre réponse détaillée ici. L'évaluation prendra en compte votre rigueur, vos arguments et le vocabulaire technique..."
              className="w-full h-44 p-4 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl text-slate-800 transition-all text-sm outline-none font-semibold resize-none shadow-sm"
            />
          </div>
        ) : (
          (question.options || []).map((opt: any) => {
            const isSelected = selectedAnswer === opt.lettre;
            return (
              <button
                key={opt.id}
                onClick={() => onAnswerSelect(opt.lettre)}
                className={`w-full p-4 border text-left rounded-2xl transition-all cursor-pointer flex items-center gap-4 group ${isSelected
                  ? 'border-blue-600 bg-blue-50/50 text-slate-950 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/10 text-slate-500 hover:text-slate-950'
                  }`}
              >
                <span className={`w-8 h-8 rounded-lg border font-bold text-xs uppercase flex items-center justify-center shrink-0 transition-colors ${isSelected
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:border-slate-400 group-hover:bg-slate-100'
                  }`}>
                  {opt.lettre}
                </span>
                <span className="text-sm font-semibold">{opt.texte}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
