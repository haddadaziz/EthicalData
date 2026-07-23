'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Award, CheckCircle, ArrowRight, Calendar, MessageSquare, Zap } from '@/components/icons';

export function CommunityCoachingBanner() {
  return (
    <section className="py-20 relative z-10 bg-[#020617] border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="relative bg-gradient-to-br from-[#080d1a] via-[#0b1329] to-[#020617] border border-slate-800 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl text-left">
          
          {/* Formes décoratives en arrière-plan */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Contenu Texte */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-black uppercase tracking-wider">
                <span>Accompagnement Sur-Mesure & Entraide</span>
              </div>

              <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
                Ne révisez plus seul : Bénéficiez d’une communauté active & d’un mentorat dédié
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed">
                Rejoignez des centaines de candidats en préparation. Posez vos questions sur le forum, partagez vos résultats aux examens blancs et planifiez des séances individuelles avec des formateurs certifiés.
              </p>

              {/* Points clés */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Forum Entraide Membres</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Échanges quotidiens et retours d'expérience d’examen.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Coaching 1-on-1</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Séances individuelles pour débloquer vos révisions.</p>
                  </div>
                </div>
              </div>

              {/* Boutons CTA */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/coaching"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>Découvrir l’Accompagnement</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Carte Visuelle / Témoignage rapide */}
            <div className="lg:col-span-5 bg-[#020617]/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm">
                  ED
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Espace Membres EthicalData</h4>
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Communauté & Mentors IT</p>
                </div>
              </div>

              <blockquote className="text-xs text-slate-300 italic leading-relaxed border-l-2 border-cyan-500 pl-3">
                « Les échanges sur le forum et la séance de coaching m'ont permis de comprendre mes erreurs sur la gestion des sous-réseaux avant mon examen. Résultat : 920/1000 ! »
              </blockquote>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Apprenants certifiés
                </span>
                <span className="font-bold text-white">98% de taux de réussite</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
