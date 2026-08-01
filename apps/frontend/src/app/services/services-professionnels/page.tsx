'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, ArrowRight, CheckCircle, Briefcase, Award, Cpu } from '@/components/icons';

const SERVICES_PROFESSIONNELS_BLOCKS = [
  {
    number: "01",
    title: "Garantir performance et sécurité",
    badge: "Notre Mission",
    desc: "Dans un monde numérique en constante évolution, nous accompagnons nos clients dans la mise en place et la maintenance de systèmes informatiques performants et sécurisés.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=75",
    imageRight: false,
  },
  {
    number: "02",
    title: "Une réponse aux défis technologiques",
    badge: "Défis IT",
    desc: "Face à des exigences toujours plus fortes en matière de sécurité et de performance, notre offre de services professionnels vous aide à concevoir, déployer et optimiser votre infrastructure IT.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=75",
    imageRight: true,
  },
  {
    number: "03",
    title: "Un accompagnement sur mesure",
    badge: "Accompagnement Sur-Mesure",
    desc: "Nos consultants experts en cybersécurité et infrastructure vous soutiennent à chaque étape de vos projets IT, en prenant en charge des missions clés telles que :",
    bullets: [
      "Design et architecture",
      "Déploiement",
      "Maintenance et support",
      "Audit de sécurité et de configuration",
      "Rédaction des cahiers des charges",
      "Assistance à maîtrise d'œuvre et d'ouvrage (AMOA/AMOE)"
    ],
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=800&q=75",
    imageRight: false,
  },
];

export default function ServicesProfessionnelsPage() {
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
              Services Professionnels
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Conseil, audit, architecture et assistance à maîtrise d&apos;ouvrage assurés par nos consultants et ingénieurs séniors certifiés.
          </p>
        </div>
      </section>

      {/* 3 ALTERNATING BLOCKS (01, 02, 03) */}
      <section className="py-16 md:py-24 relative z-10 bg-[#020617] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-20">
          {SERVICES_PROFESSIONNELS_BLOCKS.map((block) => (
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

                <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
                  {block.desc}
                </p>

                {/* Bullet List for Block 03 */}
                {block.bullets && (
                  <ul className="space-y-2.5 pt-2 text-xs md:text-sm text-slate-200 font-medium">
                    {block.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
