import React from 'react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function ServicesSection() {
  const priorities = [
    {
      code: "01 // MISSION",
      title: "Notre Mission",
      desc: "Accompagner votre transformation digitale, sécuriser vos infrastructures critiques et garantir la continuité de vos systèmes.",
      bgImage: "/images/avantages-1-434x358.webp",
      accentColor: "from-blue-600/30 to-cyan-600/10",
      borderColor: "group-hover:border-cyan-500/60",
      badgeColor: "bg-cyan-950/60 text-cyan-400 border-cyan-800/60"
    },
    {
      code: "02 // EXPÉRIENCE",
      title: "Dix Ans d'Expertise",
      desc: "Une équipe d'auditeurs et ingénieurs certifiés seniors, ayant prouvé leur savoir-faire sur des projets d'envergure bancaires et étatiques.",
      bgImage: "/images/experiences-scaled-434x358.webp",
      accentColor: "from-purple-600/30 to-blue-600/10",
      borderColor: "group-hover:border-purple-500/60",
      badgeColor: "bg-purple-950/60 text-purple-300 border-purple-800/60"
    },
    {
      code: "03 // CERTIFICATION",
      title: "Certifications Récents",
      desc: "Plus de 500 cursus qualifiants et vouchers officiels (Microsoft, AWS, Palo Alto, PECB) pour propulser votre carrière internationale.",
      bgImage: "/images/certifications-scaled-434x358.png",
      accentColor: "from-emerald-600/30 to-teal-600/10",
      borderColor: "group-hover:border-emerald-500/60",
      badgeColor: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
    },
    {
      code: "04 // SOLUTION IT",
      title: "Solutions IT Intégrées",
      desc: "Conception Cloud, intégration d'équipements réseaux sécurisés (F5, Fortinet, Sophos) et infogérance managée 24/7.",
      bgImage: "/images/expertises-integrations-scaled-434x358.webp",
      accentColor: "from-amber-600/30 to-orange-600/10",
      borderColor: "group-hover:border-amber-500/60",
      badgeColor: "bg-amber-950/60 text-amber-300 border-amber-800/60"
    }
  ];

  return (
    <section id="priorite" className="relative z-10 w-full py-20 overflow-hidden border-t border-slate-900 bg-[#020617]">
      
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ contentVisibility: 'auto' }}>
        <img 
          src="/bg/cyber_services_bg.png" 
          alt="Services background" 
          className="w-full h-full object-cover opacity-40 transform-gpu" 
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-10 h-[2px] bg-blue-600 rounded-full" />
            <span className="text-sm font-black text-cyan-400 uppercase tracking-[0.2em]">Engagements & Piliers</span>
            <span className="w-10 h-[2px] bg-blue-600 rounded-full" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter">Notre Priorité</h2>
        </AnimatedSection>

        {/* Cartes Visuelles Sublimées sans icônes génériques avec Images Themiques & Animations 60 FPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {priorities.map((item, i) => (
            <div
              key={i}
              className={`group relative bg-[#080d1a] border border-slate-800 ${item.borderColor} rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-2xl flex flex-col justify-between h-[360px] text-left transform-gpu cursor-pointer`}
            >
              {/* Image de fond thématique avec Zoom au Survol */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={item.bgImage}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-35 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700 ease-out transform-gpu"
                  loading="lazy"
                  decoding="async"
                />
                {/* Gradient sombre pour lisibilité du texte */}
                <div className={`absolute inset-0 bg-gradient-to-t from-[#080d1a] via-[#080d1a]/80 to-transparent ${item.accentColor} opacity-90`} />
              </div>

              {/* Tag Code High-Tech au sommet (Pas d'icônes génériques) */}
              <div className="relative z-10 p-6 flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border uppercase backdrop-blur-md shadow-md ${item.badgeColor}`}>
                  {item.code}
                </span>
              </div>

              {/* Titre & Description sur fond verrier avec accents cybernétiques */}
              <div className="relative z-10 p-6 space-y-3 bg-gradient-to-t from-[#080d1a] via-[#080d1a]/90 to-transparent pt-8">
                <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors duration-300 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium line-clamp-3">
                  {item.desc}
                </p>

                {/* Barre de progression laser dorée/cyan au survol */}
                <div className="pt-2">
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
