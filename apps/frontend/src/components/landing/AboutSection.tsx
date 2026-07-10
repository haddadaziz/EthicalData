import React from 'react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { AboutSlider } from './AboutSlider';

export function AboutSection() {
  return (
    <section id="about" className="relative z-10 w-full pt-20 md:pt-24 pb-24 bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase leading-tight tracking-tight">
          ETHICAL DATA SECURITY
        </h2>
        <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed font-medium max-w-4xl mx-auto">
          Dynamisme, réactivité, et innovation font partie de nos principaux engagements vis à vis de nos clients. De même, toutes nos prestations et solutions sont conçues et réalisées par des experts reconnus dans leurs domaines. Chez ETHICAL DATA SECURITY, nous ferons toujours les efforts nécessaires pour dépasser vos attentes.
        </p>
        
        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 sm:gap-20 md:gap-32 pt-8 pb-4">
          {[
            { end: 254, label: "Projets Réalisés" },
            { end: 569, label: "Formations" },
            { end: 2000, label: "Certificats" },
            { end: 100, label: "Mission Pentest" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl sm:text-5xl font-black text-red-600 mb-1">
                <AnimatedNumber end={stat.end} />
              </p>
              <p className="text-[11px] sm:text-xs text-slate-900 font-extrabold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Logos Partenaires / Accréditations */}
        <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 pt-8 pb-4 opacity-90">
          <img src="/favicon_ethical_data.png" alt="Ethical Data Security" className="h-16 md:h-20 object-contain hover:scale-105 transition-transform duration-500" />
          <img src="/logos/pearson_vue_authorized.png" alt="Pearson VUE Authorized" className="h-16 md:h-20 object-contain hover:scale-105 transition-transform duration-500" />
        </div>
      </div>

      {/* Le composant Slider avec l'image Technopark en fond et la carte blanche */}
      <AnimatedSection className="w-full max-w-6xl mx-auto px-4 md:px-12 mt-6 md:mt-12">
         <AboutSlider />
      </AnimatedSection>
    </section>
  );
}
