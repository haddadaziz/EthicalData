'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Cpu, ShieldCheck, ArrowRight, CheckCircle, Phone, Clock, Award, ChevronRight, MessageSquare } from '@/components/icons';

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
    items: [
      { label: "Laptop", desc: "Ordinateurs portables professionnels légers et puissants." },
      { label: "Réseau : Router & Switch", desc: "Commutateurs et routeurs d'entreprise administrables." },
      { label: "NAS Stockage", desc: "Serveurs de stockage réseau sécurisés avec sauvegardes automatisées." },
      { label: "Onduleur & Protection", desc: "Alimentation sans coupure pour protéger vos serveurs." },
      { label: "Serveur", desc: "Serveurs rack et tour d'entreprise évolutifs." },
      { label: "Caméra de surveillance", desc: "Systèmes de vidéo-protection IP haute définition." },
    ]
  },
  {
    id: "cloud",
    name: "Cloud",
    badge: "Cloud & Virtualisation",
    desc: "Infrastructures cloud hybrides et solutions de sauvegarde à distance.",
    items: [
      { label: "Cloud Hybride", desc: "Combinaison optimale de vos serveurs locaux et du cloud public." },
      { label: "Sauvegarde Cloud Sécurisée", desc: "Backup automatique et chiffré hors-site." },
      { label: "Virtualisation (VMware/Hyper-V)", desc: "Consolidation et optimisation de vos ressources serveurs." },
    ]
  },
  {
    id: "security",
    name: "Security",
    badge: "Cybersécurité Hardware & Software",
    desc: "Pare-feu de nouvelle génération, antivirus centralisés et protection endpoint.",
    items: [
      { label: "Firewall Fortinet & Palo Alto", desc: "Protection périmétrique et filtrage UTM d'entreprise." },
      { label: "EDR & Antivirus Centralisé", desc: "Protection contre les ransonwares et cyberattaques." },
      { label: "VPN Sécurisé", desc: "Accès à distance chiffré pour vos collaborateurs en télétravail." },
    ]
  },
  {
    id: "dolibarr",
    name: "Dolibarr ERP/CRM",
    badge: "Gestion d'Entreprise",
    desc: "Progiciel de gestion intégré (ERP & CRM) open source adapté aux PME.",
    items: [
      { label: "Gestion Commerciale & Devis", desc: "Facturation, devis et suivi des commandes clients." },
      { label: "Gestion de Stock & Achats", desc: "Inventaire en temps réel et commandes fournisseurs." },
      { label: "Module Comptabilité", desc: "Export comptable et suivi de trésorerie." },
    ]
  },
  {
    id: "odoo",
    name: "Odoo",
    badge: "Suite ERP Intégrée",
    desc: "Plateforme complète d'applications d'entreprise interconnectées.",
    items: [
      { label: "Odoo CRM & Ventes", desc: "Gestion des pipelines de vente et relation client." },
      { label: "Odoo Projets & Tâches", desc: "Suivi du temps, kanban et planification de projets." },
      { label: "Odoo Ressources Humaines", desc: "Congés, notes de frais et gestion du personnel." },
    ]
  },
];

export default function SolutionITPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeCategory, setActiveCategory] = useState("microsoft");

  const currentCat = CATALOGUE_CATEGORIES.find(c => c.id === activeCategory) || CATALOGUE_CATEGORIES[0];

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

      {/* SECTION CATALOGUE RIGOUREUSEMENT SÉLECTIONNÉ */}
      <section className="py-16 md:py-24 relative z-10 bg-[#020617] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <span>Catalogue & Équipements Professionnels</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Une gamme de matériels informatiques rigoureusement sélectionnée
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Le choix du matériel informatique se fait en fonction de vos besoins et de vos missions. Nous vous garantissons des solutions clés en main et sur-mesure en choisissant les constructeurs répertoriés au meilleur prix.
            </p>
          </div>

          {/* Grille Interactive : Catégories à gauche, Produits à droite */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            
            {/* Colonne Liste des Catégories (Tabs) */}
            <div className="lg:col-span-4 space-y-2">
              {CATALOGUE_CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-cyan-500/60 text-white shadow-lg'
                        : 'bg-[#080d1a] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider">{cat.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cat.badge}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>

            {/* Colonne Détails de la Catégorie sélectionnée */}
            <div className="lg:col-span-8 bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="border-b border-slate-800 pb-4 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full">
                  {currentCat.badge}
                </span>
                <h3 className="text-2xl font-black text-white pt-2">{currentCat.name}</h3>
                <p className="text-xs text-slate-400">{currentCat.desc}</p>
              </div>

              {currentCat.simpleList ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {currentCat.simpleList.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 bg-[#030712] border border-slate-800 rounded-xl hover:border-cyan-500/40 transition-colors">
                      <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentCat.items?.map((item, i) => (
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

      {/* CTA BOTTOM CONTACT BANNER */}
      <section className="py-16 relative z-10 bg-[#020617] border-t border-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 shadow-2xl">
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Besoin d&apos;équipements IT au meilleur rapport qualité/prix ?
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
              Obtenez un devis personnalisé pour vos renouvellements de parc informatique et vos projets matériels.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Demander un devis matériel</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
