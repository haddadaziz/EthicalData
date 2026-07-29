'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Target, Users, Award, Building, MapPin, Phone, Mail, ArrowRight, CheckCircle } from '@/components/icons';
import { CounterNumber } from '@/components/ui/counter-number';

const STATS = [
  { label: "Projets réalisés", value: 254, suffix: "+" },
  { label: "Formations dispensées", value: 569, suffix: "+" },
  { label: "Certificats délivrés", value: 2000, suffix: "+" },
  { label: "Missions Pentest", value: 100, suffix: "+" },
];

const PARTNERS = [
  { name: 'Pearson VUE', logo: '/logos/pearsonvue.png' },
  { name: 'PECB', logo: '/logos/pecb.png' },
  { name: 'Palo Alto', logo: '/logos/paloalto.png' },
  { name: 'Fortinet', logo: '/logos/fortinet.png' },
  { name: 'CompTIA', logo: '/logos/comptia.png' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#020617] text-center">
        {/* Lightweight Radial Glow */}
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
            <span>DÉCENNIE D&apos;EXCELLENCE IT & CYBERSÉCURITÉ</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              À Propos d&apos;Ethical Data Security
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Une expertise reconnue, des professionnels certifiés et plus de 10 ans d&apos;engagement dans la sécurisation des systèmes d&apos;information et la formation technologique de pointe.
          </p>
        </div>
      </section>

      {/* CHIFFRES CLÉS ANIMÉS */}
      <section className="py-16 relative z-10 bg-[#030712] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-2 shadow-xl">
                <p className="text-3xl sm:text-5xl font-black text-cyan-400">
                  <CounterNumber value={stat.value} />
                  <span>{stat.suffix}</span>
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRÉSENTATION & EXPERTISE */}
      <section className="py-16 md:py-24 relative z-10 bg-[#020617] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-cyan-400 text-xs font-black uppercase tracking-wider">
                <span>Qui Sommes-Nous</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Une décennie d&apos;excellence et d&apos;expertise cybersécurité
              </h2>

              <div className="space-y-4 text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-normal">
                <p>
                  <strong className="text-white">Ethical Data Security (EDS)</strong> est une entreprise marocaine de référence spécialisée dans l&apos;infogérance, l&apos;intégration de systèmes, les services professionnels et la formation certifiante en cybersécurité et infrastructures IT.
                </p>
                <p>
                  Forts de plus de 10 ans d&apos;expérience, nos consultants et auditeurs certifiés accompagnent les grandes entreprises, PME et institutions publiques dans la protection et la modernisation de leur environnement numérique.
                </p>
                <p>
                  Dynamisme, réactivité et innovation sont au cœur de nos engagements pour garantir la continuité, la performance et la résilience de vos systèmes.
                </p>
              </div>
            </div>

            {/* Carte Visuelle Partenaires & Certifications */}
            <div className="lg:col-span-6 bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl text-left">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full">
                  Centre Certifié
                </span>
                <h3 className="text-xl font-black text-white pt-2">Partenaires Certifiants Officiels</h3>
                <p className="text-xs text-slate-400">Examens et cursus agréés par les leaders mondiaux du secteur IT.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {PARTNERS.map((p, idx) => (
                  <div key={idx} className="p-4 bg-[#030712] border border-slate-800 rounded-2xl flex items-center justify-center h-20">
                    <img src={p.logo} alt={p.name} className="max-h-10 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* COORDONNÉES & BANNIÈRE NOUVELLE ADRESSE SOON */}
      <section className="py-16 md:py-24 relative z-10 bg-[#030712] border-t border-slate-900 text-left">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <span>Localisation & Contact</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Nos Coordonnées
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Carte Adresse Actuelle + Annonce Nouvelle Adresse Soon */}
            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Siège Social Actuel</h3>
                  <p className="text-sm font-bold text-cyan-400 mt-1">Bureau 305, Technopark Casablanca, Maroc</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Venez nous rencontrer au cœur de l&apos;écosystème technologique pour discuter de vos projets IT et cybersécurité.
                </p>
              </div>

              {/* BANNIÈRE ANNONCE NOUVELLE ADRESSE SOON */}
              <div className="p-4 bg-gradient-to-r from-blue-950/80 via-[#0b1329] to-cyan-950/80 border border-cyan-500/40 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-wider">
                  <Building className="w-4 h-4" />
                  <span>📍 Prochainement / Ouverture Nouveaux Locaux</span>
                </div>
                <p className="text-xs font-bold text-white">
                  Nouvelle adresse Soon ! <span className="text-slate-400 font-normal">Restez connectés pour l&apos;inauguration de notre nouveau siège social.</span>
                </p>
              </div>
            </div>

            {/* Carte Informations de Contact Direct */}
            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Nous Contacter</h3>
                  <p className="text-xs text-slate-400 mt-1">Notre équipe d&apos;experts répond à toutes vos questions.</p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-3 p-3 bg-[#030712] rounded-xl border border-slate-800">
                    <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>contact@ethicaldatasecurity.ma</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#030712] rounded-xl border border-slate-800">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>+212 664 244 343 // +212 520 572 631</span>
                  </div>
                </div>
              </div>

              <Link
                href="/contact"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Envoyer un message</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
