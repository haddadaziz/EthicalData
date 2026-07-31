"use client";

import React, { useRef, useState } from 'react';
import { X, DownloadCloud, Award } from '@/components/icons';
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
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setDownloading(true);

    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = printRef.current;
      const filename = `Attestation_EDS_${data.studentName.replace(/\s+/g, '_')}.pdf`;

      const options = {
        margin: 5,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#020617',
          onclone: (clonedDoc: Document) => {
            const el = clonedDoc.getElementById('printable-attestation');
            if (el) {
              el.style.backgroundColor = '#020617';
              el.style.color = '#ffffff';
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
      };

      await html2pdf().set(options).from(element).save();
    } catch (err) {
      console.error("Erreur génération PDF:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
        {/* PRINT MEDIA STYLES - A4 LANDSCAPE EXACT & PRESERVE COLOR BACKGROUND */}
        <style jsx global>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              background: #020617 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body * {
              visibility: hidden;
            }
            #printable-attestation, #printable-attestation * {
              visibility: visible;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #printable-attestation {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 297mm !important;
              height: 210mm !important;
              margin: 0 !important;
              padding: 20mm !important;
              background-color: #020617 !important;
              border: 2px solid #06b6d4 !important;
              box-sizing: border-box !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              z-index: 99999 !important;
            }
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-[#080d1a] border border-slate-800 rounded-3xl max-w-3xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative my-auto max-h-[94vh] flex flex-col justify-between"
        >
          {/* Header Controls (Fixed at top) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#082f49] border border-[#075985] flex items-center justify-center text-[#22d3ee]">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-black text-white leading-snug">Attestation Officielle de Formation</h3>
                <p className="text-[10px] text-slate-400">Document certifiant la participation et la complétion (Valide la présence)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] text-[#e2e8f0] rounded-xl text-[11px] font-bold transition-all cursor-pointer"
              >
                🖨️ Imprimer
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="px-3.5 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>{downloading ? 'Génération...' : 'Télécharger PDF'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-[#0f172a] border border-[#1e293b] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PRINTABLE ATTESTATION DIPLOMA CARD WITH HEX COLOR FALLBACKS */}
          <div
            id="printable-attestation"
            ref={printRef}
            style={{ backgroundColor: '#020617', color: '#ffffff' }}
            className="bg-[#020617] border border-[#0891b2] rounded-2xl p-6 sm:p-8 space-y-5 relative overflow-hidden text-center shadow-inner overflow-y-auto max-h-[76vh]"
          >
            {/* Corner Decorative Borders */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-[#22d3ee] pointer-events-none" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-[#22d3ee] pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-[#22d3ee] pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-[#22d3ee] pointer-events-none" />

            {/* Logo & Title Header */}
            <div className="space-y-2">
              <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-9 mx-auto object-contain" />
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white" style={{ color: '#ffffff' }}>
                ATTESTATION DE FORMATION
              </h1>
              <p className="text-[10px] text-[#94a3b8] italic" style={{ color: '#94a3b8' }}>
                Document Officiel de Validation des Acquis et de Présence (Non-Examen)
              </p>
            </div>

            {/* Main Attestation Statement */}
            <div className="space-y-2 max-w-xl mx-auto py-3 border-y border-[#1e293b]">
              <p className="text-[11px] text-[#cbd5e1]" style={{ color: '#cbd5e1' }}>
                Le Centre d&apos;Expertise et de Formation <strong className="text-white" style={{ color: '#ffffff' }}>Ethical Data Security</strong> atteste par la présente que :
              </p>
              
              <h2 className="text-lg sm:text-xl font-black text-[#22d3ee] uppercase tracking-tight py-1 border-b border-[#0891b2] inline-block px-4" style={{ color: '#22d3ee' }}>
                {data.studentName}
              </h2>

              <p className="text-[11px] text-[#cbd5e1] pt-1" style={{ color: '#cbd5e1' }}>
                a suivi et complété avec succès l&apos;intégralité du programme de formation certifiant :
              </p>

              <h3 className="text-sm sm:text-base font-black text-white" style={{ color: '#ffffff' }}>
                &laquo; {data.courseTitle} &raquo;
              </h3>
            </div>

            {/* Technical Metadata Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left max-w-2xl mx-auto bg-[#080d1a] border border-[#1e293b] rounded-xl p-3 text-[11px]" style={{ backgroundColor: '#080d1a' }}>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider block" style={{ color: '#64748b' }}>Modalité</span>
                <span className="font-bold text-[#22d3ee]" style={{ color: '#22d3ee' }}>{data.deliveryType}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider block" style={{ color: '#64748b' }}>Période</span>
                <span className="font-bold text-[#e2e8f0]" style={{ color: '#e2e8f0' }}>{data.startDate} — {data.endDate}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider block" style={{ color: '#64748b' }}>Volume Horaire</span>
                <span className="font-bold text-[#e2e8f0]" style={{ color: '#e2e8f0' }}>{data.durationHours} Heures</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider block" style={{ color: '#64748b' }}>Formateur</span>
                <span className="font-bold text-[#e2e8f0]" style={{ color: '#e2e8f0' }}>{data.trainerName}</span>
              </div>
            </div>

            {/* Verification Code Footer */}
            <div className="pt-2 border-t border-[#1e293b] text-center max-w-2xl mx-auto">
              <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider block mb-1" style={{ color: '#64748b' }}>Code de Vérification Unique</span>
              <span className="font-mono text-[10px] font-black text-[#22d3ee] bg-[#082f49] border border-[#075985] px-3 py-1 rounded inline-block" style={{ color: '#22d3ee', backgroundColor: '#082f49' }}>
                {data.verificationCode}
              </span>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
