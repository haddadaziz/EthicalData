'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Clock, ArrowRight, CheckCircle } from '@/components/icons';

const SESSIONS = [
  {
    id: 1,
    title: 'Microsoft Azure Fundamentals (AZ-900)',
    date: '15 Février - 18 Février 2026',
    schedule: 'Soir (18h30 - 21h30)',
    mode: 'Visioconférence & Labs',
    placesLeft: 4,
    totalPlaces: 12,
    badge: 'Prochaine Session',
    badgeClass: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30',
  },
  {
    id: 2,
    title: 'PECB ISO 27001 Lead Implementer',
    date: '22 Février - 26 Février 2026',
    schedule: 'Intensif Week-end',
    mode: 'Présentiel / Visioconférence',
    placesLeft: 2,
    totalPlaces: 10,
    badge: 'Dernières Places',
    badgeClass: 'bg-amber-600/20 text-amber-400 border border-amber-500/30',
  },
  {
    id: 3,
    title: 'Palo Alto Network Security PCNSA',
    date: '02 Mars - 06 Mars 2026',
    schedule: 'Journée (09h00 - 17h00)',
    mode: 'Visioconférence & BootCamp',
    placesLeft: 6,
    totalPlaces: 15,
    badge: 'Inscriptions Ouvertes',
    badgeClass: 'bg-blue-600/20 text-cyan-400 border border-blue-500/30',
  },
];

export function OpenSessionsSection() {
  return (
    <section className="relative z-10 py-20 bg-[#020617] border-t border-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
              Sessions de Formation Ouvertes
            </span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
            Réservez votre place pour nos prochaines sessions de formation en visioconférence ou bootcamp intensif avec formateurs certifiés.
          </p>
        </div>

        {/* Grille des sessions ouvertes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {SESSIONS.map((session) => (
            <div
              key={session.id}
              className="bg-[#080d1a] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${session.badgeClass}`}>
                    {session.badge}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    {session.placesLeft} places restantes
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {session.title}
                </h3>

                <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{session.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{session.mode}</span>
                  </div>
                </div>
              </div>

              {/* Bouton d'inscription */}
              <Link
                href="/register"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>S’inscrire à cette session</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
