'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Search, CheckCircle, ArrowRight, QrCode, Lock } from '@/components/icons';

export default function VerifySearchPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Veuillez saisir un code de vérification valide.');
      return;
    }
    setError('');
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans flex flex-col justify-between">
      <Navbar />

      <div className="pt-32 pb-20 relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center space-y-10 my-auto">
        
        {/* HERO HEADER */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Vérification Officielle des Certificats & Attestations (Loi 09-08)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              Portail Public de Vérification
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Vérifiez l&apos;authenticité des certificats de réussite et attestations de formation délivrés par Ethical Data Security en saisissant l&apos;identifiant unique ou en scannant le QR Code.
          </p>
        </div>

        {/* SEARCH FORM */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl space-y-6 text-left">
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code-input" className="text-xs font-bold text-slate-300 block">
                Code de vérification du document :
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="code-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Exemple: EDS-ATT-8492048 ou EDS-CERT-AZ900-2026"
                  className="w-full pl-11 pr-4 py-3 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-white placeholder-slate-500 text-xs font-mono font-bold outline-none uppercase tracking-wider transition-all"
                />
              </div>
              {error && <p className="text-[11px] font-bold text-rose-500">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Vérifier l&apos;authenticité du document</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* EXEMPLES TEST RAPIDE */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Codes de démonstration à tester :
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <Link
                href="/verify/EDS-ATT-8492048"
                className="px-3 py-1 bg-[#020617] border border-slate-800 hover:border-cyan-500 text-cyan-400 font-mono text-[11px] rounded-lg transition-colors"
              >
                EDS-ATT-8492048 (Attestation)
              </Link>
              <Link
                href="/verify/EDS-CERT-AZ900-2026"
                className="px-3 py-1 bg-[#020617] border border-slate-800 hover:border-emerald-500 text-emerald-400 font-mono text-[11px] rounded-lg transition-colors"
              >
                EDS-CERT-AZ900-2026 (Certificat Examen)
              </Link>
            </div>
          </div>
        </div>

        {/* GARANTIES SÉCURITÉ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left text-xs">
          <div className="p-4 bg-[#080d1a] border border-slate-800/80 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Horodatage Infalsifiable</span>
            </div>
            <p className="text-[11px] text-slate-400">Chaque document est scellé avec un identifiant cryptographique unique.</p>
          </div>

          <div className="p-4 bg-[#080d1a] border border-slate-800/80 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <QrCode className="w-4 h-4" />
              <span>Scan QR Code Direct</span>
            </div>
            <p className="text-[11px] text-slate-400">Accessible instantanément via l&apos;appareil photo d&apos;un smartphone.</p>
          </div>

          <div className="p-4 bg-[#080d1a] border border-slate-800/80 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>Conforme CNDP Loi 09-08</span>
            </div>
            <p className="text-[11px] text-slate-400">Seules les métadonnées de certification publiques sont exposées.</p>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
