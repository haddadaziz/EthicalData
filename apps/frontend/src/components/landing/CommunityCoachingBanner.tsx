'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Calendar, ArrowRight, CheckCircle, Sparkles, Tag, Play } from '@/components/icons';
import NeuralBackground from '@/components/ui/flow-field-background';

export function CommunityCoachingBanner() {
  return (
    <section className="py-20 md:py-28 relative z-10 bg-[#020617] border-t border-slate-900 overflow-hidden">
      
      {/* Full Section Neural Flow Field Interactive Animated Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-auto">
        <NeuralBackground color="#06b6d4" trailOpacity={0.12} speed={0.9} particleCount={550} />
      </div>

      {/* Soft Glow Overlays */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Contenu Texte Immersif */}
          <div className="lg:col-span-7 space-y-6">

            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Maximisez vos chances de réussite : <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                Examens Blancs IA, Vouchers & Mentoring
              </span>
            </h2>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
              Entraînez-vous avec nos simulations chronométrées avec correction IA (Readiness Score), achetez vos vouchers d'examen officiel avec réductions EDS et planifiez un coaching 1-on-1 avec un formateur expert.
            </p>

            {/* 3 Cartes Sobres avec Flèche Bleue à Droite */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link
                href="/examens-blancs"
                className="group flex items-center justify-between p-4 bg-[#080d1a]/90 backdrop-blur-md border border-slate-800 hover:border-cyan-500/60 rounded-2xl transition-all duration-300 shadow-md"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">Examens Blancs IA</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Readiness Score & IA</p>
                </div>
                <div className="w-7 h-7 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-all shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link
                href="/vouchers"
                className="group flex items-center justify-between p-4 bg-[#080d1a]/90 backdrop-blur-md border border-slate-800 hover:border-cyan-500/60 rounded-2xl transition-all duration-300 shadow-md"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">Vouchers Examen</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Réductions EDS</p>
                </div>
                <div className="w-7 h-7 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-all shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link
                href="/coaching"
                className="group flex items-center justify-between p-4 bg-[#080d1a]/90 backdrop-blur-md border border-slate-800 hover:border-cyan-500/60 rounded-2xl transition-all duration-300 shadow-md"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">Coaching 1-on-1</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Mentors Certifiés</p>
                </div>
                <div className="w-7 h-7 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-all shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>

            {/* Boutons CTA */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/examens-blancs"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Découvrir les Examens Blancs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/vouchers"
                className="px-6 py-3 bg-[#080d1a] hover:bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Voir les Vouchers</span>
              </Link>
            </div>
          </div>

          {/* Carte Visuelle / Témoignage rapide */}
          <div className="lg:col-span-5 bg-[#080d1a]/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                ED
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Espace Membres EthicalData</h4>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Communauté & Mentors IT</p>
              </div>
            </div>

            <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed border-l-2 border-cyan-500 pl-4 py-1">
              « L&apos;examen blanc avec la correction IA et le voucher à tarif réduit m&apos;ont permis d&apos;obtenir l&apos;AZ-900 du premier coup avec 920/1000 ! »
            </blockquote>
          </div>

        </div>
      </div>
    </section>
  );
}
