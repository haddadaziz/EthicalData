"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from '@/components/icons';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Auth logic
    setMounted(true);
    const token = localStorage.getItem('access_token');
    if (token) {
        setIsConnected(true);
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setIsAdmin(payload.roles?.includes('ADMIN') || payload.roles?.includes('SUPER_ADMIN'));
        } catch { }
    }

    // Scroll logic
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-[#020617] border-b border-slate-900 shadow-sm' : 'bg-transparent border-b border-transparent'} ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* White Logo for dark background */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
          <div className="flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-10 md:h-8 w-auto object-contain" />
          </div>
        </Link>

        {/* Navigation PC : Capsule Pill Flottante Ultra Stylée */}
        <nav className={`hidden md:flex items-center gap-1 rounded-full px-3 py-1.5 transition-all duration-300 ${scrolled ? 'bg-slate-950/60 border border-slate-900' : 'bg-transparent border-0'}`}>
          <a href="/#about" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
            Qui Sommes-Nous
          </a>
          <Link href="/certifications" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
            Certifications
          </Link>
          <a href="/#services" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
            Nos Services
          </a>
          <a href="/#testimonials" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
            Avis
          </a>
          <a href="/#faq" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
            FAQ
          </a>
          <a href="/#contact" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${scrolled ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/40' : 'text-white/90 hover:text-white'}`}>
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
              className="px-3 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-blue-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-[10px] md:text-xs font-black uppercase tracking-wider rounded-lg md:rounded-xl transition-all shadow-md shadow-blue-600/30 cursor-pointer hover:scale-105 active:scale-95"
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

          {/* Menu Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-1.5 cursor-pointer rounded-lg transition-all ${scrolled ? 'text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800' : 'text-white/80 hover:text-white bg-transparent border-0'}`}
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
            className="md:hidden border-t border-slate-900 bg-[#020617]/95 overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-1 text-xs font-black uppercase tracking-widest">
              <a href="/#about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/40 rounded-xl">Qui Sommes-Nous</a>
              <Link href="/certifications" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/40 rounded-xl">Certifications</Link>
              <a href="/#services" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/40 rounded-xl">Nos Services</a>
              <a href="/#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/40 rounded-xl">Avis</a>
              <a href="/#faq" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/40 rounded-xl">FAQ</a>
              <a href="/#contact" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/40 rounded-xl">Contact</a>
              
              {!isConnected && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-800">
                  <a href="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center text-slate-300 hover:text-white bg-slate-900/50 rounded-xl font-black uppercase tracking-wider">Connexion</a>
                  <a href="/register" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-black uppercase tracking-wider">S&apos;inscrire</a>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
