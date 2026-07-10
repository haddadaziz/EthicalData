"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ShieldCheck, ArrowRight, Sparkles, Award, Clock, ArrowUpRight, BookOpen, Check, HelpCircle, Download, FileText, ChevronRight, CheckCircle2, ChevronDown, Send, Menu, X, Play, Star, Calendar, ChevronLeft, Users } from '@/components/icons';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { apiFetch } from '../lib/api';

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsConnected(!!(localStorage.getItem('token') || sessionStorage.getItem('token')));
  }, []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [realCertifications, setRealCertifications] = useState<any[]>([]);
  const [showAllCertifications, setShowAllCertifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 60);
      if (currentY > 60) {
        setNavVisible(currentY < lastScrollY.current);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    apiFetch('/certifications')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRealCertifications(data);
        }
      })
      .catch((err) => console.warn("Impossible de charger le catalogue public :", err));
  }, []);

  const toggleFaq = (idx: number) => setActiveFaq(activeFaq === idx ? null : idx);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitted(true);
    setNewsletterEmail("");
    setTimeout(() => setNewsletterSubmitted(false), 3000);
  };

  const partnerLogos = [
    { name: "Microsoft", path: "/logos/microsoft.png" },
    { name: "PECB", path: "/logos/pecb.png" },
    { name: "AWS", path: "/logos/aws.png" },
    { name: "Palo Alto", path: "/logos/paloalto.png" },
    { name: "Fortinet", path: "/logos/fortinet.png" },
    { name: "CompTIA", path: "/logos/comptia.png" },
    { name: "Cisco", path: "/logos/cisco.png" },
    { name: "Pearson VUE", path: "/logos/pearsonvue.png" }
  ];

  const clients = [
    { name: "AXA", logo: "/logos/axa.png" },
    { name: "Heuris", logo: "/logos/heuris.png" },
    { name: "CTM", logo: "/logos/ctm.png" },
    { name: "TCS", logo: "/logos/tcs.png" },
    { name: "Zen Networks", logo: "/logos/zennetworks.png" },
    { name: "Adaptive IT", logo: "/logos/adaptiveit.png" }
  ];

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
    }
  ];

  const courses = [
    {
      title: "Microsoft Azure Fundamentals",
      code: "AZ-900",
      provider: "Microsoft",
      successRate: "98%",
      badge: "Offre",
      badgeClass: "bg-red-600 text-white",
      logo: "/logos/microsoft.png"
    },
    {
      title: "PECB ISO 27001 Lead Implementer",
      code: "ISO-27001",
      provider: "PECB",
      successRate: "95%",
      badge: "Hot",
      badgeClass: "bg-amber-500 text-slate-900",
      logo: "/logos/pecb.png"
    },
    {
      title: "AWS Certified Cloud Practitioner",
      code: "CLF-C02",
      provider: "AWS",
      successRate: "97%",
      badge: "Nouveau",
      badgeClass: "bg-blue-600 text-white",
      logo: "/logos/aws.png"
    },
    {
      title: "Palo Alto Networks Certified Network Security",
      code: "PCNSA",
      provider: "Palo Alto Networks",
      successRate: "96%",
      badge: "Plus Vendu",
      badgeClass: "bg-emerald-600 text-white",
      logo: "/logos/paloalto.png"
    }
  ];

  const testimonials = [
    {
      name: "Yassine M.",
      role: "Ingénieur Cloud & SecOps",
      text: "Grâce aux simulations d'Ethical Data, j'ai obtenu ma certification AZ-900 avec un score de 940/1000 dès ma première tentative. Le simulateur est incroyablement fidèle à l'examen officiel !",
      stars: 5
    },
    {
      name: "Sanaa K.",
      role: "Responsable Conformité GRC",
      text: "La préparation PECB ISO 27001 est très bien structurée. Les fiches mémos synthétisent parfaitement les concepts complexes et la grille d'évaluation IA m'a énormément aidée.",
      stars: 5
    },
    {
      name: "Karim T.",
      role: "Administrateur Réseaux & Sécurité",
      text: "Le Technopark de Casablanca accueille un centre d'excellence. La formation Palo Alto PCNSA est de haute qualité avec des cas pratiques réalistes. Recommandé à 100%.",
      stars: 5
    }
  ];

  const services = [
    { title: "Services IT", desc: "Nous vous accompagnons dans la mise en place, l'évolution et la sécurisation de votre infrastructure IT. Notre objectif est de garantir à votre entreprise performance, fiabilité et continuité, tout en assurant un haut niveau de disponibilité et de sécurité pour vos systèmes." },
    { title: "Certification", desc: "Boostez votre carrière grâce à nos certifications professionnelles reconnues. Elles vous permettent de valider vos compétences, d'accroître votre crédibilité sur le marché de l'emploi et de répondre aux exigences actuelles des entreprises en matière de qualité et d'expertise métier." },
    { title: "Formation", desc: "Nous proposons des formations spécialisées en IT et autres domaines clés. Adaptées aux professionnels et particuliers, elles visent à développer vos compétences, vous tenir à jour avec les nouvelles technologies, et répondre concrètement à vos objectifs de carrière ou d'entreprise." },
    { title: "Infogérance", desc: "Confiez-nous la gestion de votre système d'information. Nous assurons la maintenance, la supervision, la sécurité et le bon fonctionnement de vos infrastructures IT, sur site ou à distance, pour vous permettre de rester concentré sur votre cœur de métier, en toute sérénité." },
    { title: "Intégration", desc: "Nous vous aidons à intégrer des solutions technologiques sur mesure, compatibles avec votre environnement IT. Notre expertise vous permet de réussir votre transformation digitale en assurant la cohérence, la performance et l'optimisation de l'ensemble de votre système d'information." },
    { title: "Services professionnels", desc: "Nos experts interviennent pour des missions de conseil, d'audit et de déploiement IT. Grâce à une approche sur mesure, nous vous apportons un accompagnement stratégique et opérationnel pour relever vos défis technologiques et garantir la réussite de vos projets." }
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      
      {/* Grille fine d'arrière-plan claire */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#dc262605_0%,transparent_70%)] pointer-events-none z-0" />

      {/* ═══════════════════════════════════════════ */}
      {/* HERO SECTION (header + hero content)       */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        
        {/* Background image - hero section only */}
        <div className="absolute inset-0">
          <img src="/landing_page_logo_ethicaldata.jpeg" alt=""
            className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/70" />
        </div>

        {/* HEADER & NAV - inside hero, fixed */}
        <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm' : 'bg-transparent border-b border-transparent'} ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Logo Brand avec triangle officiel */}
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img src="/ethicaldata_main_logo.png" alt="Ethical Data Security" className="h-9 w-auto object-contain" />
            </div>
          </Link>

            {/* Navigation PC : Capsule Pill Flottante Ultra Stylée */}
            <nav className={`hidden md:flex items-center gap-1 rounded-full px-3 py-1.5 shadow-sm transition-all duration-300 ${scrolled ? 'bg-slate-950/[0.04] border border-slate-200/80 backdrop-blur-xl' : 'bg-transparent border-0'}`}>
              <a href="#about" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 hover:shadow-xs ${scrolled ? 'text-slate-600 hover:text-red-600 hover:bg-white' : 'text-white/90 hover:text-white'}`}>
                Qui Sommes-Nous
              </a>
              <Link href="/certifications" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 hover:shadow-xs ${scrolled ? 'text-slate-600 hover:text-red-600 hover:bg-white' : 'text-white/90 hover:text-white'}`}>
                Certifications
              </Link>
              <a href="#services" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 hover:shadow-xs ${scrolled ? 'text-slate-600 hover:text-red-600 hover:bg-white' : 'text-white/90 hover:text-white'}`}>
                Nos Services
              </a>
              <a href="#testimonials" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 hover:shadow-xs ${scrolled ? 'text-slate-600 hover:text-red-600 hover:bg-white' : 'text-white/90 hover:text-white'}`}>
                Avis
              </a>
              <a href="#faq" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 hover:shadow-xs ${scrolled ? 'text-slate-600 hover:text-red-600 hover:bg-white' : 'text-white/90 hover:text-white'}`}>
                FAQ
              </a>
            </nav>

            {/* Actions à droite */}
            <div className="flex items-center gap-3">
              {!mounted ? (
                <div className="flex items-center gap-3">
                  <div className="w-[80px] h-[36px]" />
                  <div className="w-[110px] h-[40px] rounded-xl bg-slate-200 animate-pulse" />
                </div>
              ) : isConnected ? (
                <a
                  href="/dashboard"
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-650 hover:to-red-750 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/20 cursor-pointer hover:scale-105 active:scale-95"
                >
                  Mon Espace
                </a>
              ) : (
                <>
                  <a href="/login" className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${scrolled ? 'text-slate-700 hover:text-red-600' : 'text-white/80 hover:text-white'}`}>
                    Connexion
                  </a>
                  <Link
                    href="/register"
                     className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${scrolled ? 'bg-slate-950 hover:bg-slate-900 text-white shadow-sm hover:shadow-md' : 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md'}`}
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}

              {/* Menu Hamburger réservé UNIQUEMENT aux mobiles (<768px) */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 cursor-pointer rounded-xl transition-all ${scrolled ? 'text-slate-700 hover:text-slate-950 bg-slate-100/80 border border-slate-200/80' : 'text-white/80 hover:text-white bg-transparent border-0'}`}
                aria-label="Menu mobile"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl overflow-hidden"
              >
                <nav className="flex flex-col p-4 gap-1 text-xs font-black uppercase tracking-widest">
                  <a href="#about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Qui Sommes-Nous</a>
                  <Link href="/certifications" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Certifications</Link>
                  <a href="#services" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Nos Services</a>
                  <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Avis</a>
                  <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">FAQ</a>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-4xl uppercase leading-none drop-shadow-lg"
          >
            Ethical Data Security – L&apos;essentiel en un clic !
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-white/80 max-w-3xl mt-6 uppercase tracking-widest font-black leading-relaxed drop-shadow-md"
          >
            SUPPORT DE COURS ET ENTRAÎNEMENT PRATIQUE POUR VOS CERTIFICATIONS EN CYBERSÉCURITÉ ET EN SÉCURITÉ
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-8"
          >
            <a
              href={isConnected ? "/dashboard/practice" : "/login"}
              className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-red-600/30 text-sm uppercase tracking-wider"
            >
              <span>Réserver un diagnostic</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* BANDE DES LOGOS CLIENTS                    */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 w-full border-y border-slate-200/60 py-5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-3 text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ils nous font confiance :</span>
        </div>
        <div className="relative w-full overflow-hidden">
          {/* Floutage des bords */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-12 animate-marquee-reverse whitespace-nowrap items-center">
            {[...clients, ...clients, ...clients, ...clients].map((client, idx) => (
              <div key={idx} className="inline-flex items-center justify-center bg-white border border-slate-100 rounded-xl px-4 py-1.5 shrink-0 shadow-sm">
                <img 
                  src={client.logo} 
                  alt={client.name} 
                  className="h-5 sm:h-6 object-contain block max-w-[90px]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const textSpan = document.createElement('span');
                      textSpan.className = "fallback-text text-[10px] font-black text-slate-400 uppercase tracking-widest";
                      textSpan.innerText = client.name;
                      parent.appendChild(textSpan);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* INTRO DU CENTRE & STATS (EDS)              */}
      {/* ═══════════════════════════════════════════ */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <AnimatedSection className="lg:col-span-6 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-red-600" />
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Présentation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase leading-tight">
              Ethical Data Security
            </h2>
            <p className="text-slate-650 text-sm leading-relaxed font-semibold">
              La plateforme de préparation intelligente pour valider vos compétences Cloud et Cybersécurité en toute confiance. Apprenez, entraînez-vous et mesurez votre préparation aux examens officiels.
            </p>
            
            {/* Stats en ligne horizontal */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-200">
              {[
                { value: "20+", label: "Certifications" },
                { value: "85%+", label: "Réussite" },
                { value: "4500+", label: "Quiz" },
                { value: "300+", label: "Apprenants" }
              ].map((stat, i) => (
                <div key={i} className="text-center sm:text-left">
                  <p className="text-xl sm:text-2xl font-black text-red-600">{stat.value}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Slider Technopark Casablanca */}
          <AnimatedSection className="lg:col-span-6 relative" delay={0.2}>
            <div className="w-full h-80 rounded-3xl overflow-hidden border border-slate-200/80 relative group shadow-xl shadow-slate-200/40">
              {/* Image générée du Casablanca Technopark */}
              <img 
                src="/technopark.jpeg" 
                alt="Casablanca Technopark" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent z-10" />

              {/* Carte superposée floutée */}
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl p-4 flex gap-4 items-center text-left shadow-lg">
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <img src="/cyber_hand.png" alt="Cybersécurité" className="w-10 h-10 object-contain rounded-lg" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Qui sommes-nous ?</p>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                    Ethical Data Security est un centre de formation de référence en cybersécurité et cloud computing, situé au cœur du Technopark de Casablanca.
                  </p>
                </div>
              </div>

              {/* Flèches de navigation (esthétique) */}
              <button aria-label="Image précédente" className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-600/90 border border-red-500/25 flex items-center justify-center text-white cursor-pointer hover:bg-red-750 transition-colors z-20">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button aria-label="Image suivante" className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-600/90 border border-red-500/25 flex items-center justify-center text-white cursor-pointer hover:bg-red-750 transition-colors z-20">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION FORMATIONS (Catalog)               */}
      {/* ═══════════════════════════════════════════ */}
      <section id="formations" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/60">
        
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Offres phares</span>
          <h2 className="text-3xl font-black text-slate-950 mt-3 uppercase tracking-tight">Certifications</h2>
          <p className="text-sm text-slate-600 mt-4 leading-relaxed font-semibold">
            Sélectionnez votre parcours, entraînez-vous sur nos simulateurs et décrochez votre certification internationale.
          </p>
        </AnimatedSection>

        {/* Formater les certifications dynamiques ou par défaut */}
        {(() => {
          const getCertificateBadgeLogo = (cert: any) => {
            if (cert.image && (cert.image.endsWith('.svg') || cert.image.endsWith('.png'))) return cert.image;
            const code = (cert.codeExamen || cert.code || '').toLowerCase();
            const nom = (cert.nom || cert.title || '').toLowerCase();

            if (code.includes('az-900') || nom.includes('az-900') || nom.includes('azure fundamentals')) return '/badges/az-900.svg';
            if (code.includes('clf') || nom.includes('cloud practitioner')) return '/badges/aws-clf.svg';
            if (code.includes('saa') || nom.includes('solutions architect')) return '/badges/aws-saa.svg';
            if (code.includes('iso-27001') || nom.includes('iso 27001') || nom.includes('pecb')) return '/badges/pecb-iso.svg';
            if (code.includes('sy0') || nom.includes('security+')) return '/badges/comptia-sec.svg';
            if (code.includes('sc-900') || nom.includes('sc-900')) return '/badges/sc-900.svg';

            return cert.image || cert.logo || '/badges/az-900.svg';
          };

          const catalogCourses = realCertifications.length > 0
            ? realCertifications.map(c => ({
                id: c.id,
                slug: c.slug,
                nom: c.nom,
                codeExamen: c.codeExamen || 'CERT-EDS',
                fournisseur: c.fournisseur || { nom: c.fournisseurNom || 'Officiel' },
                niveau: c.niveau || 'DEBUTANT',
                dureeIndicative: c.dureeIndicative || '15h indicatives',
                description: c.description || 'Préparez-vous à l\'examen officiel sur nos simulateurs interactifs.',
                logo: getCertificateBadgeLogo(c)
              }))
            : courses.map(c => ({
                id: c.code,
                slug: c.code.toLowerCase(),
                nom: c.title,
                codeExamen: c.code,
                fournisseur: { nom: c.provider },
                niveau: 'DEBUTANT',
                dureeIndicative: '15h de préparation',
                description: 'Préparez-vous à l\'examen officiel sur nos simulateurs interactifs.',
                logo: getCertificateBadgeLogo(c)
              }));

          const displayedCourses = catalogCourses.slice(0, 4);

          const getNiveauBadgeStyle = (niveau: string) => {
            switch (niveau?.toUpperCase()) {
              case 'DEBUTANT': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
              case 'INTERMEDIAIRE': return 'bg-amber-50 text-amber-700 border-amber-200/80';
              case 'AVANCE':
              case 'EXPERT': return 'bg-rose-50 text-rose-700 border-rose-200/80';
              default: return 'bg-slate-100 text-slate-700 border-slate-200';
            }
          };

          return (
            <>
              {/* Grille de cartes de certification (Exact Design Dashboard/Certifications) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayedCourses.map((cert, idx) => (
                  <AnimatedSection key={idx} delay={idx * 0.08}>
                    <div className="bg-white border border-slate-200/90 hover:border-slate-350 hover:shadow-xl rounded-3xl p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 text-left space-y-5">
                      
                      {/* PARTIE SUPÉRIEURE : EN-TÊTE STYLE UDEMY */}
                      <div className="flex items-start justify-between gap-4">
                        {/* Côté Gauche : Badges, Titre & Description */}
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-[10px] uppercase tracking-wider px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                              {cert.fournisseur?.nom || 'Éditeur'}
                            </span>
                            {cert.codeExamen && (
                              <span className="font-black text-red-600 text-[10px] uppercase tracking-wider px-2.5 py-1 bg-red-50 border border-red-100 rounded-lg">
                                {cert.codeExamen}
                              </span>
                            )}
                            <span className={`text-[9px] px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-wider border ${getNiveauBadgeStyle(cert.niveau)}`}>
                              {cert.niveau}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-extrabold text-slate-950 text-lg leading-snug group-hover:text-red-600 transition-colors">
                              {cert.nom}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1.5 leading-relaxed">
                              {cert.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-1">
                            <span className="flex items-center gap-1.5 text-slate-600">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>Candidats en préparation</span>
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{cert.dureeIndicative}</span>
                            </span>
                          </div>
                        </div>

                        {/* Côté Droit : Écusson/Badge Officiel du Certificat (Style Udemy sans bordure) */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0 p-1">
                          {cert.logo ? (
                            <img
                              src={cert.logo}
                              alt={cert.nom}
                              className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <Award className="w-12 h-12 text-slate-300" />
                          )}
                        </div>
                      </div>

                      {/* BAS DE CARTE : ACTIONS & CTAS DISCRETS */}
                      <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-3 text-xs">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Examen Blanc & Quiz inclus</span>
                        </span>

                        <button 
                          onClick={() => {
                            if (isConnected) {
                              window.location.href = '/dashboard/practice';
                            } else {
                              window.location.href = '/login';
                            }
                          }}
                          className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md"
                        >
                          <Play className="w-3 h-3 fill-white text-white" />
                          <span>S&apos;entraîner</span>
                        </button>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

              {/* Bouton Redirection vers la nouvelle page /certifications */}
              <AnimatedSection className="flex justify-center mt-12">
                <Link 
                  href="/certifications"
                  className="px-8 py-3.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-3 hover:scale-105 active:scale-95 group"
                >
                  <span>Voir tout le catalogue des certifications</span>
                  <ArrowRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              </AnimatedSection>
            </>
          );
        })()}
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION NOS SERVICES                       */}
      {/* ═══════════════════════════════════════════ */}
      <section id="services" className="relative z-10 w-full py-24 lg:py-32 overflow-hidden border-t border-slate-900 bg-[#0B1120]">
        
        {/* Background Image - optimized, no blur */}
        <div className="absolute inset-0">
          <img 
            src="/landing_page_logo_ethicaldata.jpeg" 
            alt="" 
            className="w-full h-full object-cover opacity-10" 
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0B1120]/95 to-[#0F172A]/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Côté Gauche : Professionnel invitant */}
          <div className="w-full lg:w-1/3 flex justify-center relative">
             <img 
              src="/logos/landing_page_guy.webp" 
              alt="Nos Services" 
              className="max-h-[450px] lg:max-h-[550px] w-auto object-contain relative z-10" 
            />
          </div>

          {/* Côté Droit : Grille de services */}
          <div className="w-full lg:w-2/3 flex flex-col space-y-10">
            <div className="text-center lg:text-left space-y-2">
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Nos compétences</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">Nos Prestations</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((srv, i) => (
                <AnimatedSection key={i} delay={i * 0.05}>
                  <div className="h-full p-6 rounded-xl bg-[#131C2D] border border-slate-800 hover:border-red-500/60 transition-colors duration-200 group cursor-default">
                    <div className="flex flex-col h-full space-y-4">
                      
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border border-slate-700 bg-[#1E293B] flex items-center justify-center text-white font-bold text-sm transition-colors group-hover:bg-red-500 group-hover:border-red-500">
                          0{i + 1}
                        </div>
                        <h3 className="text-sm font-bold text-white tracking-wide">{srv.title}</h3>
                      </div>

                      <p className="text-[13px] text-slate-400 leading-relaxed font-medium">{srv.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION TÉMOIGNAGES (Avis Google)          */}
      {/* ═══════════════════════════════════════════ */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/60">
        
        {/* En-tête Témoignages */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <div className="space-y-2">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Satisfaction</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-955 uppercase tracking-tight">Ce que disent nos clients</h2>
          </div>

          {/* Bloc de notation Google blanc */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-sm">
            <div className="space-y-0.5">
              <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Excellent</p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-red-600 text-red-600" />)}
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">478 avis sur Google</p>
            </div>
            <div className="border-l border-slate-100 pl-4 py-1">
              <span className="text-xl font-black text-slate-950 tracking-tight">Google</span>
            </div>
          </div>
        </div>

        {/* Grille d'avis blanche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <AnimatedSection key={idx} delay={idx * 0.12}>
              <div className="bg-white border border-slate-100 rounded-3xl p-6 text-left space-y-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5">
                  {[...Array(test.stars)].map((_, i) => <Star key={i} className="w-3 h-3 fill-red-600 text-red-600" />)}
                </div>
                <p className="text-xs font-semibold text-slate-650 leading-relaxed italic">
                  &quot;{test.text}&quot;
                </p>
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{test.name}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">{test.role}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION ACTUALITÉS / EVENEMENTS (News)      */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/60">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Événements</span>
          <h2 className="text-3xl font-black text-slate-950 mt-3 uppercase tracking-tight">News / Events</h2>
        </div>

        {/* Bloc Événement blanc */}
        <AnimatedSection className="max-w-4xl mx-auto">
          <div className="bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8 items-center text-left relative overflow-hidden shadow-lg transition-all">
            
            {/* Badge de date rouge */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-red-600 text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-red-600/10">
              <span className="text-3xl sm:text-4xl font-black leading-none">12</span>
              <span className="text-[10px] font-black uppercase tracking-widest mt-1.5">Mai</span>
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Atelier en présentiel
                </span>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug">
                  Atelier pratique : Évaluation de vulnérabilité & diagnostics Cloud
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Rejoignez nos experts au Technopark de Casablanca pour une session pratique d&apos;analyse de conformité sécurité, d&apos;audit de subnets cloud et de simulation d&apos;attaques guidée par IA. Places limitées.
              </p>
              
              <div className="pt-2">
                <button 
                  onClick={() => window.location.href = '/register'}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                >
                  S&apos;inscrire
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION CAROUSEL LOGOS FOURNISSEURS (Bleu) */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 w-full border-t border-slate-200/60 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-10 text-left">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Nos Partenaires Certifications</h3>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-12 animate-marquee whitespace-nowrap items-center">
            {[...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos].map((partner, idx) => (
              <div key={idx} className="inline-flex items-center justify-center bg-white border border-slate-100 rounded-xl px-4 py-1.5 shrink-0 shadow-sm">
                <img 
                  src={partner.path} 
                  alt={partner.name} 
                  className="h-5 sm:h-6 object-contain block max-w-[90px]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const textSpan = document.createElement('span');
                      textSpan.className = "fallback-text text-[10px] font-black text-slate-400 uppercase tracking-widest";
                      textSpan.innerText = partner.name;
                      parent.appendChild(textSpan);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION FAQ (Accordéons)                  */}
      {/* ═══════════════════════════════════════════ */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-slate-200/60">

        <AnimatedSection className="text-center mb-16">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Support</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 mt-3 uppercase tracking-tight">Questions Fréquentes</h2>
        </AnimatedSection>

        <div className="space-y-3">
          {faqData.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <AnimatedSection key={idx} delay={idx * 0.08}>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-200 shadow-sm">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-xs sm:text-sm text-slate-800 outline-none cursor-pointer"
                  >
                    <span className="pr-4 uppercase tracking-wider">{item.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-slate-500 shrink-0"
                    >
                      <ChevronDown className="w-4 h-4" />
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
                        <div className="px-5 pb-5 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FOOTER                                     */}
      {/* ═══════════════════════════════════════════ */}
      <footer className="relative z-10 bg-[#212121] text-[#A3A3A3]">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-12">
          
          <div className="max-w-xl space-y-4 text-left">
            <img src="/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-10 w-auto object-contain" />
            <p className="text-sm leading-relaxed">
              Dynamisme, réactivité et innovation sont au cœur de nos engagements. Nos solutions,<br className="hidden md:block" />
              conçues par des experts, visent à surpasser vos attentes.
            </p>
          </div>

          <div className="text-left space-y-4 md:min-w-[400px]">
            <h4 className="text-base font-bold text-[#E5E5E5]">Contact</h4>
            <div className="text-sm space-y-3">
              <p><span className="font-bold text-[#D4D4D4]">Email :</span> contact@ethicaldatasecurity.ma</p>
              <p><span className="font-bold text-[#D4D4D4]">Tél :</span> +212 664 244 343 // +212 520 572 631</p>
              <p><span className="font-bold text-[#D4D4D4]">Adresse :</span> Bureau 305, Technopark Casablanca</p>
            </div>
          </div>
          
        </div>

        {/* BOTTOM COPYRIGHT STRIP */}
        <div className="w-full bg-[#181818] py-5">
          <div className="max-w-7xl mx-auto px-6 flex items-center">
            <p className="text-sm">© 2025 Ethical Data Security - Tous droits réservés.</p>
          </div>
        </div>
      </footer>

    </main>
  );
}