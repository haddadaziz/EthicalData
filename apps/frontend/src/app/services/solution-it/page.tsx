'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SolutionITDevisFormSection } from '@/components/landing/SolutionITDevisFormSection';
import { Cpu, ArrowRight, CheckCircle, Phone, Clock, Award, ChevronDown, MessageSquare } from '@/components/icons';

const STEPS = [
  {
    step: 1,
    title: "Préparation",
    desc: "À la réception de votre équipement, nous procédons à sa configuration en fonction de vos besoins et de votre organisation.",
    icon: Cpu,
  },
  {
    step: 2,
    title: "Mise en service",
    desc: "Une fois configuré, l'équipement est installé sur site avec des logiciels requis et vos données transférées.",
    icon: CheckCircle,
  },
  {
    step: 3,
    title: "Formation et transfert des compétences",
    desc: "Nous formons les utilisateurs pour assurer une prise en main efficace et optimale du matériel.",
    icon: Award,
  },
];

const CATALOGUE_CATEGORIES = [
  {
    id: "microsoft",
    name: "Microsoft",
    badge: "Licences & Solutions",
    desc: "Solutions et licences officielles Microsoft pour entreprises.",
    simpleList: [
      "Microsoft Dynamics 365",
      "Microsoft 365",
      "Azure",
      "Windows",
      "SQL Server",
      "HYPER V",
      "PowerBI"
    ]
  },
  {
    id: "hardware",
    name: "Hardware",
    badge: "Matériel Informatique",
    desc: "Équipements réseaux, serveurs et postes de travail professionnels haute performance.",
    simpleList: [
      "Laptop",
      "Réseau: Router & Switch",
      "BAEI Stockage",
      "Racks & Enduleur",
      "Server",
      "Caméra de surveillance"
    ]
  },
  {
    id: "cloud",
    name: "Cloud",
    badge: "Cloud & Virtualisation",
    desc: "Infrastructures cloud privé, public et solutions hyperconvergées.",
    simpleList: [
      "Cloud privé : VSPHERE / KVM / OPENSHIFT ...",
      "Cloud Management / vRealize Cloud Management",
      "Hyperconverged / vSphere / vSAN / NSX Data Center",
      "Disaster Recovery (SRM, Veeam, VDP...)",
      "Cloud Public : AWS / AZURE / GCP / IBM"
    ]
  },
  {
    id: "security",
    name: "Security",
    badge: "Cybersécurité Hardware & Software",
    desc: "Pare-feu de nouvelle génération, antivirus centralisés et protection endpoint.",
    simpleList: [
      "F5",
      "Fortinet",
      "Palo Alto",
      "Sophos",
      "Check Point"
    ]
  },
  {
    id: "dolibarr",
    name: "Dolibarr ERP/CRM",
    badge: "ERP & CRM Open Source",
    desc: "Progiciel de gestion intégré (ERP & CRM) open source dédié aux entreprises.",
    detailedText: "ERP/CRM open source : Dolibarr est un logiciel gratuit dédié à la gestion commerciale de votre société. Intègre ERP et CRM dans un seul logiciel... Développé et distribué sous licence libre aux petites et moyennes entreprises, les indépendants, auto-entrepreneurs, ou les associations. Dolibarr est un logiciel open source, disponible sur toutes les plateformes web (Windows, MAC, Linux, Aix...) et fonctionne grâce à des technologies telles que PHP, MySQL et des serveurs web HTTP."
  },
  {
    id: "odoo",
    name: "Odoo",
    badge: "Suite ERP Intégrée",
    desc: "Plateforme complète d'applications d'entreprise interconnectées.",
    detailedText: "ERP/CRM open source : Vous souhaitez gérer votre activité à chaque étape de votre chaîne commerciale : les ventes, les achats, les stocks, la fabrication, les Prestations de services ? Découvrez l'ERP/CRM gratuit le plus efficace et le plus flexible du marché.\n\nL'ERP Odoo est un outil polyvalent pour la gestion d'entreprise, permet de centraliser vos données et informations importantes. Comme Dolibarr, Odoo est un logiciel open source qui fournit un riche ensemble de modules pouvant être appliqués aux entreprises de tous types et de toutes tailles."
  },
];

