"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ShieldCheck, ArrowRight, Sparkles, Award, Clock, ArrowUpRight, BookOpen, Check, HelpCircle, Download, FileText, ChevronRight, CheckCircle2, ChevronDown, Send, Menu, X, Play, Star, Calendar, ChevronLeft, Users } from '@/components/icons';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { apiFetch } from '../lib/api';

const AnimatedSection = ({ children, className = "", delay = 0 }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

function AnimatedNumber({ end, suffix = "+" }: { end: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp: number | null = null;
          const duration = 2000;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(ease * end));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, hasAnimated]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function AboutSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const slides = [
    {
      title: "Qui sommes-nous ?",
      text: "Ethical Data Security est un centre de formation de référence en cybersécurité et cloud computing, situé au cœur du Technopark de Casablanca.",
      image: "/cyber_hand.png",
      isRed: true
    },
    {
      title: "Solution IT",
      text: "Nous vous offrons des opportunités en développant des solutions spécialisées et nous vous proposons plusieurs produits qui accélèrent la transformation numérique sur n'importe quelle application, n'importe quel cloud et n'importe quel appareil pour réduire les dépenses informatiques......",
      image: "/logos/expertises-integrations-scaled-434x358.webp",
      isRed: true
    },
    {
      title: "Notre priorité",
      text: "Notre missions est de vous accompagner tout au long du cycle de vie de votre infrastructure réseau et sécurité. Nos domaines d'intervention couvrent la conception, la mise en oeuvre, la gestion et le support de solutions réseau, cloud et sécurité",
      image: "/logos/avantages-1-434x358.webp",
      isRed: true
    },
    {
      title: "Une expérience d'une décennie",
      text: "Une équipe enthousiaste, composée de consultants en cybersécurité et infrasctructure, reconnus sur le marché local et international à travers leur participation réussie à des projets de grande envergure (ISP,gouvernemental,finance...). Chacun d'entre nous apporte le meilleur de son expertise pour assurer le succès et la fiabilité de vos projets.",
      image: "/logos/experiences-scaled-434x358.webp",
      isRed: true
    },
    {
      title: "Certification",
      text: "Ethical Data Security met à votre disposition plus de 500 certifications pour renforcer votre expertise et valider vos compétences aux standards les plus élevés. Reconnues et prisées par les recruteurs, nos certifications vous ouvrent les portes des opportunités professionnelles les plus exigeantes",
      image: "/logos/certifications-scaled-434x358.webp",
      isRed: true,
      isTransparent: true
    }
  ];

  const nextSlide = useCallback(() => setCurrentSlide((prev) => (prev + 1) % slides.length), [slides.length]);
  const prevSlide = useCallback(() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000); // 6 secondes par slide
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <div 
      className="relative w-full max-w-5xl mx-auto mt-4 md:mt-12 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Le conteneur du slider */}
      <div className="w-full relative flex flex-col items-center">
        {/* L'image de fond (Technopark) */}
        <div className="w-full h-[300px] md:h-[450px] overflow-hidden rounded-2xl md:rounded-[40px] shadow-lg relative">
          <img 
            src="/technopark.jpeg" 
            alt="Technopark" 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* La Carte Blanche qui chevauche le bas de l'image */}
        <div className="relative -mt-24 md:-mt-32 w-[90%] md:w-10/12 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-5 md:p-10 z-20 flex flex-col md:flex-row gap-6 md:gap-10 items-center min-h-[200px] transition-all duration-500">
          
          {/* Flèches de navigation (Parfaitement centrées par rapport à la carte) */}
          <button 
            onClick={prevSlide}
            className="cursor-pointer absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:scale-110 rounded-full flex items-center justify-center transition-all z-30 shadow-md"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 ml-[-2px]" />
          </button>
          <button 
            onClick={nextSlide}
            className="cursor-pointer absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:scale-110 rounded-full flex items-center justify-center transition-all z-30 shadow-md"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 mr-[-2px]" />
          </button>

          <div className="w-full md:w-5/12 shrink-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentSlide}
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`w-full ${
                  slides[currentSlide].isTransparent 
                    ? "h-40 md:h-56 object-contain" 
                    : "h-40 md:h-56 object-cover rounded-xl shadow-md"
                }`} 
              />
            </AnimatePresence>
          </div>

          <div className="w-full md:w-7/12 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 md:space-y-4"
              >
                <h3 className="text-lg md:text-2xl font-bold text-slate-900">
                  {slides[currentSlide].isRed ? <span className="text-red-600">{slides[currentSlide].title}</span> : slides[currentSlide].title}
                </h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
                  {slides[currentSlide].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </div>
  );
}

