"use client";

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowRight, Layers, Sparkles, Award, Clock, ArrowUpRight, BookOpen, Check, X as XIcon, HelpCircle, Download, FileText, ChevronRight, CheckCircle2, ChevronDown, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const [isConnected, setIsConnected] = useState(false);
  
  // États pour le mini-quiz interactif (Démo Simulateur déplacé)
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const correctOptionIndex = 2; // Option C (IaaS)

  // États pour la Bento Grid (Section Piliers)
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{[key: number]: number}>({});

  // État pour la FAQ interactive
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // État pour la newsletter
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsConnected(!!token);
  }, []);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
  };

  const handleResetQuiz = () => {
    setSelectedOption(null);
  };

  // Simule le téléchargement d'une ressource
  const startDownload = (idx: number) => {
    if (downloadProgress[idx] !== undefined) return;
    
    let progress = 0;
    setDownloadProgress((prev) => ({ ...prev, [idx]: 0 }));
    
    const interval = setInterval(() => {
      progress += 10;
      setDownloadProgress((prev) => ({ ...prev, [idx]: progress }));
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 60);
  };

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitted(true);
    setNewsletterEmail("");
    setTimeout(() => setNewsletterSubmitted(false), 3000);
  };

  const faqData = [
    {
      q: "Les simulations sont-elles conformes aux examens officiels ?",
      a: "Oui. Nos questionnaires sont rédigés par des ingénieurs certifiés et suivent scrupuleusement les référentiels officiels de Microsoft et AWS. Ils simulent le format, la difficulté et la limite de temps réels de l'examen officiel."
    },
    {
      q: "Qu'est-ce que le Readiness Score et comment garantit-il ma réussite ?",
      a: "Le Readiness Score est un indicateur intelligent calculé en fonction de vos performances sur vos 3 dernières tentatives stables. Notre algorithme a démontré qu'un score de préparation supérieur à 85% assure la réussite de l'examen officiel."
    },
    {
      q: "Les cours et questions sont-ils mis à jour lors de changements de programmes ?",
      a: "Absolument. Nous surveillons en continu les programmes des certificateurs (Microsoft, AWS, CompTIA). En cas de mise à jour d'un référentiel d'examen, notre base de questions et nos fiches mémos sont adaptées sous 48 heures."
    },
    {
      q: "Puis-je réinitialiser mes tentatives pour recommencer ma préparation ?",
      a: "Oui, vous pouvez réinitialiser vos statistiques et votre progression de simulation à tout moment depuis votre tableau de bord. Cela vous permet de repartir sur un nouveau cycle d'apprentissage à blanc si nécessaire."
    },
    {
      q: "Proposez-vous un accompagnement en cas de difficultés sur un concept ?",
      a: "Oui, en plus des analyses automatiques assistées par IA pour comprendre vos erreurs, EthicalData intègre un système de prise de rendez-vous de coaching pour lever vos doutes avec des formateurs experts certifiés."
    }
  ];

  // Liste des partenaires certificateurs
  const partners = [
    { name: "Microsoft", logo: "/logos/microsoft.png" },
    { name: "PearsonVue", logo: "/logos/pearsonvue.png" },
    { name: "PECB", logo: "/logos/pecb.png" },
    { name: "Palo Alto", logo: "/logos/paloalto.png" },
    { name: "Fortinet", logo: "/logos/fortinet.png" },
    { name: "CompTIA", logo: "/logos/comptia.png" }
  ];
  const infinitePartners = [...partners, ...partners, ...partners, ...partners];

  // Liste des clients entreprises (B2B)
  const clients = [
    { name: "AXA", logo: "/logos/axa.png" },
    { name: "Heuris", logo: "/logos/heuris.png" },
    { name: "CTM", logo: "/logos/ctm.png" },
    { name: "TCS", logo: "/logos/tcs.png" },
    { name: "Zen Networks", logo: "/logos/zennetworks.png" },
    { name: "Adaptive IT", logo: "/logos/adaptiveit.png" }
  ];
  const infiniteClients = [...clients, ...clients, ...clients, ...clients];

  // Animation pour le conteneur des étapes (Stagger)
  const timelineContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.25
      }
    }
  };

  // Animation pour chaque étape individuelle
  const timelineItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. GRILLE FINE D'ARRIÈRE-PLAN */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {/* Halos d'ambiance */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* 2. BARRE DE NAVIGATION */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/60 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300">
              EthicalData
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#formations" className="hover:text-white transition-colors">Formations</a>
            <a href="#features" className="hover:text-white transition-colors">Piliers</a>
            <a href="#process" className="hover:text-white transition-colors">Méthode</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <a
                href="/admin"
                className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
              >
                <span>Tableau de bord</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <>
                <a href="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Connexion
                </a>
                <a
                  href="/login"
                  className="px-4.5 py-2 bg-white hover:bg-slate-100 text-slate-950 text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  S'inscrire
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3. SECTION HERO (Titre + Descriptif + CTA) */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16 flex flex-col items-center text-center">
        
        {/* Badge d'introduction */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-slate-400 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>La préparation moderne aux certifications de sécurité</span>
        </motion.div>

        {/* Titre Principal */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.1] md:leading-[1.05]"
        >
          Validez vos compétences. Accélérez votre{' '}
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-slate-400 animate-shimmer bg-[size:200%_auto]">
            Crédibilité
          </span>
        </motion.h1>

        {/* Paragraphe descriptif */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-400 max-w-2xl mt-8 leading-relaxed"
        >
          Une plateforme d'apprentissage intelligente combinant diagnostics précis, plans de révision assistés par IA, et simulations conformes aux examens officiels Microsoft et Cloud.
        </motion.p>

        {/* CTAs d'action */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10"
        >
          <a
            href="/login"
            className="w-full sm:w-auto px-6 py-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-white font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden cursor-pointer"
          >
            <span>Démarrer ma préparation</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="#formations"
            className="w-full sm:w-auto px-6 py-4 bg-transparent text-slate-400 hover:text-white font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 group cursor-pointer"
          >
            <span>Découvrir le catalogue</span>
            <ArrowUpRight className="w-4.5 h-4.5 group-hover:translate-y-[-1px] group-hover:translate-x-[1px] transition-transform" />
          </a>
        </motion.div>

      </main>

      {/* 4. SECTION CLIENTS ENTREPRISES (B2B Trust Band - Placé sous le Hero) */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 border-t border-slate-900/40">
        <p className="text-center text-[10px] font-black tracking-[0.25em] text-slate-500 uppercase mb-8">
          Ils nous font confiance pour leur cybersécurité & la formation de leurs équipes
        </p>
        <div className="relative w-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
          
          <motion.div 
            className="flex gap-24 whitespace-nowrap items-center"
            animate={{ x: [0, -900] }}
            transition={{
              ease: "linear",
              duration: 25,
              repeat: Infinity
            }}
          >
            {infiniteClients.map((client, cIdx) => (
              <div 
                key={cIdx} 
                className="inline-flex items-center justify-center w-44 h-16 bg-white/95 hover:bg-white border border-white/20 rounded-2xl px-5 py-3 transition-all duration-300 shrink-0 shadow-lg shadow-black/10"
              >
                <img 
                  src={client.logo} 
                  alt={client.name} 
                  className="max-h-11 max-w-[150px] object-contain block w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const textSpan = document.createElement('span');
                      textSpan.className = "fallback-text text-xs font-black tracking-[0.25em] text-slate-600 uppercase";
                      textSpan.innerText = client.name;
                      parent.appendChild(textSpan);
                    }
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. SECTION BENTO GRID INTERACTIVE (Piliers pédagogiques) */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-900/60">
        
        <div className="text-center md:text-left max-w-2xl mb-20">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Une méthodologie éprouvée</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 leading-tight">
            Conçu pour l'excellence pédagogique.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Nous combinons la rigueur des examens officiels avec la puissance d'outils d'apprentissage modernes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CARTE 1 : Plan de révision */}
          <div className="md:col-span-2 bg-slate-900/10 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 rounded-3xl p-8 flex flex-col justify-between min-h-[380px] group transition-all duration-500 relative overflow-hidden">
            <div className="space-y-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Plan de révision sur-mesure</h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Survolez les modules ci-dessous pour explorez l'arborescence de compétences générée automatiquement par notre IA pour vos lacunes.
              </p>
            </div>
            
            <div className="mt-10 relative flex flex-col sm:flex-row items-center justify-between gap-6 p-4 bg-slate-950/40 rounded-2xl border border-slate-900/80">
              
              <svg className="absolute hidden sm:block top-1/2 left-[10%] right-[10%] h-0.5 -translate-y-1/2 pointer-events-none z-0">
                <line x1="0" y1="0" x2="100%" y2="0" className="stroke-slate-900" strokeWidth="2" />
                <motion.line 
                  x1="0" y1="0" x2="100%" y2="0" 
                  className="stroke-indigo-500/40" 
                  strokeWidth="2" 
                  initial={{ strokeDasharray: "10 100", strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -200 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                />
              </svg>

              {[
                { idx: 0, label: "Sécurité & IAM", details: "Diagnostic OK • Azure AD • MFA & RBAC" },
                { idx: 1, label: "Réseau Virtuel", details: "À réviser • Subnets • NSG & Azure Firewall" },
                { idx: 2, label: "Calcul Cloud", details: "Prêt • VMs • App Services & Container Instances" }
              ].map((step, sIdx) => {
                const isHovered = activeStep === sIdx;
                return (
                  <div 
                    key={sIdx} 
                    onMouseEnter={() => setActiveStep(sIdx)}
                    onMouseLeave={() => setActiveStep(null)}
                    className="relative z-10 flex flex-col items-center text-center cursor-pointer group/node w-full sm:w-auto"
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs transition-all duration-300 ${isHovered ? 'bg-indigo-600 border-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/20' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      {sIdx + 1}
                    </div>
                    <p className="text-xs font-bold text-slate-300 mt-2.5 transition-colors group-hover/node:text-indigo-400">{step.label}</p>
                    
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute bottom-12 w-48 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl z-20 pointer-events-none text-left"
                        >
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Contenu du plan</p>
                          <p className="text-[11px] text-slate-300 mt-1 leading-snug font-medium">{step.details}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARTE 2 : Readiness Score */}
          <div className="bg-slate-900/10 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 rounded-3xl p-8 flex flex-col justify-between min-h-[380px] group transition-all duration-500 relative overflow-hidden">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Readiness Score</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Notre algorithme évalue en temps réel vos compétences clés pour vous indiquer si vous êtes prêt.
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-slate-950/40 rounded-2xl border border-slate-900 flex items-center justify-between gap-6">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="absolute w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" className="stroke-slate-900 fill-none" strokeWidth="5.5" />
                  <motion.circle 
                    cx="40" 
                    cy="40" 
                    r="34" 
                    className="stroke-indigo-500 fill-none" 
                    strokeWidth="5.5"
                    strokeDasharray={2 * Math.PI * 34}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    whileInView={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - 0.87) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center z-10">
                  <span className="text-lg font-black text-white">87%</span>
                </div>
              </div>

              <div className="flex-1 space-y-2.5">
                {[
                  { name: 'Identité & IAM', val: '90%' },
                  { name: 'Réseau Virtuel', val: '80%' },
                  { name: 'Chiffrement', val: '92%' }
                ].map((comp, cIdx) => (
                  <div key={cIdx} className="space-y-1 text-left">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-500">
                      <span>{comp.name}</span>
                      <span className="text-slate-300">{comp.val}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-indigo-500/80 h-full rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: comp.val }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2 + cIdx * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARTE 3 : Ressources */}
          <div className="bg-slate-900/10 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 rounded-3xl p-8 flex flex-col justify-between min-h-[380px] group transition-all duration-500 relative">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Ressources & Guides</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cliquez pour simuler le téléchargement de vos fiches mémo et guides de révision de sécurité.
              </p>
            </div>
            
            <div className="mt-8 space-y-2">
              {[
                { id: 0, title: "Fiche Mémo Azure AD.pdf" },
                { id: 1, title: "Architecture Hybride NSG.pdf" }
              ].map((file) => {
                const progress = downloadProgress[file.id];
                const isFinished = progress >= 100;
                const isDownloading = progress !== undefined && !isFinished;

                return (
                  <div 
                    key={file.id} 
                    onClick={() => startDownload(file.id)}
                    className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:border-slate-800 transition-colors relative overflow-hidden group/file"
                  >
                    {isDownloading && (
                      <div 
                        className="absolute inset-y-0 left-0 bg-indigo-500/5 transition-all duration-100 pointer-events-none"
                        style={{ width: `${progress}%` }}
                      />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0 z-10">
                      <FileText className={`w-4 h-4 shrink-0 ${isFinished ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className={`text-xs font-bold truncate transition-colors ${isFinished ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {file.title}
                      </span>
                    </div>

                    <div className="shrink-0 z-10">
                      {isFinished ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : isDownloading ? (
                        <span className="text-[9px] font-black text-indigo-400">{progress}%</span>
                      ) : (
                        <Download className="w-4 h-4 text-slate-500 group-hover/file:text-white transition-colors" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARTE 4 : Simulations */}
          <div className="md:col-span-2 bg-slate-900/10 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 rounded-3xl p-8 flex flex-col md:flex-row items-stretch gap-8 min-h-[380px] group transition-all duration-500 relative overflow-hidden">
            
            <div className="flex-1 flex flex-col justify-between items-start space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Simulations conformes aux examens</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  Entraînez-vous dans les conditions réelles des examens de certification officiels. Maîtrisez le temps imparti et le format des questions.
                </p>
              </div>

              <a 
                href="/login" 
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs font-bold text-white rounded-xl transition-all cursor-pointer group/btn mt-4"
              >
                <span>Parcourir le catalogue</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="flex-1 bg-slate-950/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Durée</span>
                  </div>
                  <p className="text-xs font-bold text-slate-350 pl-6">45 à 180 minutes</p>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Layers className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Questions</span>
                  </div>
                  <p className="text-xs font-bold text-slate-350 pl-6">36 à 65 QCM</p>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Format</span>
                  </div>
                  <p className="text-xs font-bold text-slate-350 pl-6">Scénarios réels</p>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Correction</span>
                  </div>
                  <p className="text-xs font-bold text-slate-350 pl-6">IA Assistée</p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. SECTION DEMO SIMULATEUR (Mini-Quiz Déplacé Ici) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-900/60 flex flex-col items-center">
        
        <div className="text-center max-w-2xl mb-12">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Démonstration Live</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight">
            Testez notre simulateur d'examen
          </h2>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            Répondez à la question interactive ci-dessous et découvrez la correction assistée par IA d'EthicalData.
          </p>
        </div>

        {/* MINI-QUIZ INTERACTIF */}
        <div className="w-full max-w-2xl text-left bg-slate-900/30 backdrop-blur-md border border-slate-900 rounded-3xl p-6 md:p-8 hover:border-slate-800 transition-colors duration-300 relative group">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-900">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              Mode Entraînement — Azure AZ-900
            </span>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question 01</p>
            <h3 className="text-base md:text-lg font-extrabold text-white mt-1.5 leading-snug">
              Quelle catégorie de service cloud décrit au mieux les Machines Virtuelles (VM) sur Microsoft Azure ?
            </h3>
          </div>

          <div className="mt-6 space-y-3">
            {[
              { letter: 'A', text: 'SaaS (Software as a Service)' },
              { letter: 'B', text: 'PaaS (Platform as a Service)' },
              { letter: 'C', text: 'IaaS (Infrastructure as a Service)' }
            ].map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === correctOptionIndex;
              const hasAnswered = selectedOption !== null;

              let btnStyle = "border-slate-900 bg-slate-950/30 hover:border-slate-800 text-slate-350";
              let badgeStyle = "bg-slate-900 border-slate-800 text-slate-400";
              let statusIcon = null;

              if (hasAnswered) {
                if (isCorrect) {
                  btnStyle = "border-emerald-500/30 bg-emerald-500/5 text-emerald-300";
                  badgeStyle = "bg-emerald-500/20 border-emerald-500/30 text-emerald-400";
                  statusIcon = <Check className="w-4 h-4 text-emerald-400 shrink-0" />;
                } else if (isSelected) {
                  btnStyle = "border-rose-500/30 bg-rose-500/5 text-rose-300";
                  badgeStyle = "bg-rose-500/20 border-rose-500/30 text-rose-450";
                  statusIcon = <XIcon className="w-4 h-4 text-rose-400 shrink-0" />;
                } else {
                  btnStyle = "border-slate-900 bg-slate-950/10 text-slate-600 opacity-60";
                  badgeStyle = "bg-slate-950 border-slate-900 text-slate-600";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={hasAnswered}
                  className={`w-full flex items-center justify-between p-4 border rounded-2xl text-sm font-semibold transition-all duration-200 outline-none text-left ${btnStyle} ${!hasAnswered ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-black ${badgeStyle}`}>
                      {option.letter}
                    </span>
                    <span>{option.text}</span>
                  </div>
                  {statusIcon}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedOption !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-slate-900 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">Analyse Pédagogique de l'IA</span>
                  </div>
                  <button
                    onClick={handleResetQuiz}
                    className="text-xs text-slate-500 hover:text-white transition-colors cursor-pointer font-bold"
                  >
                    Recommencer
                  </button>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl text-xs text-slate-400 leading-relaxed space-y-3">
                  <p>
                    {selectedOption === correctOptionIndex ? (
                      <span className="font-extrabold text-emerald-400 block mb-1">Excellent choix !</span>
                    ) : (
                      <span className="font-extrabold text-rose-450 block mb-1">Incorrect.</span>
                    )}
                    Les Machines Virtuelles (VM) appartiennent à la catégorie **IaaS (Infrastructure as a Service)**. Microsoft Azure met à disposition le matériel physique, la connectivité réseau et la couche de virtualisation (hyperviseur).
                  </p>
                  <p>
                    En tant qu'utilisateur, vous gardez le contrôle total du système d'exploitation (mises à jour, sécurité), de la configuration réseau interne, ainsi que de tous les middlewares et applications installés.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* 7. SECTION APERÇU DU CATALOGUE (Certifications) */}
      <section id="formations" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-900/60">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Formations & Préparations</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 leading-tight">
            Propulsez votre carrière avec nos programmes phares.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Sélectionnez votre parcours, entraînez-vous sur nos simulateurs et décrochez votre certification internationale du premier coup.
          </p>
        </div>

        {/* 7a. CAROUSEL DYNAMIQUE DES PARTENAIRES CERTIFICATEURS */}
        <div className="relative w-full overflow-hidden py-8 mb-20 bg-slate-950/20 border-y border-slate-900/50">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
          
          <motion.div 
            className="flex gap-24 whitespace-nowrap items-center"
            animate={{ x: [0, -900] }}
            transition={{
              ease: "linear",
              duration: 25,
              repeat: Infinity
            }}
          >
            {infinitePartners.map((partner, pIdx) => (
              <div 
                key={pIdx} 
                className="inline-flex items-center justify-center w-44 h-16 bg-white/95 hover:bg-white border border-white/20 rounded-2xl px-5 py-3 transition-all duration-300 shrink-0 shadow-lg shadow-black/10"
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="max-h-11 max-w-[150px] object-contain block w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const textSpan = document.createElement('span');
                      textSpan.className = "fallback-text text-xs font-black tracking-[0.25em] text-slate-600 uppercase";
                      textSpan.innerText = partner.name;
                      parent.appendChild(textSpan);
                    }
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {[
            {
              title: "Microsoft Azure Fundamentals",
              code: "AZ-900",
              provider: "Microsoft",
              duration: "15 heures",
              successRate: "98%",
              level: "Débutant",
              desc: "Maîtrisez les concepts fondamentaux de Microsoft Azure. Comprenez les services cloud globaux, les mécanismes de sécurité, la conformité et les coûts d'infrastructure.",
              glowClass: "hover:border-indigo-500/20 hover:shadow-indigo-500/5",
              leftStripeColor: "bg-indigo-500",
              btnHoverClass: "hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30",
              badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
            },
            {
              title: "AWS Certified Cloud Practitioner",
              code: "CLF-C02",
              provider: "Amazon Web Services",
              duration: "18 heures",
              successRate: "97%",
              level: "Débutant",
              desc: "Acquérez une vision globale de l'écosystème AWS. Apprenez les bases de l'infrastructure mondiale, la sécurité globale, les modèles tarifaires et de support.",
              glowClass: "hover:border-amber-500/20 hover:shadow-amber-500/5",
              leftStripeColor: "bg-amber-500",
              btnHoverClass: "hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30",
              badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20"
            },
            {
              title: "CompTIA Security+",
              code: "SY0-701",
              provider: "CompTIA",
              duration: "25 heures",
              successRate: "95%",
              level: "Intermédiaire",
              desc: "Développez les bases requises pour entamer une carrière en cybersécurité. Apprenez la détection de menaces, le chiffrement fort et la gestion globale des risques.",
              glowClass: "hover:border-emerald-500/20 hover:shadow-emerald-500/5",
              leftStripeColor: "bg-emerald-500",
              btnHoverClass: "hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30",
              badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            }
          ].map((course, idx) => (
            <div 
              key={idx}
              className={`bg-slate-900/10 backdrop-blur-xl bg-gradient-to-br from-slate-900/40 to-slate-950/20 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between min-h-[420px] transition-all duration-500 group relative overflow-hidden hover:bg-slate-900/20 ${course.glowClass}`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-300 group-hover:w-1 ${course.leftStripeColor}`} />

              <div className="space-y-4">
                <div className="flex items-center justify-between pl-1">
                  <span className="text-[9px] px-2 py-0.5 bg-slate-950 border border-slate-900 text-slate-400 rounded-full font-bold uppercase">
                    {course.provider}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 bg-slate-900 text-slate-400 rounded-full font-bold">
                    {course.level}
                  </span>
                </div>

                <div className="space-y-1.5 text-left pl-1">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${course.badgeColor}`}>
                    {course.code}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-snug pt-1">
                    {course.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 text-left leading-relaxed pl-1">
                  {course.desc}
                </p>
              </div>

              <div className="space-y-4 mt-6 pl-1">
                <div className="grid grid-cols-2 gap-2 border-y border-slate-900 py-4 text-left">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold block">Durée</span>
                    <span className="text-xs font-bold text-slate-350">{course.duration}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold block">Taux de réussite</span>
                    <span className="text-xs font-bold text-emerald-450">{course.successRate} de réussite</span>
                  </div>
                </div>

                <a 
                  href="/login" 
                  className={`w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-900 text-xs font-bold text-slate-400 rounded-xl transition-all cursor-pointer group/btn-course ${course.btnHoverClass}`}
                >
                  <span>Démarrer ce parcours</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn-course:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* 8. SECTION COMMENT CA MARCHE / TIMELINE INTERACTIVE */}
      <section id="process" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-900/60">
        
        {/* En-tête de section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Le Parcours de Réussite</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 leading-tight">
            Préparez, mesurez et réussissez en 3 étapes.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Notre plateforme vous accompagne de l'évaluation de votre niveau jusqu'à l'obtention de votre certification officielle.
          </p>
        </div>

        {/* Chronologie */}
        <div className="relative">
          
          <div className="absolute hidden md:block top-7 left-[15%] right-[15%] h-[1px] bg-slate-900/40 z-0">
            <motion.div 
              className="h-full bg-indigo-500/40 animate-pulse" 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </div>

          <motion.div 
            variants={timelineContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
          >
            {[
              {
                step: "01",
                title: "Évaluez vos lacunes",
                desc: "Passez un premier test de diagnostic rapide assisté par IA pour identifier précisément les concepts théoriques et pratiques à consolider."
              },
              {
                step: "02",
                title: "Entraînez-vous",
                desc: "Accédez à des questionnaires dynamiques avec explications instantanées de l'IA et téléchargez nos fiches mémo pour réviser à votre rythme."
              },
              {
                step: "03",
                title: "Obtenez le feu vert",
                desc: "Dès que votre Readiness Score dépasse 85%, vous êtes prêt à 100%. Inscrivez-vous sereinement à l'examen officiel."
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                variants={timelineItemVariants}
                className="relative z-10 flex flex-col items-center text-center space-y-4 group"
              >
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center font-black text-base shadow-lg transition-all duration-300 group-hover:border-indigo-500/30 group-hover:shadow-indigo-500/5 group-hover:scale-105"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="text-lg font-bold text-white pt-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* 9. SECTION FAQ ACCORDÉON INTERACTIF */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t border-slate-900/60">
        
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Questions Fréquentes</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight">
            Des réponses claires à vos questions.
          </h2>
        </div>

        <div className="space-y-4">
          {faqData.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-slate-900/10 backdrop-blur-md border border-slate-900 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-800"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-sm md:text-base text-white outline-none cursor-pointer"
                >
                  <span>{item.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-slate-500 shrink-0 ml-4"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-xs md:text-sm text-slate-400 leading-relaxed border-t border-slate-900/60 pt-4">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </section>

      {/* 10. SECTION CTA FINAL D'INSCRIPTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-slate-900/60">
        <div className="w-full bg-gradient-to-br from-slate-900/30 to-slate-950/20 backdrop-blur-xl border border-slate-900 hover:border-slate-850 transition-all duration-500 rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden group">
          
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent -translate-y-px pointer-events-none z-0" />
          
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <span className="text-[10px] px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase tracking-wider">
              Accès Immédiat
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Prêt à franchir le cap de la certification ?
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Rejoignez les professionnels qui accélèrent leur crédibilité. Commencez à évaluer vos compétences gratuitement dès aujourd'hui.
            </p>
            
            <div className="pt-4 flex justify-center">
              <a 
                href="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Créer mon compte gratuit</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FOOTER SÉMANTIQUE & SEO */}
      <footer className="relative z-10 bg-slate-950 border-t border-slate-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Col 1 : Pitch */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                EthicalData
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              La plateforme de préparation intelligente pour valider vos compétences Cloud et Cybersécurité en toute confiance.
            </p>
          </div>

          {/* Col 2 : Catalogue */}
          <div className="text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Formations</h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-semibold">
              <li>
                <a href="#formations" className="hover:text-white transition-colors">Microsoft Azure AZ-900</a>
              </li>
              <li>
                <a href="#formations" className="hover:text-white transition-colors">AWS Cloud Practitioner</a>
              </li>
              <li>
                <a href="#formations" className="hover:text-white transition-colors">CompTIA Security+</a>
              </li>
              <li>
                <a href="#formations" className="hover:text-white transition-colors">Sécurité Réseau Cloud</a>
              </li>
            </ul>
          </div>

          {/* Col 3 : Légal */}
          <div className="text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Légal & Contact</h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-semibold">
              <li>
                <a href="/login" className="hover:text-white transition-colors">Mentions Légales</a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-colors">Politique de Confidentialité</a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-colors">Conditions Générales (CGU)</a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-colors">Contacter le support</a>
              </li>
            </ul>
          </div>

          {/* Col 4 : Newsletter */}
          <div className="text-left space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Lettre d'Information</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Recevez nos conseils de sécurité et alertes de mise à jour des examens.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input 
                type="email" 
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Votre e-mail" 
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button 
                type="submit" 
                className="w-10 h-10 bg-white hover:bg-slate-100 text-slate-950 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            
            <AnimatePresence>
              {newsletterSubmitted && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-emerald-455 font-bold"
                >
                  Inscription validée avec succès !
                </motion.p>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Sub-footer copyright */}
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-900/60 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-600 font-semibold gap-4">
          <p>© {new Date().getFullYear()} EthicalData. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <a href="/login" className="hover:text-slate-400 transition-colors">Politique RGPD</a>
            <a href="/login" className="hover:text-slate-400 transition-colors">Gestion des Cookies</a>
          </div>
        </div>
      </footer>

    </div>
  );
}