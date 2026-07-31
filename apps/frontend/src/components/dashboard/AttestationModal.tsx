"use client";

import React, { useRef } from 'react';
import { X, DownloadCloud, ShieldCheck, Award, CheckCircle } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface AttestationData {
  studentName: string;
  courseTitle: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  trainerName: string;
  deliveryType: 'E-learning 100%' | 'Visioconférence Live';
  verificationCode: string;
}

interface AttestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AttestationData | null;
}

export default function AttestationModal({ isOpen, onClose, data }: AttestationModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-[#080d1a] border border-slate-800 rounded-3xl max-w-3xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative my-auto max-h-[94vh] flex flex-col justify-between"
        >
          {/* Header Controls (Fixed at top) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-black text-white leading-snug">Attestation Officielle de Formation</h3>
                <p className="text-[10px] text-slate-400">Document certifiant la participation et la complétion (Valide la présence)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Imprimer / PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PRINTABLE ATTESTATION DIPLOMA CARD (Optimized Compact Scale) */}
          <div
            ref={printRef}
            className="bg-[#020617] border border-cyan-500/40 rounded-2xl p-5 sm:p-6 space-y-4 relative overflow-hidden text-center shadow-inner overflow-y-auto max-h-[72vh]"
          >
            {/* Corner Decorative Borders */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-cyan-400/60 pointer-events-none" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-cyan-400/60 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-cyan-400/60 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-cyan-400/60 pointer-events-none" />

            {/* Logo & Header */}
            <div className="space-y-1.5">
              <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-8 mx-auto object-contain" />
              <div className="inline-block px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-[9px] font-black uppercase tracking-widest">
                RÉPUBLIQUE DU MAROC — ETHICAL DATA SECURITY (EDS)
              </div>
              <h1 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white">
                ATTESTATION DE FORMATION
              </h1>
              <p className="text-[10px] text-slate-400 italic">
                Document Officiel de Validation des Acquis et de Présence (Non-Examen)
              </p>
            </div>

            {/* Main Attestation Statement */}
            <div className="space-y-2 max-w-xl mx-auto py-2.5 border-y border-slate-800/80">
              <p className="text-[11px] text-slate-300">
                Le Centre d&apos;Expertise et de Formation <strong className="text-white">Ethical Data Security</strong> atteste par la présente que :
              </p>
              
              <h2 className="text-lg sm:text-xl font-black text-cyan-400 uppercase tracking-tight py-1 border-b border-cyan-500/30 inline-block px-4">
                {data.studentName}
              </h2>

              <p className="text-[11px] text-slate-300 pt-1">
                a suivi et complété avec succès l&apos;intégralité du programme de formation certifiant :
              </p>

              <h3 className="text-sm sm:text-base font-black text-white">
                &laquo; {data.courseTitle} &raquo;
              </h3>
            </div>

            {/* Technical Metadata Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left max-w-2xl mx-auto bg-[#080d1a] border border-slate-800 rounded-xl p-3 text-[11px]">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Modalité</span>
                <span className="font-bold text-cyan-400">{data.deliveryType}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Période</span>
                <span className="font-bold text-slate-200">{data.startDate} — {data.endDate}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Volume Horaire</span>
                <span className="font-bold text-slate-200">{data.durationHours} Heures</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Formateur</span>
                <span className="font-bold text-slate-200">{data.trainerName}</span>
              </div>
            </div>

            {/* Signatures & Verification */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80 text-left max-w-2xl mx-auto">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Code de Vérification Unique</span>
                <span className="font-mono text-[10px] font-black text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded inline-block">
                  {data.verificationCode}
                </span>
              </div>

              <div className="text-center sm:text-right space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Pour la Direction Pédagogique</span>
                <div className="h-6 flex items-center justify-center sm:justify-end">
                  <span className="font-serif italic font-black text-slate-300 text-xs">Ethical Data Security — Direction</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 flex items-center justify-center sm:justify-end gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Signature Numérique Validée</span>
                </span>
              </div>
            </div>

          </div>

          {/* Footer bar */}
          <div className="p-2.5 bg-[#030712] border border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Complétion à 100% vérifiée automatiquement par la plateforme.</span>
            </span>
            <span className="font-bold text-slate-300">EDS Certificats v2.4</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
