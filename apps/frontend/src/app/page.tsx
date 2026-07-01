"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, ArrowRight, Sparkles, Award, Clock, ArrowUpRight, BookOpen, Check, X as XIcon, HelpCircle, Download, FileText, ChevronRight, CheckCircle2, ChevronDown, Send, Menu, X, Play, Star, Calendar, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsConnected(!!token);
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
    { name: "AWS", path: "/logos/aws.svg" },
    { name: "Palo Alto", path: "/logos/paloalto.png" },
    { name: "Fortinet", path: "/logos/fortinet.png" },
    { name: "CompTIA", path: "/logos/comptia.png" },
    { name: "Cisco", path: "/logos/cisco.svg" },
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
      logo: "/logos/aws.svg"
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
    { title: "Formations", desc: "Formations certifiantes en Cybersécurité, Gouvernance des SI (ISO 27001) et Cloud Computing." },
    { title: "Préparations aux examens", desc: "Simulateurs d'entraînement complets pour valider vos compétences avant l'examen réel." },
    { title: "Diagnostics IA", desc: "Analyse automatisée de vos tentatives pour mettre en évidence vos lacunes spécifiques." },
    { title: "Fiches Mémo", desc: "Supports de cours synthétiques et fiches de révision téléchargeables à tout moment." },
    { title: "Simulateur interactif", desc: "Entraînement chronométré avec correction détaillée et explications pédagogiques." },
    { title: "Coaching & Mentorat", desc: "Sessions d'échange avec des instructeurs certifiés et ingénieurs expérimentés." },
    { title: "Mises à jour continues", desc: "Contenu mis à jour sous 48h en cas de modification des programmes officiels." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      
      {/* Grille fine d'arrière-plan claire */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#dc262605_0%,transparent_70%)] pointer-events-none z-0" />

      {/* ═══════════════════════════════════════════ */}
      {/* HEADER & NAV                               */}
      {/* ═══════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-950 uppercase">
              Ethical Data Security
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-650">
            <a href="#about" className="hover:text-slate-950 transition-colors">Qui Sommes-Nous</a>
            <a href="#formations" className="hover:text-slate-950 transition-colors">Formations</a>
            <a href="#services" className="hover:text-slate-950 transition-colors">Nos Services</a>
            <a href="#testimonials" className="hover:text-slate-950 transition-colors">Avis</a>
            <a href="#faq" className="hover:text-slate-950 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <a
                href="/dashboard"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Mon Espace
              </a>
            ) : (
              <>
                <a href="/login" className="text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-950 transition-colors">
                  Connexion
                </a>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-950 cursor-pointer"
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
                <a href="#formations" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Formations</a>
                <a href="#services" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Nos Services</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Avis</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">FAQ</a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════════════════════════════════════ */}
      {/* HERO SECTION                               */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center">
        
        {/* Logo géant avec halo rouge en fond */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-32 h-32 md:w-36 md:h-36 flex items-center justify-center mb-8"
        >
          {/* Halo rouge circulaire */}
          <div className="absolute inset-0 bg-red-600/10 rounded-full blur-[45px] animate-pulse pointer-events-none" />
          
          {/* Symbole géométrique triangulaire (EDS) */}
          <svg className="w-24 h-24 text-red-600 relative z-10 filter drop-shadow-[0_4px_15px_rgba(220,38,38,0.2)]" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,15 15,85 85,85" className="fill-none stroke-red-600 stroke-[6]" />
            <polygon points="50,30 28,75 72,75" className="fill-none stroke-slate-900 stroke-[4]" />
            <polygon points="50,45 40,65 60,65" className="fill-red-600" />
          </svg>
        </motion.div>

        {/* Titres de la maquette */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950 max-w-4xl uppercase leading-none"
        >
          Ethical Data Security – L&apos;essentiel en un clic !
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs sm:text-sm md:text-base text-slate-600 max-w-3xl mt-6 uppercase tracking-widest font-black leading-relaxed"
        >
          SUPPORT DE COURS ET ENTRAÎNEMENT PRATIQUE POUR VOS CERTIFICATIONS EN CYBERSÉCURITÉ ET EN CLOUD
        </motion.p>

        {/* Boutons CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-8"
        >
          <a
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-750 text-white font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-red-600/15 text-sm uppercase tracking-wider animate-fadeIn"
          >
            <span>Lancer mon diagnostic gratuit</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
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
                src="/technopark.png" 
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
              <button className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-600/90 border border-red-500/25 flex items-center justify-center text-white cursor-pointer hover:bg-red-750 transition-colors z-20">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-600/90 border border-red-500/25 flex items-center justify-center text-white cursor-pointer hover:bg-red-750 transition-colors z-20">
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
          <h2 className="text-3xl font-black text-slate-950 mt-3 uppercase tracking-tight">Formations</h2>
          <p className="text-sm text-slate-600 mt-4 leading-relaxed font-semibold">
            Sélectionnez votre parcours, entraînez-vous sur nos simulateurs et décrochez votre certification internationale.
          </p>
        </AnimatedSection>

        {/* Grille de 4 cartes blanches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, idx) => (
            <AnimatedSection key={idx} delay={idx * 0.12}>
              <div className="bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl rounded-3xl p-6 flex flex-col justify-between min-h-[380px] transition-all duration-300 group text-left relative overflow-hidden shadow-md">
                
                {/* Badge d'état (Offre, Hot, Nouveau) */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${course.badgeClass}`}>
                    {course.badge}
                  </span>
                </div>

                <div className="space-y-4 pt-6">
                  {/* Logo de la certification */}
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-1.5 shrink-0">
                    <img 
                      src={course.logo} 
                      alt={course.provider} 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                          const iconSpan = document.createElement('span');
                          iconSpan.className = "fallback-icon text-[9px] font-bold text-slate-500 uppercase";
                          iconSpan.innerText = course.provider.substring(0, 3);
                          parent.appendChild(iconSpan);
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">{course.code}</span>
                    <h3 className="font-extrabold text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                      {course.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-3">
                    <span>Certificat : {course.provider}</span>
                    <span className="text-emerald-600 font-extrabold">{course.successRate} Réussite</span>
                  </div>

                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-100 hover:border-red-600/30 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-red-600 rounded-xl transition-all cursor-pointer group/btn"
                  >
                    <span>S&apos;entraîner</span>
                    <Play className="w-3.5 h-3.5 fill-red-600 text-red-600 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="flex justify-center mt-12">
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-750 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all cursor-pointer"
          >
            Voir Tous
          </button>
        </AnimatedSection>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION NOS SERVICES                       */}
      {/* ═══════════════════════════════════════════ */}
      <section id="services" className="relative z-10 w-full border-t border-slate-200/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
          
          {/* Côté Gauche : Professionnel invitant sur dégradé bleu/cyan */}
          <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 min-h-[400px] lg:min-h-full flex items-end justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff10_0%,transparent_70%)] pointer-events-none" />
            <img 
              src="/welcoming_professional.png" 
              alt="Bienvenue chez Ethical Data" 
              className="max-h-[85%] lg:max-h-[92%] object-contain relative z-10 select-none pointer-events-none" 
            />
          </div>

          {/* Côté Droit : Liste des services sur fond blanc */}
          <div className="bg-white p-8 sm:p-12 md:p-16 text-left flex flex-col justify-center space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Nos prestations</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">Nos Services</h2>
            </div>

            <div className="space-y-4 max-w-lg">
              {services.map((srv, i) => (
                <div key={i} className="flex gap-4 items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="w-5 h-5 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{srv.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">{srv.desc}</p>
                  </div>
                </div>
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
      <footer className="relative z-10 bg-black border-t border-slate-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-red-600/10 border border-red-600/20 rounded-lg flex items-center justify-center text-red-500">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white uppercase">Ethical Data Security</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-semibold">
              La plateforme de préparation intelligente pour valider vos compétences Cloud et Cybersécurité en toute confiance au cœur de Casablanca.
            </p>
          </div>

          <div className="text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Formations</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-semibold uppercase">
              <li><a href="#formations" className="hover:text-white transition-colors">Azure AZ-900</a></li>
              <li><a href="#formations" className="hover:text-white transition-colors">PECB ISO 27001</a></li>
              <li><a href="#formations" className="hover:text-white transition-colors">AWS Cloud Practitioner</a></li>
              <li><a href="#formations" className="hover:text-white transition-colors">Palo Alto PCNSA</a></li>
            </ul>
          </div>

          <div className="text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Légal & Contact</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-semibold uppercase">
              <li><a href="/login" className="hover:text-white transition-colors">Mentions Légales</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Confidentialité</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Conditions Générales</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Support Technique</a></li>
            </ul>
          </div>

          <div className="text-left space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Lettre d&apos;information</h4>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Recevez nos conseils de sécurité et alertes de mise à jour des examens officiels.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Votre e-mail"
                className="flex-1 bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-red-600/50 transition-colors"
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
                  className="text-[10px] text-red-500 font-bold"
                >
                  Inscription validée !
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-slate-900/60 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-500 font-semibold uppercase gap-4">
          <p>© {new Date().getFullYear()} Ethical Data Security. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <a href="/login" className="hover:text-slate-400 transition-colors">Politique RGPD</a>
            <a href="/login" className="hover:text-slate-400 transition-colors">Gestion des Cookies</a>
          </div>
        </div>
      </footer>

    </div>
  );
}