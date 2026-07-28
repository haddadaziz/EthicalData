'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Layers, ShieldCheck, Briefcase, Cpu, ArrowRight, CheckCircle } from '@/components/icons';

const ALL_SERVICES = [
  {
    title: "Infogérance",
    href: "/infogerance",
    desc: "Supervision 24/7, maintenance préventive/corrective, conseil et gestion complète de votre infrastructure informatique.",
    icon: Layers,
  },
  {
    title: "Intégration",
    href: "/integration",
    desc: "Conception, installation, déploiement et optimisation de solutions réseaux, cloud, sécurité et systèmes d'information.",
    icon: Cpu,
  },
  {
    title: "Services Professionnels",
    href: "/services-professionnels",
    desc: "Missions d'audit, ingénierie, rédaction de cahiers des charges et assistance à maîtrise d'ouvrage (AMOA/AMOE).",
    icon: Briefcase,
  },
  {
    title: "Solution IT",
    href: "/services/solution-it",
    desc: "Architectures Cloud hybrides, solutions matérielles & logicielles sur-mesure pour les entreprises.",
    icon: ShieldCheck,
  },
  {
    title: "Portage Salarial",
    href: "/services/portage-salarial",
    desc: "Accompagnement administratif, juridique et financier des consultants et experts IT indépendants.",
    icon: CheckCircle,
  },
];

export default function ServicesHubPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#020617] text-center">
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div
            className="w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-black uppercase tracking-widest">
            <span>NOS SERVICES IT & CYBERSÉCURITÉ</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              Nos Solutions & Services IT
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Découvrez nos expertises en infogérance, intégration de systèmes et services professionnels sur-mesure.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 relative z-10 bg-[#030712] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ALL_SERVICES.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div key={idx} className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{srv.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{srv.desc}</p>
                  </div>
                  <Link
                    href={srv.href}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>En savoir plus</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
