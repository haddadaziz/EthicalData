import React from 'react';
import { Clock, ArrowRight } from '@/components/icons';

export function EventsSection() {
  return (
    <section className="relative z-10 w-full py-12 lg:py-16 overflow-hidden bg-[#060B14]">
      
      {/* Background Image avec filtre sombre */}
      <div className="absolute inset-0">
        <img 
          src="/bg/events_bg_2.webp" 
          alt="Events background" 
          className="w-full h-full object-cover" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060B14] via-[#060B14]/70 to-[#060B14]/90" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight mb-16">
          Nouveaux événements
        </h2>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Colonne de Gauche : Événement Principal */}
          <div className="w-full lg:w-5/12 flex flex-col space-y-8">
            
            <div className="flex items-start gap-6">
              {/* Date Badge */}
              <div className="w-20 h-24 rounded-xl bg-red-600 text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-red-600/20">
                <span className="text-3xl font-black leading-none">31</span>
                <span className="text-xs font-bold uppercase tracking-widest mt-1">Mai</span>
              </div>

              {/* Titre et Heure */}
              <div className="space-y-3 mt-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  PMP- Project Management Professional
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>12:00 am - 12:00 am</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-[14px] text-slate-400 leading-relaxed font-medium">
              La formation Project Management Professional (PMP) s'adresse aux chefs de projet actuels et futurs, et vise à les familiariser avec les dernières théories et pratiques en gestion de projet, selon la 7e édition du guide PMBOK. Cette formation met l'accent sur les compétences stratégiques, commerciales et la gestion du changement.
            </p>

            {/* Bouton */}
            <div className="pt-2">
              <button 
                onClick={() => window.location.href = '/register'}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] flex items-center gap-3 w-fit"
              >
                S'inscrire <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Colonne de Droite : Autres événements (Minimaliste) */}
          <div className="w-full lg:w-7/12 flex flex-col justify-start">
            
            <div className="group cursor-pointer border-b border-white/10 pb-8 hover:border-red-500/50 transition-colors duration-300">
              <div className="space-y-3">
                <span className="text-sm font-bold text-slate-400 group-hover:text-red-400 transition-colors">12 mai</span>
                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-white transition-colors max-w-lg">
                  AWS Certified Solutions Architect - Associate
                </h3>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