const cleanTitle = (nom: string, code: string) => {
  if (!code || !nom) return nom;
  const safeCode = code.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`[\\s\\-:\\(]*${safeCode}[\\)]*`, 'gi');
  let cleaned = nom.replace(regex, '').trim();
  cleaned = cleaned.replace(/^[\-:\s]+/, '');
  cleaned = cleaned.replace(/[\-:\s]+$/, '');
  return cleaned;
};

const googleReviews = [
  {
    initial: "N", bg: "bg-orange-700",
    name: "Nouhaila IJIKKI", date: "il y a 1 année",
    text: "Great experience!!! The staff was professional and welcoming, ensuring a smooth and stress-free process. The exam room wa...",
    fullText: "Great experience!!! The staff was professional and welcoming, ensuring a smooth and stress-free process. The exam room was very comfortable and well equipped. I would definitely recommend it to anyone.",
    stars: 5,
  },
  {
    initial: "R", bg: "bg-green-600",
    name: "Ruby Rust", date: "il y a 1 année",
    text: "Excellent experience! Great organization and helpful staff. Highly recommend.",
    stars: 5,
  },
  {
    initial: "A", bg: "bg-blue-500",
    name: "ABDELHAMID EL KREM", date: "il y a 1 année",
    text: "Je remercie vivement ce cabinet pour son professionnalisme.",
    stars: 5,
  },
  {
    initial: "M", bg: "bg-slate-400", 
    name: "Manal HAMMADI", date: "il y a 1 année",
    text: "Good experience with Good treatment",
    stars: 5,
  },
  {
    initial: "Y", bg: "bg-red-500",
    name: "Yassine M.", date: "il y a 6 mois",
    text: "Grâce aux simulations d'Ethical Data, j'ai obtenu ma certification AZ-900 avec un score de 940/1000.",
    stars: 5
  },
  {
    initial: "S", bg: "bg-indigo-500",
    name: "Sanaa K.", date: "il y a 2 mois",
    text: "Très bon accompagnement. Les examens blancs sont très représentatifs. Merci à toute l'équipe.",
    stars: 5
  }
];

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
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const [reviewIndex, setReviewIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  
  const toggleReviewText = (idx: number) => {
    setExpandedReviews(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else if (window.innerWidth < 1280) setItemsPerView(3);
      else setItemsPerView(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setReviewIndex((prev) => {
        const maxIndex = Math.max(0, googleReviews.length - itemsPerView);
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [itemsPerView]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const isScrolled = currentY > 60;
          const isNavVisible = currentY <= 60 || currentY < lastScrollY.current;

          setScrolled(prev => prev !== isScrolled ? isScrolled : prev);
          setNavVisible(prev => prev !== isNavVisible ? isNavVisible : prev);

          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
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
      <section id="about" className="relative z-10 w-full pt-20 md:pt-24 pb-24 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase leading-tight tracking-tight">
            ETHICAL DATA SECURITY
          </h2>
          <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed font-medium max-w-4xl mx-auto">
            Dynamisme, réactivité, et innovation font partie de nos principaux engagements vis à vis de nos clients. De même, toutes nos prestations et solutions sont conçues et réalisées par des experts reconnus dans leurs domaines. Chez ETHICAL DATA SECURITY, nous ferons toujours les efforts nécessaires pour dépasser vos attentes.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 sm:gap-20 md:gap-32 pt-8 pb-4">
            {[
              { end: 254, label: "Projets Réalisés" },
              { end: 569, label: "Formations" },
              { end: 2000, label: "Certificats" },
              { end: 100, label: "Mission Pentest" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl sm:text-5xl font-black text-red-600 mb-1">
                  <AnimatedNumber end={stat.end} />
                </p>
                <p className="text-[11px] sm:text-xs text-slate-900 font-extrabold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Logos Partenaires / Accréditations */}
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 pt-8 pb-4 opacity-90">
            <img src="/favicon_ethical_data.png" alt="Ethical Data Security" className="h-16 md:h-20 object-contain hover:scale-105 transition-transform duration-500" />
            <img src="/logos/pearson_vue_authorized.png" alt="Pearson VUE Authorized" className="h-16 md:h-20 object-contain hover:scale-105 transition-transform duration-500" />
          </div>
        </div>

        {/* Le composant Slider avec l'image Technopark en fond et la carte blanche */}
        <AnimatedSection className="w-full max-w-6xl mx-auto px-4 md:px-12 mt-6 md:mt-12">
           <AboutSlider />
        </AnimatedSection>
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
            if (cert.image) return cert.image;
            if (cert.logo) return cert.logo;
            
            const code = (cert.codeExamen || cert.code || '').toLowerCase();
            const nom = (cert.nom || cert.title || '').toLowerCase();

            if (code.includes('az-900') || nom.includes('az-900') || nom.includes('azure fundamentals')) return '/badges/az-900.svg';
            if (code.includes('clf') || nom.includes('cloud practitioner')) return '/badges/aws-clf.svg';
            if (code.includes('saa') || nom.includes('solutions architect')) return '/badges/aws-saa.svg';
            if (code.includes('iso-27001') || nom.includes('iso 27001') || nom.includes('pecb')) return '/badges/pecb-iso.svg';
            if (code.includes('sy0') || nom.includes('security+')) return '/badges/comptia-sec.svg';
            if (code.includes('sc-900') || nom.includes('sc-900')) return '/badges/sc-900.svg';

            return '/badges/az-900.svg';
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
              {/* Grille de cartes de certification (Template CSS Exact) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedCourses.map((cert, idx) => (
                  <AnimatedSection key={idx} delay={idx * 0.08}>
                    <div 
                      onClick={() => setSelectedCourse(cert)}
                      className="flex flex-col group cursor-pointer"
                    >
                      {/* TOP PART: Template Image */}
                      <div className="relative w-full h-[340px] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-blue-900/30 group-hover:shadow-2xl">
                        
                        {/* Image de fond (Template Cadre) */}
                        <img src="/logos/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0" />                        {/* Bandeau Code Certification */}
                        {cert.codeExamen && (
                          <div className="absolute top-4 left-4 z-30">
                            <div className="bg-slate-900/80 backdrop-blur-md text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-700/50 shadow-sm flex items-center gap-1.5 group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                              <span className="w-1 h-1 rounded-full bg-red-500 group-hover:bg-white animate-pulse"></span>
                              {cert.codeExamen}
                            </div>
                          </div>
                        )}


                        {/* Badge */}
                        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 group-hover:-translate-y-2 transition-transform duration-500 w-32 flex justify-center">
                          {cert.logo ? (
                            <img src={cert.logo} alt="Badge" className="w-full h-auto object-contain filter drop-shadow-xl" />
                          ) : (
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center font-bold text-slate-800">Badge</div>
                          )}
                        </div>

                      </div>

                      {/* BOTTOM PART: Details */}
                      <div className="mt-4 flex flex-col gap-2 px-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 flex-1">
                            {cleanTitle(cert.nom, cert.codeExamen)}
                          </h3>
                          <div className="px-3 py-1.5 shrink-0 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 transition-colors shadow-sm group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 text-[10px] font-bold uppercase tracking-wider">
                            Voir plus
                          </div>
                        </div>
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
      <section id="services" className="relative z-10 w-full pt-8 pb-2 lg:pt-10 lg:pb-4 overflow-hidden border-t border-slate-900 bg-[#060B14]">
        
        {/* Background Image avec léger filtre bleu */}
        <div className="absolute inset-0">
          <img 
            src="/logos/services_bg.jpg" 
            alt="" 
            className="w-full h-full object-cover" 
            loading="lazy"
          />
          {/* Filtre bleu très léger pour adoucir (Multiply pour fusionner élégamment) */}
          <div className="absolute inset-0 bg-[#0C1E3A]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060B14] via-transparent to-[#060B14] opacity-80" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-stretch gap-12 lg:gap-16">
          
          {/* Côté Gauche : Professionnel invitant (Fortement décalé à gauche) */}
          <div className="hidden lg:flex lg:w-1/3 min-h-[400px] items-end justify-start relative">
             <img 
              src="/logos/landing_page_guy.webp" 
              alt="Nos Services" 
              className="absolute -bottom-6 -left-28 h-[105%] w-auto max-w-[150%] object-contain object-bottom z-10 drop-shadow-2xl" 
            />
          </div>

          {/* Côté Droit : Grille de services (Sans bordures) */}
          <div className="w-full lg:w-2/3 flex flex-col space-y-16 pt-4 pb-0 relative z-20">
            
            {/* En-tête de section ultra moderne */}
            <div className="text-center lg:text-left space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <span className="w-10 h-[2px] bg-red-600 rounded-full" />
                <span className="text-sm font-black text-red-500 uppercase tracking-[0.2em]">Notre Expertise</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter">Nos Prestations</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14">
              {services.map((srv, i) => (
                <AnimatedSection key={i} delay={i * 0.05}>
                  <div className="flex flex-col space-y-3 group cursor-default">
                    
                    {/* Numéro et Titre (Aucun encadrement) */}
                    <div className="flex items-end gap-4 mb-2">
                      <span className="text-5xl font-black text-slate-700/40 group-hover:text-red-500 transition-colors duration-500 leading-none">
                        0{i + 1}
                      </span>
                      <h3 className="text-xl font-bold text-white tracking-wide group-hover:text-red-400 transition-colors duration-300 leading-tight pb-1">
                        {srv.title}
                      </h3>
                    </div>

                    {/* Description simple et épurée */}
                    <p className="text-[15px] text-slate-300 leading-relaxed font-normal group-hover:text-white transition-colors duration-300">
                      {srv.desc}
                    </p>

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
      <section id="testimonials" className="relative z-10 w-full py-20 bg-white border-t border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4">
          
          {/* En-tête Google */}
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Ce que disent nos clients</h2>
            
            <div className="flex flex-col items-center space-y-1">
              <span className="text-lg font-black text-slate-900 uppercase tracking-widest">Excellent</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-7 h-7 text-[#FFC107] fill-current" viewBox="0 0 512 512">
                    <path d="M256 0c-11.4 0-21.8 7-25.7 17.7L171.1 143.5 29.8 163.6c-11.8 1.7-21.1 10.4-23.7 22-2.6 11.6 1.5 23.6 10.5 31.6l102.4 92-24.5 140.2c-2.1 11.8 3 23.9 13.1 30.5 10 6.6 23.1 6.5 33.1-.2L256 405.1l125.1 74.5c10 6.7 23 6.8 33.1 .2 10.1-6.6 15.2-18.7 13.1-30.5L402.9 309.2l102.4-92c9-8 13.1-20 10.5-31.6-2.6-11.6-11.9-20.3-23.7-22L340.9 143.5 281.7 17.7C277.8 7 267.4 0 256 0z"/>
                  </svg>
                ))}
              </div>
              <p className="text-[13px] text-slate-500 mt-1 font-medium">Basé sur <strong className="text-slate-800">56 avis</strong></p>
              <img src="/logos/google.png" alt="Google" className="h-7 object-contain mt-2" />
            </div>
          </div>

          {/* Carousel Container */}
          <div className="relative group flex items-center px-6 md:px-12">
            
            {/* Flèche Gauche */}
            <button 
              onClick={() => setReviewIndex(prev => Math.max(0, prev - 1))} 
              className={`absolute left-0 z-20 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:shadow-md transition-all ${reviewIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
              disabled={reviewIndex === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>

            <div className="overflow-hidden w-full py-4 px-2">
              <div 
                className="flex transition-transform duration-700 ease-in-out gap-6"
                style={{ transform: `translateX(-${reviewIndex * (100 / itemsPerView)}%)` }}
              >
                {googleReviews.map((test, idx) => {
                  const isExpanded = expandedReviews.includes(idx);
                  return (
                  <div key={idx} style={{ flex: `0 0 calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 24 / itemsPerView}px)` }} className="bg-transparent text-left p-4 flex flex-col space-y-4 hover:-translate-y-1 transition-transform duration-300">
                    
                    {/* Header de l'avis */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${test.bg}`}>
                          {test.initial}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-900 leading-tight">{test.name}</span>
                          <span className="text-[11px] text-slate-400 mt-0.5">{test.date}</span>
                        </div>
                      </div>
                      {/* Small Google Logo */}
                      <img src="/logos/small_google.png" alt="Google" className="w-5 h-5 object-contain shrink-0" />
                    </div>

                    {/* Etoiles + Verified */}
                    <div className="flex gap-1 items-center">
                      {[...Array(test.stars)].map((_, i) => (
                        <svg key={i} className="w-[18px] h-[18px] text-[#FFC107] fill-current" viewBox="0 0 512 512">
                          <path d="M256 0c-11.4 0-21.8 7-25.7 17.7L171.1 143.5 29.8 163.6c-11.8 1.7-21.1 10.4-23.7 22-2.6 11.6 1.5 23.6 10.5 31.6l102.4 92-24.5 140.2c-2.1 11.8 3 23.9 13.1 30.5 10 6.6 23.1 6.5 33.1-.2L256 405.1l125.1 74.5c10 6.7 23 6.8 33.1 .2 10.1-6.6 15.2-18.7 13.1-30.5L402.9 309.2l102.4-92c9-8 13.1-20 10.5-31.6-2.6-11.6-11.9-20.3-23.7-22L340.9 143.5 281.7 17.7C277.8 7 267.4 0 256 0z"/>
                        </svg>
                      ))}
                      <svg className="w-[18px] h-[18px] ml-1.5 drop-shadow-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22.846L9.626 21.01L6.735 21.41L5.353 18.735L2.616 17.653L2.616 14.653L0.461 12.346L2.616 10.038L2.616 7.038L5.353 5.956L6.735 3.282L9.626 3.682L12 1.846L14.374 3.682L17.265 3.282L18.647 5.956L21.384 7.038L21.384 10.038L23.539 12.346L21.384 14.653L21.384 17.653L18.647 18.735L17.265 21.41L14.374 21.01L12 22.846Z" fill="#0095F6" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.486 9.429L10.741 15.174L7.514 11.947L8.571 10.89L10.741 13.061L15.429 8.372L16.486 9.429Z" fill="white" />
                      </svg>
                    </div>

                    {/* Texte */}
                    <p className="text-[13px] text-slate-800 leading-relaxed font-normal">
                      {isExpanded && test.fullText ? test.fullText : test.text}
                    </p>
                    
                    {(test.text.endsWith('...') || isExpanded) && (
                      <button 
                        onClick={() => toggleReviewText(idx)} 
                        className="text-[12px] text-slate-500 hover:text-slate-800 font-bold text-left mt-auto pt-2 transition-colors cursor-pointer hover:underline"
                      >
                        {isExpanded ? 'Réduire' : 'Lire la suite'}
                      </button>
                    )}

                  </div>
                )})}
              </div>
            </div>

            {/* Flèche Droite */}
            <button 
              onClick={() => setReviewIndex(prev => Math.max(0, Math.min(googleReviews.length - itemsPerView, prev + 1)))} 
              className={`absolute right-0 z-20 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:shadow-md transition-all ${reviewIndex >= googleReviews.length - itemsPerView ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
              disabled={reviewIndex >= googleReviews.length - itemsPerView}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION ACTUALITÉS / EVENEMENTS (News)      */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 w-full py-12 lg:py-16 overflow-hidden bg-[#060B14]">
        
        {/* Background Image avec filtre sombre */}
        <div className="absolute inset-0">
          <img 
            src="/logos/events_bg_2.webp" 
            alt="Events background" 
            className="w-full h-full object-cover" 
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060B14] via-[#060B14]/70 to-[#060B14]/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight mb-16">
            New Events
          </h2>

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Colonne de Gauche : Événement Principal */}
            <div className="w-full lg:w-5/12 flex flex-col space-y-8">
              
              <div className="flex items-start gap-6">
                {/* Date Badge */}
                <div className="w-20 h-24 rounded-xl bg-red-600 text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-red-600/20">
                  <span className="text-3xl font-black leading-none">31</span>
                  <span className="text-xs font-bold uppercase tracking-widest mt-1">Mai</span>
                </div>

                {/* Titre et Heure */}
                <div className="space-y-3 mt-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    PMP- Project Management Professional
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>12:00 am - 12:00 am</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-[14px] text-slate-400 leading-relaxed font-medium">
                La formation Project Management Professional (PMP) s'adresse aux chefs de projet actuels et futurs, et vise à les familiariser avec les dernières théories et pratiques en gestion de projet, selon la 7e édition du guide PMBOK. Cette formation met l'accent sur les compétences stratégiques, commerciales et la gestion du changement.
              </p>

              {/* Bouton */}
              <div className="pt-2">
                <button 
                  onClick={() => window.location.href = '/register'}
                  className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] flex items-center gap-3 w-fit"
                >
                  View Event <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Colonne de Droite : Autres événements (Minimaliste) */}
            <div className="w-full lg:w-7/12 flex flex-col justify-start">
              
              <div className="group cursor-pointer border-b border-white/10 pb-8 hover:border-red-500/50 transition-colors duration-300">
                <div className="space-y-3">
                  <span className="text-sm font-bold text-slate-400 group-hover:text-red-400 transition-colors">12 mai</span>
                  <h3 className="text-xl font-bold text-white leading-tight group-hover:text-white transition-colors max-w-lg">
                    AWS Certified Solutions Architect - Associate
                  </h3>
                </div>
              </div>

            </div>

          </div>
        </div>
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

      {/* Modale de Détails de Certification */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourse(null)}
              className="absolute inset-0 bg-slate-950/90 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 max-h-[90vh] will-change-transform"
            >
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-800 transition-colors shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Partie Gauche Modale: La Carte elle-même (Aperçu) */}
              <div className="w-full md:w-5/12 p-8 flex flex-col items-center justify-center relative overflow-hidden shrink-0 min-h-[400px]">
                 <img src="/logos/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0" />
                 
                 {/* Bandeau Code Certification (Modale) */}
                 {selectedCourse.codeExamen && (
                   <div className="absolute top-6 left-6 z-30">
                     <div className="bg-slate-900/80 backdrop-blur-md text-white font-bold uppercase text-[11px] tracking-widest px-3.5 py-1.5 rounded-lg border border-slate-700/50 shadow-lg flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                       {selectedCourse.codeExamen}
                     </div>
                   </div>
                 )}

                 {selectedCourse.logo && <img src={selectedCourse.logo} alt={selectedCourse.nom} className="w-56 object-contain relative z-20 drop-shadow-lg hover:scale-105 transition-transform duration-300" style={{ transform: 'translateY(-15%)' }} />}
              </div>

              {/* Partie Droite Modale: Détails */}
              <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg">
                      {selectedCourse.fournisseur?.nom || 'Éditeur'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight mb-4">{cleanTitle(selectedCourse.nom, selectedCourse.codeExamen)}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-8">{selectedCourse.description}</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <Clock className="w-5 h-5 text-red-500" />
                      <span>{selectedCourse.dureeIndicative || '15h indicatives'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <Award className="w-5 h-5 text-red-500" />
                      <span>Niveau: <span className="uppercase">{selectedCourse.niveau || 'DEBUTANT'}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                  <button 
                    onClick={() => window.location.href = isConnected ? '/dashboard/practice' : '/login'}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white text-white" />
                    S'entraîner maintenant
                  </button>
                  <button className="w-14 h-14 shrink-0 bg-slate-950 hover:bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center hover:-translate-y-0.5 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}