'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Layers, ShieldCheck, Briefcase, MessageSquare, Activity, Cpu, ArrowRight, CheckCircle, Phone } from '@/components/icons';

const INFOGERANCE_SERVICES = [
  {
    icon: Layers,
    number: "01",
    title: "Supervision Des Équipements",
    desc: "Nous assurons une surveillance continue de vos infrastructures IT afin de garantir leur bon fonctionnement et anticiper les éventuelles anomalies. Grâce à des outils performants, nous détectons et résolvons rapidement les incidents pour assurer la disponibilité et la performance de vos systèmes."
  },
  {
    icon: ShieldCheck,
    number: "02",
    title: "Sécurisation Des Systèmes",
    desc: "Nous mettons en place des solutions avancées pour protéger vos infrastructures contre les cybermenaces. De l'analyse des vulnérabilités à la mise en œuvre de stratégies de défense robustes, nous veillons à la confidentialité, l'intégrité et la disponibilité de vos données."
  },
  {
    icon: Briefcase,
    number: "03",
    title: "Maintenance Et Support",
    desc: "Nos experts interviennent pour assurer la pérennité et l'efficacité de vos infrastructures IT. Nous proposons des services de maintenance préventive et corrective ainsi qu'un support technique réactif pour garantir la continuité de vos opérations."
  },
  {
    icon: MessageSquare,
    number: "04",
    title: "Conseil Et Accompagnement",
    desc: "Nous vous accompagnons dans la définition et la mise en place de votre stratégie IT en fonction de vos besoins et objectifs. Nos consultants vous apportent des recommandations personnalisées pour optimiser vos investissements technologiques et renforcer la résilience de votre infrastructure."
  },
  {
    icon: Activity,
    number: "05",
    title: "Optimisation De Infrastructure",
    desc: "Nous analysons vos infrastructures existantes afin d'identifier les axes d'amélioration en termes de performance, de sécurité et de coût. Grâce à des solutions innovantes et adaptées, nous vous aidons à maximiser l'efficacité de votre environnement IT."
  },
  {
    icon: Cpu,
    number: "06",
    title: "Intégration Des Solutions IT",
    desc: "Nous vous accompagnons dans le déploiement et l'intégration de solutions IT adaptées à vos besoins. Qu'il s'agisse de solutions réseau, cloud ou de cybersécurité, nous veillons à une mise en œuvre efficace et harmonieuse pour optimiser la performance et la sécurité de votre infrastructure."
  }
];

export default function InfogerancePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      {/* HERO SECTION - Lightweight High-Performance Gradient Glow */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#020617] text-center">
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div
            className="w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
          />
          <span className="absolute text-6xl sm:text-8xl md:text-9xl font-black text-slate-800/10 tracking-tighter uppercase select-none whitespace-nowrap">
            ETHICAL DATA SECURITY
          </span>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-black uppercase tracking-widest">
            <span>ETHICAL DATA SECURITY — l&apos;essentiel en un clic !</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              Infogérance
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Déléguez la gestion, la maintenance et la sécurité de votre système d’information à des experts certifiés et concentrez-vous sur votre cœur de métier.
          </p>
        </div>
      </section>

      {/* SECTION 01: L'INFOGÉRANCE IT (SPLIT LAYOUT) */}
      <section className="py-16 md:py-24 relative z-10 bg-[#030712] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Image d'illustration */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#080d1a] p-3 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=800&q=75"
                  alt="L'infogérance IT - Ingénieure en cybersécurité"
                  className="w-full h-[350px] md:h-[420px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 rounded-2xl pointer-events-none" />
                
                {/* Badge 01 */}
                <div className="absolute top-6 left-6 bg-[#020617] border border-cyan-500/40 px-5 py-2.5 rounded-2xl shadow-xl">
                  <span className="text-3xl font-black text-cyan-400 tracking-wider">01</span>
                </div>
              </div>
            </div>

            {/* Texte Présentation L'infogérance IT */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-cyan-400 text-xs font-black uppercase tracking-wider">
                <span>Expertise Infra & Sécurité</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                L&apos;infogérance IT
              </h2>

              <p className="text-cyan-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                performance, sécurité et sérénité au service de votre croissance
              </p>

              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
                Confier la gestion de votre infrastructure IT à des experts est la meilleure solution pour optimiser vos performances tout en maîtrisant vos coûts. Nos services d&apos;infogérance vous permettent de déléguer tout ou partie de l&apos;exploitation de votre système informatique, garantissant ainsi une gestion efficace, sécurisée et évolutive. Vous pouvez ainsi vous concentrer pleinement sur votre cœur de métier en toute sérénité.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>Demander un audit d&apos;infogérance</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BANNER SECTION */}
      <section className="py-16 relative z-10 bg-[#020617] border-t border-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
              performance, sécurité et sérénité au service de votre croissance.
            </span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
            Nous vous accompagnons dans la gestion, la sécurisation et l&apos;optimisation de votre infrastructure IT. De la supervision des équipements à l&apos;infogérance complète, en passant par le conseil et le support, nos experts vous garantissent des solutions adaptées, performantes et sécurisées pour vous permettre de vous concentrer sur votre cœur de métier.
          </p>
        </div>
      </section>

      {/* GRILLE DE 6 PRESTATIONS D'INFOGÉRANCE (Fast Optimized Cards) */}
      <section className="py-16 md:py-24 relative z-10 bg-[#030712] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <span>Nos Domaines d&apos;Intervention</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Nos Prestations d&apos;Infogérance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {INFOGERANCE_SERVICES.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.number}
                  className="group bg-[#080d1a] border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-6 md:p-8 space-y-5 transition-all duration-200 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Icon className="w-6 h-6 transition-colors" />
                      </div>
                      <span className="text-2xl font-black text-cyan-400/30 group-hover:text-cyan-400 transition-colors">
                        {srv.number}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {srv.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {srv.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs font-bold text-cyan-400 group-hover:text-white transition-colors">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Inclus dans l&apos;offre Infogérance</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA BOTTOM CONTACT BANNER */}
      <section className="py-16 relative z-10 bg-[#020617] border-t border-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 shadow-2xl">
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Prêt à sécuriser & optimiser votre infrastructure IT ?
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
              Contactez nos experts pour une analyse gratuite de vos besoins d&apos;infogérance et obtenez une proposition sur-mesure.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Prendre contact avec un expert</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
