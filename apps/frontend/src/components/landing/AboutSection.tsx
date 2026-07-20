import React from 'react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { AboutSlider } from './AboutSlider';

export function AboutSection() {
  return (
    <section id="about" className="relative z-10 w-full pt-20 md:pt-24 pb-24 bg-[#030712]">
      
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ contentVisibility: 'auto' }}>
        <img 
          src="/bg/about_cyber_bg.png" 
          alt="Cyber network background" 
          className="w-full h-full object-cover opacity-25 transform-gpu" 
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black text-white uppercase leading-tight tracking-tight">
          ETHICAL DATA SECURITY
        </h2>
        <p className="text-slate-300 text-sm md:text-[15px] leading-relaxed font-medium max-w-4xl mx-auto">
          Dynamisme, réactivité, et innovation font partie de nos principaux engagements vis à vis de nos clients. De même, toutes nos prestations et solutions sont conçues et réalisées par des experts reconnus dans leurs domaines. Chez ETHICAL DATA SECURITY, nous ferons toujours les efforts nécessaires pour dépasser vos attentes.
        </p>
        
        <div className="flex flex-wrap justify-center gap-12 sm:gap-20 md:gap-32 pt-8 pb-4">
          {[
            { end: 254, label: "Projets Réalisés" },
            { end: 569, label: "Formations" },
            { end: 2000, label: "Certificats" },
            { end: 100, label: "Mission Pentest" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl sm:text-5xl font-black text-cyan-500 mb-1 drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                <AnimatedNumber end={stat.end} />
              </p>
              <p className="text-[11px] sm:text-xs text-white font-extrabold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <AnimatedSection className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-12 mt-6 md:mt-12">
         <AboutSlider />
      </AnimatedSection>
    </section>
  );
}
