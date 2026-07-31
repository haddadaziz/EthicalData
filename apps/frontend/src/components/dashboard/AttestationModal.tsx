"use client";

import React, { useRef } from 'react';
import { X, DownloadCloud, CheckCircle, ShieldCheck, Award, Calendar, Clock, User, Building } from '@/components/icons';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#080d1a] border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Attestation Officielle de Formation</h3>
                <p className="text-xs text-slate-400">Document certifiant la participation et la complétion (Valide la présence)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Imprimer / Télécharger (PDF)</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PRINTABLE ATTESTATION DIPLOMA CARD */}
          <div
            ref={printRef}
            className="bg-[#020617] border-2 border-cyan-500/40 rounded-2xl p-8 sm:p-12 space-y-8 relative overflow-hidden text-center shadow-inner"
          >
            {/* Corner Decorative Borders */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

            {/* Logo & Header */}
            <div className="space-y-3">
              <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-10 mx-auto object-contain" />
              <div className="inline-block px-4 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                RÉPUBLIQUE DU MAROC — ETHICAL DATA SECURITY (EDS)
              </div>
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wider text-white">
                ATTESTATION DE FORMATION
              </h1>
              <p className="text-xs text-slate-400 italic">
                Document Officiel de Validation des Acquis et de Présence (Non-Examen)
              </p>
            </div>

            {/* Main Attestation Statement */}
            <div className="space-y-4 max-w-2xl mx-auto py-4 border-y border-slate-800/80">
              <p className="text-xs sm:text-sm text-slate-300">
                Le Centre d&apos;Expertise et de Formation <strong className="text-white">Ethical Data Security</strong> atteste par la présente que :
              </p>
              
              <h2 className="text-2xl sm:text-3xl font-black text-cyan-400 uppercase tracking-tight py-2 border-b border-cyan-500/30 inline-block px-6">
                {data.studentName}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300">
                a suivi et complété avec succès l&apos;intégralité du programme de formation certifiant :
              </p>

              <h3 className="text-xl sm:text-2xl font-black text-white py-1">
                &laquo; {data.courseTitle} &raquo;
              </h3>
            </div>

            {/* Technical Metadata Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-3xl mx-auto bg-[#080d1a] border border-slate-800 rounded-2xl p-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Modalité</span>
                <span className="font-bold text-cyan-400">{data.deliveryType}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Période</span>
                <span className="font-bold text-slate-200">{data.startDate} — {data.endDate}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Volume Horaire</span>
                <span className="font-bold text-slate-200">{data.durationHours} Heures</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Formateur Référent</span>
                <span className="font-bold text-slate-200">{data.trainerName}</span>
              </div>
            </div>

            {/* Signatures & Verification */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-800/80 text-left max-w-3xl mx-auto">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Code de Vérification Unique</span>
                <span className="font-mono text-xs font-black text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-lg inline-block">
                  {data.verificationCode}
                </span>
                <p className="text-[9px] text-slate-500">Vérifiable en ligne sur www.ethicaldatasecurity.ma/verify</p>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pour la Direction Pédagogique</span>
                <div className="h-10 flex items-center justify-center sm:justify-end">
                  <span className="font-serif italic font-black text-slate-300 text-sm">Ethical Data Security — Direction</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center justify-center sm:justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Signature Numérique Validée</span>
                </span>
              </div>
            </div>

          </div>

          <div className="p-4 bg-[#030712] border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Complétion à 100% de la formation vérifiée automatiquement par la plateforme.</span>
            </span>
            <span className="font-bold text-slate-300">EDS Certificats v2.4</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
