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
    <section id="services" className="relative z-10 w-full pt-8 pb-2 lg:pt-10 lg:pb-4 overflow-hidden border-t border-slate-900 bg-[#060B14]">
      
      {/* Background Image avec léger filtre bleu */}
      <div className="absolute inset-0">
        <img 
          src="/logos/services_bg.jpg" 
          alt="" 
          className="w-full h-full object-cover" 
          loading="lazy"
        />
        {/* Filtre bleu très léger pour adoucir (Multiply pour fusionner élégamment) */}
        <div className="absolute inset-0 bg-[#0C1E3A]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B14] via-transparent to-[#060B14] opacity-80" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-stretch gap-12 lg:gap-16">
        
        {/* Côté Gauche : Professionnel invitant (Fortement décalé à gauche) */}
        <div className="hidden lg:flex lg:w-1/3 min-h-[400px] items-end justify-start relative">
           <img 
            src="/logos/landing_page_guy.webp" 
            alt="Nos Services" 
            className="absolute -bottom-6 -left-28 h-[105%] w-auto max-w-[150%] object-contain object-bottom z-10 drop-shadow-2xl" 
          />
        </div>

        {/* Côté Droit : Grille de services (Sans bordures) */}
        <div className="w-full lg:w-2/3 flex flex-col space-y-16 pt-4 pb-0 relative z-20">
          
          {/* En-tête de section ultra moderne */}
          <div className="text-center lg:text-left space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <span className="w-10 h-[2px] bg-red-600 rounded-full" />
              <span className="text-sm font-black text-red-500 uppercase tracking-[0.2em]">Notre Expertise</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter">Nos Prestations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14">
            {services.map((srv, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="flex flex-col space-y-3 group cursor-default">
                  
                  {/* Numéro et Titre (Aucun encadrement) */}
                  <div className="flex items-end gap-4 mb-2">
                    <span className="text-5xl font-black text-slate-700/40 group-hover:text-red-500 transition-colors duration-500 leading-none">
                      0{i + 1}
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-wide group-hover:text-red-400 transition-colors duration-300 leading-tight pb-1">
                      {srv.title}
                    </h3>
                  </div>

                  {/* Description simple et épurée */}
                  <p className="text-[15px] text-slate-300 leading-relaxed font-normal group-hover:text-white transition-colors duration-300">
                    {srv.desc}
                  </p>

                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
