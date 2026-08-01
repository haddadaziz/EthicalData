"use client";

import React, { useRef, useState } from 'react';
import { X, DownloadCloud, ShieldCheck, Award, CheckCircle } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface CertificatScoreData {
  studentName: string;
  certificationName: string;
  examCode: string;
  score: number;
  dateObtained: string;
  verificationCode: string;
}

interface CertificatScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CertificatScoreData | null;
}

export default function CertificatScoreModal({ isOpen, onClose, data }: CertificatScoreModalProps) {
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
      const html2pdf = (await import('html2pdf.js')).default;
      const element = printRef.current;
      const filename = `Certificat_Examen_${data.examCode}_${data.studentName.replace(/\s+/g, '_')}.pdf`;

      const options = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#020617',
          windowWidth: 1120,
          onclone: (clonedDoc: Document) => {
            const el = clonedDoc.getElementById('printable-certificat-score');
            if (el) {
              el.style.backgroundColor = '#020617';
              el.style.color = '#ffffff';
              el.style.width = '1120px';
              el.style.minHeight = '792px';
              el.style.height = '792px';
              el.style.maxWidth = 'none';
              el.style.borderRadius = '0px';
              el.style.padding = '48px 60px';
              el.style.boxSizing = 'border-box';
              el.style.display = 'flex';
              el.style.flexDirection = 'column';
              el.style.justifyContent = 'space-between';
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
      };

      await html2pdf().set(options).from(element).save();
    } catch (err) {
      console.error("Erreur génération PDF Certificat:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
        {/* PRINT MEDIA STYLES */}
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
            #printable-certificat-score, #printable-certificat-score * {
              visibility: visible;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #printable-certificat-score {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 297mm !important;
              height: 210mm !important;
              margin: 0 !important;
              padding: 20mm !important;
              background-color: #020617 !important;
              border: 2px solid #10b981 !important;
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
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-black text-white leading-snug">Certificat Officiel de Réussite d&apos;Examen Blanc</h3>
                <p className="text-[10px] text-slate-400">Document certifiant la réussite à l&apos;examen avec score minimum atteint</p>
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
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>{downloading ? 'Génération...' : 'Télécharger Certificat PDF'}</span>
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

          {/* PRINTABLE CERTIFICATE DIPLOMA CARD */}
          <div
            id="printable-certificat-score"
            ref={printRef}
            style={{ backgroundColor: '#020617', color: '#ffffff' }}
            className="bg-[#020617] border border-[#10b981] rounded-2xl p-6 sm:p-8 space-y-5 relative overflow-hidden text-center shadow-inner overflow-y-auto max-h-[76vh]"
          >
            {/* Corner Decorative Gold Borders */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#10b981] pointer-events-none" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#10b981] pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#10b981] pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#10b981] pointer-events-none" />

            {/* Logo & Title Header */}
            <div className="space-y-2">
              <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-9 mx-auto object-contain" />
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#10b981]" style={{ color: '#10b981' }}>
                CERTIFICAT DE RÉUSSITE D&apos;EXAMEN
              </h1>
              <p className="text-[10px] text-[#94a3b8] italic" style={{ color: '#94a3b8' }}>
                Validation Officielle du Score d&apos;Éligibilité & de Maîtrise des Compétences
              </p>
            </div>

            {/* Main Statement */}
            <div className="space-y-2 max-w-xl mx-auto py-3 border-y border-[#1e293b]">
              <p className="text-[11px] text-[#cbd5e1]" style={{ color: '#cbd5e1' }}>
                Le Comité d&apos;Évaluation et de Certification <strong className="text-white" style={{ color: '#ffffff' }}>Ethical Data Security</strong> certifie que :
              </p>
              
              <h2 className="text-lg sm:text-xl font-black text-[#10b981] uppercase tracking-tight py-1 border-b border-[#10b981] inline-block px-4" style={{ color: '#10b981' }}>
                {data.studentName}
              </h2>

              <p className="text-[11px] text-[#cbd5e1] pt-1" style={{ color: '#cbd5e1' }}>
                a passé avec succès l&apos;examen blanc certifiant et obtenu le diplôme de compétences :
              </p>

              <h3 className="text-sm sm:text-base font-black text-white" style={{ color: '#ffffff' }}>
                &laquo; {data.certificationName} &raquo;
              </h3>
            </div>

            {/* Score & Exam Metadata */}
            <div className="grid grid-cols-3 gap-3 text-center max-w-md mx-auto bg-[#080d1a] border border-[#10b981]/40 rounded-xl p-3 text-[11px]" style={{ backgroundColor: '#080d1a' }}>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider block" style={{ color: '#64748b' }}>Score Obtenu</span>
                <span className="font-black text-[#10b981] text-sm" style={{ color: '#10b981' }}>{data.score}%</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider block" style={{ color: '#64748b' }}>Code Examen</span>
                <span className="font-bold text-[#e2e8f0]" style={{ color: '#e2e8f0' }}>{data.examCode}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider block" style={{ color: '#64748b' }}>Date Délivrance</span>
                <span className="font-bold text-[#e2e8f0]" style={{ color: '#e2e8f0' }}>{data.dateObtained}</span>
              </div>
            </div>

            {/* Verification Code Footer & QR Code */}
            <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between max-w-2xl mx-auto text-left">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider block" style={{ color: '#64748b' }}>Verification Authenticity QR Code</span>
                <span className="font-mono text-[10px] font-black text-[#10b981] bg-[#064e3b]/60 border border-[#047857] px-3 py-1 rounded inline-block" style={{ color: '#10b981', backgroundColor: '#064e3b' }}>
                  {data.verificationCode}
                </span>
                <a
                  href={`/verify/${encodeURIComponent(data.verificationCode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-emerald-400 font-bold underline block hover:text-white"
                >
                  Lien de vérification public en ligne &rarr;
                </a>
              </div>

              <div className="w-14 h-14 bg-white p-1 rounded-lg shrink-0 shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://ethicaldatasecurity.ma/verify/${data.verificationCode}`)}`}
                  alt="QR Code Certificat"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
