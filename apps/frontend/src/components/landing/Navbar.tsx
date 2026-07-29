"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from '@/components/icons';

const FORMATION_ITEMS = [
  { label: 'Catalogue Formations', href: '/formations' },
  { label: 'Tous les Certificats', href: '/certifications' },
  { label: 'Examens Blancs & IA', href: '/examens-blancs' },
  { label: 'Vouchers d\'Examen', href: '/vouchers' },
  { label: 'Coaching & Mentoring', href: '/coaching' },
];

const SERVICES_ITEMS = [
  { label: 'Infogérance', href: '/infogerance' },
  { label: 'Intégration', href: '/integration' },
  { label: 'Services professionnels', href: '/services-professionnels' },
  { label: 'Solution IT', href: '/solution-it' },
  { label: 'Portage Salarial', href: '/portage-salarial' },
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [formationDropdownOpen, setFormationDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  
  const [mobileFormationOpen, setMobileFormationOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  
  const formationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsConnected(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.roles?.includes('ADMIN') || payload.roles?.includes('SUPER_ADMIN'));
      } catch { }
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const isScrolled = currentY > 60;
          const isNavVisible = currentY <= 60 || currentY < lastScrollY.current;

          setScrolled(isScrolled);
          setNavVisible(isNavVisible);

          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnterFormation = () => {
    if (formationTimeoutRef.current) clearTimeout(formationTimeoutRef.current);
    setFormationDropdownOpen(true);
  };

  const handleMouseLeaveFormation = () => {
    formationTimeoutRef.current = setTimeout(() => {
      setFormationDropdownOpen(false);
    }, 150);
  };

  const handleMouseEnterServices = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    setServicesDropdownOpen(true);
  };

  const handleMouseLeaveServices = () => {
    servicesTimeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
    }, 150);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-[#020617] border-b border-slate-900 shadow-sm' : 'bg-transparent border-b border-transparent'} ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
          <div className="flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-10 md:h-8 w-auto object-contain" />
          </div>
        </Link>

        {/* Navigation PC */}
        <nav className={`hidden lg:flex items-center gap-1 rounded-full px-3 py-1.5 transition-all duration-300 ${scrolled ? 'bg-slate-950/60 border border-slate-900' : 'bg-transparent border-0'}`}>
          <Link href="/" className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
            Accueil
          </Link>
          
          {/* Menu Déroulant Formation */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnterFormation}
            onMouseLeave={handleMouseLeaveFormation}
          >
            <button
              onClick={() => setFormationDropdownOpen(!formationDropdownOpen)}
              className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1 transition-all duration-200 cursor-pointer ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}
            >
              <span>Formation</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${formationDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>

            <AnimatePresence>
              {formationDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-[#080d1a]/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 text-left"
                >
                  <div className="space-y-0.5">
                    {FORMATION_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setFormationDropdownOpen(false)}
                        className="block px-3.5 py-2 rounded-xl hover:bg-blue-600/10 border border-transparent hover:border-blue-500/20 transition-all duration-150 group"
                      >
                        <p className="text-xs font-black text-slate-200 group-hover:text-cyan-400 uppercase tracking-wider transition-colors whitespace-nowrap">
                          {item.label}
                        </p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Menu Déroulant Services */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnterServices}
            onMouseLeave={handleMouseLeaveServices}
          >
            <button
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1 transition-all duration-200 cursor-pointer ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}
            >
              <span>Services</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>

            <AnimatePresence>
              {servicesDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-60 bg-[#080d1a]/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 text-left"
                >
                  <div className="space-y-0.5">
                    {SERVICES_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setServicesDropdownOpen(false)}
                        className="block px-3.5 py-2 rounded-xl hover:bg-blue-600/10 border border-transparent hover:border-blue-500/20 transition-all duration-150 group"
                      >
                        <p className="text-xs font-black text-slate-200 group-hover:text-cyan-400 uppercase tracking-wider transition-colors whitespace-nowrap">
                          {item.label}
                        </p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/about" className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
            À propos
          </Link>
          <Link href="/blog" className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
            Blog
          </Link>
          <a href="/#testimonials" className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
            Avis
          </a>
          <a href="/#faq" className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
            FAQ
          </a>
          <a href="/#contact" className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
            Contact
          </a>
        </nav>

        {/* Actions à droite */}
        <div className="flex items-center gap-1.5 md:gap-3">
          {!mounted ? (
            <div className="flex items-center gap-1.5 md:gap-3">
              <div className="w-[60px] md:w-[80px] h-[32px] md:h-[36px]" />
              <div className="w-[80px] md:w-[110px] h-[36px] md:h-[40px] rounded-lg md:rounded-xl bg-slate-900 animate-pulse" />
            </div>
          ) : isConnected ? (
            <a
              href={isAdmin ? "/admin" : "/dashboard"}
              className="inline-flex items-center justify-center px-4 py-2 md:px-5 md:py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] md:text-xs font-black uppercase tracking-wider rounded-lg md:rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
            >
              Mon Espace
            </a>
          ) : (
            <>
              <a href="/login" className={`hidden md:inline-flex px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${scrolled ? 'text-slate-300 hover:text-cyan-400' : 'text-white/80 hover:text-white'}`}>
                Connexion
              </a>
              <Link
                href="/register"
                className="px-3 py-2 md:px-5 md:py-2.5 text-[10px] md:text-xs font-black uppercase tracking-wider rounded-lg md:rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
              >
                S&apos;inscrire
              </Link>
            </>
          )}

          {/* Menu Hamburger Mobile */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-1.5 cursor-pointer rounded-lg transition-all ${scrolled ? 'text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800' : 'text-white/80 hover:text-white bg-transparent border-0'}`}
            aria-label="Menu mobile"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-slate-900 bg-[#020617]/95 backdrop-blur-xl overflow-hidden shadow-2xl"
          >
            <nav className="flex flex-col p-4 gap-1 text-xs font-black uppercase tracking-widest text-left">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-xl transition-colors">Accueil</Link>
              
              {/* Accordéon Formation sur Mobile */}
              <div>
                <button
                  onClick={() => setMobileFormationOpen(!mobileFormationOpen)}
                  className="w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Formation</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileFormationOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileFormationOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pl-4 pr-2 py-1 space-y-1 bg-slate-950/40 rounded-xl border border-slate-900/60 my-1"
                    >
                      {FORMATION_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => { setMobileMenuOpen(false); setMobileFormationOpen(false); }}
                          className="block px-3 py-2 text-[11px] font-bold text-slate-300 hover:text-cyan-400 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordéon Services sur Mobile */}
              <div>
                <button
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileServicesOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileServicesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pl-4 pr-2 py-1 space-y-1 bg-slate-950/40 rounded-xl border border-slate-900/60 my-1"
                    >
                      {SERVICES_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => { setMobileMenuOpen(false); setMobileServicesOpen(false); }}
                          className="block px-3 py-2 text-[11px] font-bold text-slate-300 hover:text-cyan-400 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-xl transition-colors">À propos</Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-xl transition-colors">Blog</Link>
              <a href="/#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-xl transition-colors">Avis</a>
              <a href="/#faq" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-xl transition-colors">FAQ</a>
              <a href="/#contact" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-xl transition-colors">Contact</a>
              
              {!isConnected ? (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-800/80">
                  <a href="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 rounded-xl font-black uppercase tracking-wider">Connexion</a>
                  <a href="/register" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center text-white bg-blue-600 hover:bg-blue-500 rounded-xl font-black uppercase tracking-wider shadow-md shadow-blue-600/20">S&apos;inscrire</a>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-800/80">
                  <a href={isAdmin ? "/admin" : "/dashboard"} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center text-white bg-blue-600 hover:bg-blue-500 rounded-xl font-black uppercase tracking-wider shadow-md shadow-blue-600/20">Mon Espace</a>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
