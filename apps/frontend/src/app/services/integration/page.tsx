'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Cpu, ArrowRight, CheckCircle, Phone, Layers, ShieldCheck, Activity } from '@/components/icons';

const INTEGRATION_BLOCKS = [
  {
    number: "01",
    title: "Notre expertise en intégration",
    badge: "Expertise IT",
    desc: "L'intégration est au cœur de notre métier. Nos experts vous accompagnent tout au long de votre projet pour assurer une mise en place optimale et une interopérabilité fluide de votre système d'information.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=75",
    imageRight: false,
  },
  {
    number: "02",
    title: "Une prise en charge complète",
    badge: "Clé en main",
    desc: "Grâce à notre service d'intégration informatique, nous vous accompagnons de la conception à la mise en service de vos infrastructures. Nous garantissons une intégration efficace et évolutive, alignée sur vos besoins métier.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=75",
    imageRight: true,
  },
  {
    number: "03",
    title: "Installation et optimisation",
    badge: "Performance & Sécurité",
    desc: "Nous prenons en charge l'installation et l'exploitation des équipements et logiciels clés de votre système (serveurs, réseaux, firewalls, applications...). Notre valeur ajoutée ? Une optimisation poussée pour garantir un fonctionnement fluide et sécurisé de l'ensemble de votre architecture IT.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=75",
    imageRight: false,
  },
  {
    number: "04",
    title: "Un accompagnement sur mesure",
    badge: "Sur-Mesure",
    desc: "Maximiser la productivité et l'efficacité de votre entreprise grâce à une infrastructure IT optimale et sécurisée.\n\nQuel que soit votre secteur d'activité et votre domaine, nous vous proposons un accompagnement complet et personnalisé. Nos compétences, autant en réseau, sécurité, virtualisation et cloud computing vous garantissent une infrastructure fiable et performante.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=75",
    imageRight: true,
  },
];

export default function IntegrationPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#020617] text-center">
        {/* Lightweight Radial Gradient Background Glow */}
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
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              Intégration
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Des solutions intégrées et harmonieuses pour une infrastructure IT performante, hautement disponible et sécurisée.
          </p>
        </div>
      </section>

      {/* INTRO TITLE BANNER */}
      <section className="py-16 relative z-10 bg-[#030712] border-t border-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Intégration IT – Optimisez votre infrastructure avec Ethical Data Security
          </h2>
          
          <p className="text-cyan-400 text-sm md:text-base font-bold uppercase tracking-wider">
            Des solutions intégrées pour une infrastructure performante et sécurisée.
          </p>

          {/* Badges Piliers */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {[
              "notre expertise en intégration",
              "une prise en charge complète",
              "installation et optimisation",
              "un accompagnement sur mesure"
            ].map((badge, idx) => (
              <span key={idx} className="px-4 py-2 rounded-xl bg-[#080d1a] border border-slate-800 text-xs font-extrabold uppercase tracking-wider text-slate-300">
                • {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4 ALTERNATING BLOCKS (01, 02, 03, 04) */}
      <section className="py-16 md:py-24 relative z-10 bg-[#020617] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-20">
          {INTEGRATION_BLOCKS.map((block) => (
            <div
              key={block.number}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                block.imageRight ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image Block */}
              <div className={`lg:col-span-6 ${block.imageRight ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#080d1a] p-3 shadow-2xl group">
                  <img
                    src={block.image}
                    alt={block.title}
                    className="w-full h-[320px] md:h-[400px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 rounded-2xl pointer-events-none" />
                  
                  {/* Big Number Badge */}
                  <div className="absolute top-6 left-6 bg-[#020617] border border-cyan-500/40 px-5 py-2.5 rounded-2xl shadow-xl">
                    <span className="text-3xl font-black text-cyan-400 tracking-wider">{block.number}</span>
                  </div>
                </div>
              </div>

              {/* Text Block */}
              <div className={`lg:col-span-6 space-y-5 text-left ${block.imageRight ? 'lg:order-1' : 'lg:order-2'}`}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-cyan-400 text-xs font-black uppercase tracking-wider">
                  <span>{block.badge}</span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {block.title}
                </h3>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal whitespace-pre-line">
                  {block.desc}
                </p>

                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    <span>Discuter de votre projet d&apos;intégration</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BOTTOM CONTACT BANNER */}
      <section className="py-16 relative z-10 bg-[#030712] border-t border-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 shadow-2xl">
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Prêt à intégrer des solutions IT performantes ?
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
              Nos ingénieurs et architectes vous accompagnent de l&apos;audit à l&apos;intégration complète de vos systèmes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Prendre contact avec un intégrateur</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
