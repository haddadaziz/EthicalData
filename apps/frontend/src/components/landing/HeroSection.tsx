import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from '@/components/icons';

interface HeroSectionProps {
  isConnected: boolean;
  children?: React.ReactNode;
}

export function HeroSection({ isConnected, children }: HeroSectionProps) {
  return (
    <section className="relative min-h-[115dvh] lg:min-h-[80vh] flex flex-col justify-between overflow-hidden bg-[#020617] text-white">
      {/* Navigation container */}
      <div className="w-full z-50">
        {children}
      </div>

      {/* Hero content - Split Screen Grid Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 lg:pt-20 pb-0 lg:pb-20 flex-grow flex flex-col lg:flex-row items-center justify-center gap-12 w-full">
        
        {/* Left Side: Headline & CTAs */}
        <div className="w-full lg:w-7/12 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 pt-0">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-tight md:leading-none drop-shadow-lg"
          >
            Ethical Data Security – L&apos;essentiel en un clic !
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-white/80 uppercase tracking-widest font-black leading-relaxed max-w-xl drop-shadow-md"
          >
            SUPPORT DE COURS ET ENTRAÎNEMENT PRATIQUE POUR VOS CERTIFICATIONS EN CYBERSÉCURITÉ ET EN SÉCURITÉ
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 w-full sm:w-auto"
          >
            <a
              href={isConnected ? "/dashboard/practice" : "/login"}
              className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-red-600/30 text-sm uppercase tracking-wider hover:scale-105 active:scale-95"
            >
              <span>Réserver un diagnostic</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Right Side: Simple Cyber Wolf Mascot Card */}
        <div className="w-full lg:w-5/12 flex items-center justify-center relative select-none mt-auto lg:mt-0 mb-0 pt-24 lg:pt-0">
          {/* Static design rings */}
          <div className="absolute w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] border border-red-500/10 rounded-full" />
          <div className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] border border-dashed border-red-500/15 rounded-full" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] rounded-2xl overflow-hidden border border-red-500/20 bg-[#080d1a] p-4 shadow-xl shadow-red-950/20 group/card"
          >
            {/* Corner tech lines */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500/50 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500/50 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-500/50 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-500/50 rounded-br-lg" />

            <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src="/images/wolf_mascot.png"
                alt="Cyber Wolf Mascot"
                className="w-[85%] h-[85%] object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-transform duration-500 ease-out hover:scale-105 cursor-pointer transform-gpu"
              />
            </div>
          </motion.div>
        </div>

      </div>

      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/logos/landing_page_logo_ethicaldata.jpeg" 
          alt="Ethical Data Background Logo" 
          className="w-full h-full object-cover opacity-80" 
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/30 to-[#020617]/70" />

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scan-laser {
            0% { transform: translate3d(0, 0vh, 0); }
            50% { transform: translate3d(0, 80vh, 0); }
            100% { transform: translate3d(0, 0vh, 0); }
          }
          .animate-scan-laser {
            animation: scan-laser 6s linear infinite;
            will-change: transform;
            backface-visibility: hidden;
          }
        `}} />

        <div 
          className="absolute top-0 left-0 w-full h-[2px] bg-red-600/80 shadow-[0_0_15px_#dc2626] animate-scan-laser pointer-events-none z-10"
        />
      </div>
    </section>
  );
}
