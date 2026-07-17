import React from 'react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function ServicesSection() {
  const services = [
    { title: "Services IT", desc: "Nous vous accompagnons dans la mise en place, l'évolution et la sécurisation de votre infrastructure IT. Notre objectif est de garantir à votre entreprise performance, fiabilité et continuité, tout en assurant un haut niveau de disponibilité et de sécurité pour vos systèmes." },
    { title: "Certification", desc: "Boostez votre carrière grâce à nos certifications professionnelles reconnues. Elles vous permettent de valider vos compétences, d'accroître votre crédibilité sur le marché de l'emploi et de répondre aux exigences actuelles des entreprises en matière de qualité et d'expertise métier." },
    { title: "Formation", desc: "Nous proposons des formations spécialisées en IT et autres domaines clés. Adaptées aux professionnels et particuliers, elles visent à développer vos compétences, vous tenir à jour avec les nouvelles technologies, et répondre concrètement à vos objectifs de carrière ou d'entreprise." },
    { title: "Infogérance", desc: "Confiez-nous la gestion de votre système d'information. Nous assurons la maintenance, la supervision, la sécurité et le bon fonctionnement de vos infrastructures IT, sur site ou à distance, pour vous permettre de rester concentré sur votre cœur de métier, en toute sérénité." },
    { title: "Intégration", desc: "Nous vous aidons à intégrer des solutions technologiques sur mesure, compatibles avec votre environnement IT. Notre expertise vous permet de réussir votre transformation digitale en assurant la cohérence, la performance et l'optimisation de l'ensemble de votre système d'information." },
    { title: "Services professionnels", desc: "Nos experts interviennent pour des missions de conseil, d'audit et de déploiement IT. Grâce à une approche sur mesure, nous vous apportons un accompagnement stratégique et opérationnel pour relever vos défis technologiques et garantir la réussite de vos projets." }
  ];

  return (
    <section id="services" className="relative z-10 w-full py-20 overflow-hidden border-t border-slate-900 bg-[#020617]">
      
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ contentVisibility: 'auto' }}>
        <img 
          src="/bg/cyber_services_bg.png" 
          alt="Services background" 
          className="w-full h-full object-cover opacity-40 transform-gpu" 
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-10 h-[2px] bg-red-600 rounded-full" />
            <span className="text-sm font-black text-red-500 uppercase tracking-[0.2em]">Notre Expertise</span>
            <span className="w-10 h-[2px] bg-red-600 rounded-full" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter">Nos Prestations</h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, i) => (
            <AnimatedSection key={i} delay={i * 0.05}>
              <div className="group relative bg-[#0a0f1d]/60 backdrop-blur-sm border border-slate-900 hover:border-red-900/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-3xl font-black text-red-500/30 group-hover:text-red-500 transition-colors duration-500 leading-none mt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors duration-300 leading-tight">
                    {srv.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-normal group-hover:text-slate-300 transition-colors duration-300">
                  {srv.desc}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
