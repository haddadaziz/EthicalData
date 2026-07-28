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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <span>Examens Blancs, Vouchers & Coaching</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Maximisez vos chances de réussite : <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                Examens Blancs IA, Vouchers & Mentoring
              </span>
            </h2>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
              Entraînez-vous avec nos simulations chronométrées avec correction IA (Readiness Score), achetez vos vouchers d'examen officiel avec réductions EDS et planifiez un coaching 1-on-1 avec un formateur expert.
            </p>

            {/* 3 Cartes Rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link
                href="/examens-blancs"
                className="group flex flex-col p-3.5 bg-[#080d1a]/90 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 rounded-2xl transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center mb-2 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Examens Blancs IA</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Readiness Score & IA</p>
              </Link>

              <Link
                href="/vouchers"
                className="group flex flex-col p-3.5 bg-[#080d1a]/90 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-2 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Tag className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Vouchers Examen</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Réductions EDS</p>
              </Link>

              <Link
                href="/coaching"
                className="group flex flex-col p-3.5 bg-[#080d1a]/90 backdrop-blur-md border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-2 text-cyan-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Coaching 1-on-1</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Mentors Certifiés</p>
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
              « L'examen blanc avec la correction IA et le voucher à tarif réduit m'ont permis d'obtenir l'AZ-900 du premier coup avec 920/1000 ! »
            </blockquote>

            <div className="pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                Apprenants certifiés
              </span>
              <span className="font-bold text-white">98% de taux de réussite</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
