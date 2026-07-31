"use client";

import React, { useState } from 'react';
import { X, Star, CheckCircle, Send, User } from '@/components/icons';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

interface EvaluateTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: string;
    title: string;
    trainerName: string;
    courseName: string;
  };
  onSubmitted: (rating: number) => void;
}

export default function EvaluateTrainerModal({ isOpen, onClose, session, onSubmitted }: EvaluateTrainerModalProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [clarityRating, setClarityRating] = useState<number>(5);
  const [pedagogyRating, setPedagogyRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showToast(`Merci ! Votre évaluation de ${session.trainerName} a bien été enregistrée.`, "success");
      onSubmitted(rating);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#080d1a] border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 px-2.5 py-0.5 bg-cyan-950 border border-cyan-800/60 rounded-full">
                Évaluation Post-Session
              </span>
              <h3 className="text-xl font-black text-white pt-2">Évaluer le Formateur</h3>
              <p className="text-xs text-slate-400">{session.trainerName} — {session.courseName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Rating Stars */}
            <div className="text-center space-y-2 bg-[#030712] border border-slate-800 p-5 rounded-2xl">
              <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                Note Globale de la Session
              </label>

              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          active ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-cyan-400 block pt-1">
                {rating === 5 ? 'Excellent !' : rating === 4 ? 'Très Bien' : rating === 3 ? 'Moyen' : 'Insatisfaisant'}
              </span>
            </div>

            {/* Sub Criteria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 bg-[#030712] p-3.5 rounded-xl border border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 block">Pédagogie & Écoute</label>
                <select
                  value={pedagogyRating}
                  onChange={(e) => setPedagogyRating(Number(e.target.value))}
                  className="w-full bg-[#080d1a] border border-slate-800 text-white text-xs font-bold p-2 rounded-lg outline-none"
                >
                  <option value={5}>5 / 5 — Parfait</option>
                  <option value={4}>4 / 5 — Bon</option>
                  <option value={3}>3 / 5 — Correct</option>
                  <option value={2}>2 / 5 — À améliorer</option>
                </select>
              </div>

              <div className="space-y-1.5 bg-[#030712] p-3.5 rounded-xl border border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 block">Clarté des explications</label>
                <select
                  value={clarityRating}
                  onChange={(e) => setClarityRating(Number(e.target.value))}
                  className="w-full bg-[#080d1a] border border-slate-800 text-white text-xs font-bold p-2 rounded-lg outline-none"
                >
                  <option value={5}>5 / 5 — Très clair</option>
                  <option value={4}>4 / 5 — Clair</option>
                  <option value={3}>3 / 5 — Moyen</option>
                  <option value={2}>2 / 5 — Confus</option>
                </select>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Commentaire / Remarques (Optionnel)</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre avis sur la qualité d'enseignement..."
                className="w-full p-3 bg-[#030712] border border-slate-800 rounded-xl text-white text-xs font-semibold outline-none focus:border-cyan-500 transition-colors resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-cyan-600/20 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Soumettre l&apos;évaluation</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
