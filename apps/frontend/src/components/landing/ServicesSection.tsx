import React from 'react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { ShieldCheck, Award, Cpu, Target } from '@/components/icons';

export function ServicesSection() {
  const priorities = [
    {
      icon: Target,
      title: "Mission",
      desc: "Accompagner la transformation digitale et assurer la continuité opérationnelle ainsi que la sécurité maximale de vos infrastructures IT."
    },
    {
      icon: ShieldCheck,
      title: "Expérience",
      desc: "Une expertise éprouvée et des interventions sur-mesure réalisées par des auditeurs et ingénieurs seniors certifiés dans leurs domaines."
    },
    {
      icon: Award,
      title: "Certification",
      desc: "Des cursus de formation officiels et qualifiants permettant de valider vos compétences IT avec des vouchers d'examen officiels."
    },
    {
      icon: Cpu,
      title: "Solution IT",
      desc: "Déploiement d'architectures Cloud, infogérance proactive, intégration de systèmes et solutions de cybersécurité de pointe."
    }
  ];

  return (
    <section id="priorite" className="relative z-10 w-full py-20 overflow-hidden border-t border-slate-900 bg-[#020617]">
      
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

        {/* Bloc Notre priorité à 4 cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {priorities.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="group relative bg-[#080d1a]/90 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-xl text-left">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Icon className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300 mb-3">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
