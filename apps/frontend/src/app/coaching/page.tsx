'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Calendar, Users, Award, CheckCircle, ArrowRight, ShieldCheck, Zap, MessageSquare } from '@/components/icons';

export default function CoachingPublicPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      <div className="pt-28 pb-20 relative z-10 max-w-7xl mx-auto px-4 md:px-6 text-left space-y-16">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-black uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Accompagnement Individualisé</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Coaching Personnalisé & Mentoring par des Formateurs Experts
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Bénéficiez d’un accompagnement sur-mesure pour débloquer vos doutes, valider vos compétences pratiques et réussir vos certifications IT dès le premier essai.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard/appointments"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Réserver une session de coaching</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/register"
              className="px-6 py-3 bg-[#080d1a] hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Créer un compte candidat
            </Link>
          </div>
        </div>

        {/* 3 PILIERS DU COACHING */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Séances 1-on-1 en Visioconférence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Réservez directement votre créneau dans le calendrier de votre mentor. Analyse détaillée de vos résultats et plan de révision ciblé.
            </p>
          </div>

          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Accès Privilégié au Forum Membres</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Posez vos questions techniques et obtenez des réponses rapides des formateurs et des retours d’expérience d’examens récents.
            </p>
          </div>

          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Correction & Évaluation par IA Gemini</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vos réponses aux questions ouvertes sont évaluées instantanément selon la grille officielle avec une note de 0 à 100 et des conseils d'amélioration.
            </p>
          </div>
        </div>

        {/* CTA BANNER BOTTOM */}
        <div className="bg-gradient-to-r from-blue-950/60 via-[#080d1a] to-blue-950/60 border border-slate-800 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Prêt à maximiser vos chances de réussite aux examens ?
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto">
            Rejoignez notre plateforme dès aujourd'hui et réservez votre accompagnement personnalisé.
          </p>
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <span>Prendre rendez-vous avec un mentor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  );
}