export default function SolutionITPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [openCategoryIndex, setOpenCategoryIndex] = useState<number | null>(0);

  const toggleCategory = (idx: number) => {
    setOpenCategoryIndex(prev => (prev === idx ? null : idx));
  };

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
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              Solution IT
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Ethical Data Security met la technologie au service des entreprises en proposant du matériel informatique au meilleur rapport qualité/prix. Nous accompagnons nos clients dans leur transformation numérique avec des solutions spécialisées adaptées à tous les environnements.
          </p>

          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Demander un devis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION INTERACTIVE STEPPER (Étape 1, Étape 2, Étape 3) */}
      <section className="py-16 md:py-24 relative z-10 bg-[#030712] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <span>Notre Processus de Déploiement</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Solution IT en 3 Étapes
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Ethical Data Security vous accompagne avec des solutions technologiques fiables et économiques pour booster votre transformation numérique.
            </p>
          </div>

          {/* Stepper Interactive Tabs */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-3 p-1.5 bg-[#080d1a] border border-slate-800 rounded-2xl">
              {STEPS.map((s, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={s.step}
                    onClick={() => setActiveStep(idx)}
                    className={`py-3 px-4 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      isActive ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {s.step}
                    </span>
                    <span className="hidden sm:inline">Étape {s.step}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Content Card */}
            <div className="mt-8 bg-[#080d1a] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      {React.createElement(STEPS[activeStep].icon, { className: "w-7 h-7" })}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
                        Étape 0{STEPS[activeStep].step}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">
                        {STEPS[activeStep].title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal border-l-2 border-cyan-500 pl-5 py-1">
                    {STEPS[activeStep].desc}
                  </p>

                  <div className="pt-4 flex justify-between items-center border-t border-slate-800/80">
                    <button
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      ← Étape précédente
                    </button>
                    <button
                      disabled={activeStep === STEPS.length - 1}
                      onClick={() => setActiveStep(prev => Math.min(STEPS.length - 1, prev + 1))}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                    >
                      Étape suivante →
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION CATALOGUE ACCORDÉON (STYLE FAQ - 100% RESPONSIVE) */}
      <section className="py-16 md:py-24 relative z-10 bg-[#020617] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
                Une gamme de matériels informatiques rigoureusement sélectionnée
              </span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Le choix du matériel informatique se fait en fonction de vos besoins et de vos missions. Nous vous garantissons des solutions clés en main et sur-mesure en choisissant les constructeurs répertoriés au meilleur prix.
            </p>
          </div>

          {/* ACCORDÉON STYLE FAQ (UN SEUL OUVERT À LA FOIS) */}
          <div className="max-w-4xl mx-auto space-y-4 text-left">
            {CATALOGUE_CATEGORIES.map((cat, idx) => {
              const isOpen = openCategoryIndex === idx;
              return (
                <div
                  key={cat.id}
                  className={`border rounded-3xl overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? 'bg-[#080d1a] border-cyan-500/50 shadow-2xl'
                      : 'bg-[#080d1a]/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Accordion Header Button */}
                  <button
                    onClick={() => toggleCategory(idx)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer text-left focus:outline-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full w-max">
                        {cat.badge}
                      </span>
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-white">{cat.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{cat.desc}</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-cyan-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Accordion Animated Content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 sm:p-6 pt-2 border-t border-slate-800/80 space-y-4">
                          {cat.detailedText ? (
                            <div className="p-5 bg-[#030712] border border-slate-800 rounded-2xl space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">ERP/CRM Open Source</h4>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-6 whitespace-pre-line">
                                {cat.detailedText}
                              </p>
                            </div>
                          ) : cat.simpleList ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {cat.simpleList.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3.5 bg-[#030712] border border-slate-800 rounded-xl hover:border-cyan-500/40 transition-colors">
                                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                                  <span className="text-xs font-black text-white uppercase tracking-wider">{item}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(cat as any).items?.map((item: any, i: number) => (
                                <div key={i} className="p-4 bg-[#030712] border border-slate-800/80 rounded-2xl space-y-1.5 hover:border-cyan-500/40 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">{item.label}</h5>
                                  </div>
                                  <p className="text-[11px] text-slate-400 pl-6 leading-normal">{item.desc}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 3 ENGAGEMENTS PILIERS */}
      <section className="py-16 md:py-24 relative z-10 bg-[#030712] border-t border-slate-900 text-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Paramétrage et livraison sur site</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nos techniciens pré-configurent vos matériels et assurent leur installation directement dans vos locaux.
              </p>
            </div>

            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Garantie de bon fonctionnement</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tous nos matériels bénéficient de garanties constructeurs et d'un suivi rigoureux de performance.
              </p>
            </div>

            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Service après-vente simplifié</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Un support technique dédié et réactif disponible pour répondre à toutes vos demandes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4 : FORMULAIRE DÉDIÉ DEMANDE DE DEVIS EN LIGNE (ABONNEMENTS / LICENCES) */}
      <SolutionITDevisFormSection />

      <Footer />
    </main>
  );
}
