"use client";

import React, { useState } from 'react';
import { Target, Award, CheckCircle, Clock, ChevronRight, AlertTriangle, FileText } from '@/components/icons';

interface ExamAttempt {
  id: string;
  certificationName: string;
  code: string;
  date: string;
  scorePercent: number;
  passingScorePercent: number;
  timeSpent: string;
  readinessLabel: 'PRET' | 'PRESQUE_PRET' | 'NON_PRET';
  status: 'ADMIS' | 'AJOURNÉ';
}

const MOCK_EXAM_ATTEMPTS: ExamAttempt[] = [
  {
    id: "att-1",
    certificationName: "Palo Alto Networks PCNSA",
    code: "PCNSA-2026-088",
    date: "25 Juillet 2026",
    scorePercent: 88,
    passingScorePercent: 70,
    timeSpent: "42 min",
    readinessLabel: "PRET",
    status: "ADMIS"
  },
  {
    id: "att-2",
    certificationName: "AWS Certified Security - Specialty",
    code: "SCS-C02-2026",
    date: "18 Juillet 2026",
    scorePercent: 64,
    passingScorePercent: 75,
    timeSpent: "55 min",
    readinessLabel: "PRESQUE_PRET",
    status: "AJOURNÉ"
  },
  {
    id: "att-3",
    certificationName: "PECB ISO 27001 Lead Implementer",
    code: "ISO-27001-LI",
    date: "10 Juillet 2026",
    scorePercent: 92,
    passingScorePercent: 70,
    timeSpent: "38 min",
    readinessLabel: "PRET",
    status: "ADMIS"
  }
];

export default function ExamHistorySection() {
  const [attempts] = useState<ExamAttempt[]>(MOCK_EXAM_ATTEMPTS);
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <span>Historique des Examens Blancs & Readiness Scores</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Relevé complet de vos tentatives de simulations avec correction détaillée et analyse IA.
          </p>
        </div>

        <div className="px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full text-cyan-400 text-xs font-bold w-max">
          {attempts.length} Tentatives Effectuées
        </div>
      </div>

      {/* Attempts Table / List */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#030712] border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Examen Blanc</th>
                <th className="p-4">Date & Durée</th>
                <th className="p-4 text-center">Score Obtenu</th>
                <th className="p-4 text-center">Readiness Score</th>
                <th className="p-4 text-center">Résultat</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
              {attempts.map((att) => {
                const isPassed = att.status === 'ADMIS';
                return (
                  <tr key={att.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-white text-sm">{att.certificationName}</div>
                      <div className="text-[10px] font-mono text-cyan-400">{att.code}</div>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-slate-200">{att.date}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{att.timeSpent}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`text-base font-black ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {att.scorePercent}%
                      </div>
                      <div className="text-[9px] text-slate-500">Seuil: {att.passingScorePercent}%</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        att.readinessLabel === 'PRET'
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                          : 'bg-amber-950 border border-amber-800 text-amber-400'
                      }`}>
                        {att.readinessLabel === 'PRET' ? 'PRÊT (95%)' : 'À renforcer'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPassed ? 'bg-emerald-500 text-black' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedAttempt(att)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Corrigé IA</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Correction Detail Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-black text-white">Analyse & Corrigé IA — {selectedAttempt.certificationName}</h4>
                <p className="text-xs text-cyan-400">Score: {selectedAttempt.scorePercent}% | {selectedAttempt.date}</p>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-[#030712] border border-slate-800 rounded-2xl space-y-2">
                <h5 className="font-black text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Points Forts Validés</span>
                </h5>
                <p className="text-slate-400 leading-relaxed">
                  Excellente maîtrise du routage virtuel, de la gestion des Security Zones et du filtrage SSL/TLS.
                </p>
              </div>

              <div className="p-4 bg-[#030712] border border-slate-800 rounded-2xl space-y-2">
                <h5 className="font-black text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Axe de Révision Conseillé</span>
                </h5>
                <p className="text-slate-400 leading-relaxed">
                  Revoir le chapitre 5 : Configuration des politiques de sécurité WildFire et profils de prévention des menaces.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
