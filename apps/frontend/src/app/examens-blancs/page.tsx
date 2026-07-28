'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Play, Sparkles, Target, CheckCircle, ArrowRight, ShieldCheck, Zap } from '@/components/icons';

export default function ExamensBlancsPublicPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      <div className="pt-28 pb-20 relative z-10 max-w-7xl mx-auto px-4 md:px-6 text-left space-y-16">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Examens Blancs & Entraînement Pratique IA
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Testez vos connaissances en conditions réelles d’examen officiel avec nos simulations chrono, corrections IA détaillées et calcul de votre indice d'aptitude (Readiness Score).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard/simulations"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Lancer une simulation d'examen</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3 FONCTIONNALITÉS CLÉS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <Play className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Conditions Réelles Chronométrées</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mêmes contraintes de temps, même nombre de questions et même format de QCM/Vrai-Faux qu'aux examens officiels Pearson VUE / PECB.
            </p>
          </div>

          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Correction & Explications par IA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chaque réponse est argumentée instantanément par notre moteur IA spécialisé afin de vous faire comprendre les notions techniques clés.
            </p>
          </div>

          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Readiness Score & Diagnostic</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Un score de préparation calculé en temps réel identifie vos axes d'amélioration avant de vous présenter à l'épreuve finale.
            </p>
          </div>
        </div>

        {/* TARIFICATION À L'UNITÉ OU EN PACK DÉGRESSIF */}
        <div className="space-y-8 text-center max-w-4xl mx-auto pt-6">
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Tarifs Examens Blancs — À l’unité ou en Pack Dégressif
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full">
                  Formule À l’Unité
                </span>
                <h3 className="text-xl font-bold text-white">1 Examen Blanc Complet</h3>
                <p className="text-3xl font-black text-white">29 € <span className="text-xs font-normal text-slate-400">/ examen</span></p>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> 1 tentative complète chronométrée</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Correction détaillée IA instantanée</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Diagnostic Readiness Score</li>
              </ul>

              <Link
                href="/register"
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Commander un examen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-gradient-to-b from-[#0b1329] to-[#080d1a] border-2 border-blue-600 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider text-white px-3 py-1 bg-blue-600 rounded-full shadow-md">
                Pack Dégressif
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full">
                  Pack ILLIMITÉ 5 Examens
                </span>
                <h3 className="text-xl font-bold text-white">Pack Préparation Intégrale</h3>
                <p className="text-3xl font-black text-white">79 € <span className="text-xs font-normal text-slate-400">au lieu de 145€</span></p>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> 5 simulations d'examens illimitées</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Correction & explications IA illimitées</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Accès prioritaire au Forum Membres</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Garantie de réussite aux examens</li>
              </ul>

              <Link
                href="/register"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Obtenir le Pack Dégressif</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
