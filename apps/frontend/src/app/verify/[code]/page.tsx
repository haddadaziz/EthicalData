'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, CheckCircle, Award, Calendar, User, Clock, FileText, Share2, DownloadCloud, ArrowLeft } from '@/components/icons';
import { useToast } from '@/context/ToastContext';

export default function VerifyCodeResultPage() {
  const params = useParams();
  const code = (params?.code as string) || '';
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Dynamic calculation or mock lookup based on code prefix/format
  const isAttestation = code.toUpperCase().includes('ATT');
  
  const certificateData = {
    code: code.toUpperCase(),
    status: 'VALIDE & AUTHENTIQUE',
    documentType: isAttestation ? 'Attestation Officielle de Formation' : 'Certificat de Réussite d\'Examen',
    studentName: 'Mehdi Benjeloun',
    title: isAttestation ? 'Infogérance Cloud & Sécurité des Systèmes' : 'Microsoft Azure Fundamentals (AZ-900)',
    issueDate: '28 Juillet 2026',
    expiryDate: 'Permanent (Sans expiration)',
    score: isAttestation ? undefined : '92%',
    durationHours: isAttestation ? 40 : undefined,
    trainer: 'Thomas Dupont (Lead Cloud Architect)',
    authority: 'Ethical Data Security — CNDP & ISO Compliant',
    verificationUrl: typeof window !== 'undefined' ? window.location.href : `https://ethicaldatasecurity.ma/verify/${code}`
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificateData.verificationUrl);
    setCopied(true);
    showToast("Lien de vérification public copié dans le presse-papier !", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans flex flex-col justify-between">
      <Navbar />

      <div className="pt-28 pb-20 relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-left space-y-8 my-auto">
        
        {/* RETOUR ET FIL D'ARIANE */}
        <div className="flex items-center justify-between">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Vérifier un autre document</span>
          </Link>

          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            ID: {certificateData.code}
          </span>
        </div>

        {/* VERIFICATION STATUS CARD */}
        <div className="bg-[#080d1a] border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/50">
                <ShieldCheck className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <span className="px-3 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-800/80 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  {certificateData.status}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
                  {certificateData.documentType}
                </h1>
              </div>
            </div>

            {/* QR Code Scannable Preview */}
            <div className="flex items-center gap-3 bg-[#020617] border border-slate-800 p-2.5 rounded-2xl shrink-0">
              <div className="w-16 h-16 bg-white p-1 rounded-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(certificateData.verificationUrl)}`}
                  alt="QR Code Vérification Officielle"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                <span className="text-emerald-400 font-bold block">QR CODE SÉCURISÉ</span>
                <span className="block text-[9px]">Scannez pour vérifier sur mobile</span>
              </div>
            </div>
          </div>

          {/* MAIN DOCUMENT METADATA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" /> Titulaire du Document
                </span>
                <p className="text-lg font-black text-white">{certificateData.studentName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-cyan-400" /> Intitulé Officiel
                </span>
                <p className="text-sm font-bold text-cyan-300">&laquo; {certificateData.title} &raquo;</p>
              </div>

              {certificateData.score && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Score d&apos;Éligibilité Obtenu
                  </span>
                  <p className="text-base font-black text-emerald-400">{certificateData.score}</p>
                </div>
              )}

              {certificateData.durationHours && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Volume Horaire Réalisé
                  </span>
                  <p className="text-base font-black text-white">{certificateData.durationHours} Heures de Formation</p>
                </div>
              )}
            </div>

            <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Date d&apos;Émission
                </span>
                <p className="text-sm font-bold text-slate-200">{certificateData.issueDate}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Statut de Validité
                </span>
                <p className="text-sm font-bold text-slate-200">{certificateData.expiryDate}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" /> Organisme Délivreur
                </span>
                <p className="text-xs font-bold text-slate-300">{certificateData.authority}</p>
              </div>
            </div>

          </div>

          {/* ACTIONS & PUBLIC SHARE BUTTONS */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-5 py-3 bg-[#020617] border border-slate-800 hover:border-cyan-500/60 text-cyan-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>{copied ? 'Lien copié !' : 'Partager le lien public de vérification'}</span>
            </button>

            <Link
              href="/formations"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Découvrir nos Formations & Certifications</span>
            </Link>
          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
}
