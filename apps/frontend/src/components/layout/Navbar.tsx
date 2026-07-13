import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from '@/components/icons';

interface NavbarProps {
  scrolled: boolean;
  navVisible: boolean;
  mounted: boolean;
  isConnected: boolean;
  isAdmin: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Navbar({
  scrolled,
  navVisible,
  mounted,
  isConnected,
  isAdmin,
  mobileMenuOpen,
  setMobileMenuOpen
}: NavbarProps) {
  return (
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
          <a href="#contact" className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 hover:shadow-xs ${scrolled ? 'text-slate-600 hover:text-red-600 hover:bg-white' : 'text-white/90 hover:text-white'}`}>
            Contact
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
              href={isAdmin ? "/admin" : "/dashboard"}
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
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Contact</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
