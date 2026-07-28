'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CheckCircle, ArrowRight, ShieldCheck, Clock, Users, Phone } from '@/components/icons';

const AVANTAGES = [
  "Prestation réglée à J+72H.",
  "Contrat de prestation légalisé.",
  "Suivi personnalisé.",
  "Accès à des missions à forte valeur ajoutée."
];

export default function PartageSalarialPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#020617] text-center">
        {/* Lightweight Radial Background Glow */}
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
              Partage Salarial
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Une solution innovante permettant aux experts IT indépendants d&apos;exercer en toute autonomie tout en déléguant la gestion administrative et juridique.
          </p>

          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Rejoindre notre réseau d&apos;experts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 1: PARTAGE SALARIAL (SPLIT LAYOUT) */}
      <section className="py-16 md:py-24 relative z-10 bg-[#030712] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Image Block */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#080d1a] p-3 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=75"
                  alt="Partage salarial - Autonomie et sérénité"
                  className="w-full h-[350px] md:h-[430px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 rounded-2xl pointer-events-none" />
                
                {/* Floating Badge */}
                <div className="absolute top-6 left-6 bg-[#020617] border border-cyan-500/40 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Statut Sécurisé</span>
                </div>
              </div>
            </div>

            {/* Content Text Block */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-cyan-400 text-xs font-black uppercase tracking-wider">
                <span>Modèle d&apos;Emploi Innovant</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Partage salarial
              </h2>

              <div className="space-y-4 text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-normal">
                <p>
                  Le partage salarial, c&apos;est une façon innovante pour les travailleurs indépendants d&apos;exercer leur activité professionnelle sans avoir à créer leur propre entreprise. En effet, cette forme d&apos;emploi implique une relation tripartite entre le travailleur indépendant, une société de partage salarial et ses clients.
                </p>
                <p>
                  Concrètement, le professionnel en partage conserve son autonomie dans l&apos;organisation de son travail tout en bénéficiant du soutien administratif, financier et juridique de la société de partage. Cette dernière agit à la fois comme un tiers employeur pour le professionnel et comme un intermédiaire dans ses relations commerciales avec ses clients.
                </p>
                <p>
                  Contrairement à un salarié traditionnel, le travailleur en partage salarial reste maître de sa clientèle et négocie directement avec ses clients les conditions de ses prestations, telles que la nature, les modalités d&apos;exécution, la durée et le tarif. Ensuite, la société de partage salarial formalise ces accords en signant un contrat de service avec le client, tandis que le professionnel signe un contrat de sous-traitance en partage salarial avec la société de partage.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: AVANTAGES (SPLIT LAYOUT REVERSE) */}
      <section className="py-16 md:py-24 relative z-10 bg-[#020617] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center lg:flex-row-reverse">
            
            {/* Text Block */}
            <div className="lg:col-span-6 space-y-6 text-left lg:order-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-black uppercase tracking-wider">
                <span>Vos Bénéfices au Quotidien</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Avantages
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-normal">
                Un gain de temps immédiat, permanent, vous permettant de vous concentrer sur vos prestations : Votre temps est précieux, et le partage salarial vous en fera gagner par rapport à la gestion d&apos;une entreprise en vous permettant de vous concentrer sur votre mission. Ethical Data Security gère pour vous toute la partie administrative de votre activité :
              </p>

              {/* List of 4 Bullet Items */}
              <div className="space-y-3 pt-2">
                {AVANTAGES.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 bg-[#080d1a] border border-slate-800 rounded-2xl hover:border-cyan-500/40 transition-colors">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Block */}
            <div className="lg:col-span-6 lg:order-2">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#080d1a] p-3 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=75"
                  alt="Avantages du partage salarial"
                  className="w-full h-[350px] md:h-[430px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 rounded-2xl pointer-events-none" />
                
                {/* Floating Badge */}
                <div className="absolute bottom-6 right-6 bg-[#020617] border border-emerald-500/40 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Règlement à J+72H</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA BOTTOM CONTACT BANNER */}
      <section className="py-16 relative z-10 bg-[#030712] border-t border-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 shadow-2xl">
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Vous êtes indépendant ou consultant IT ?
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
              Découvrez comment notre solution de partage salarial peut sécuriser vos facturations et simplifier votre activité.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Demander un entretien d&apos;information</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
