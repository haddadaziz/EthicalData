import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap } from '@/components/icons';
import { useLanguage } from '@/context/LanguageContext';

interface HeroSectionProps {
  isConnected: boolean;
  children?: React.ReactNode;
}

export function HeroSection({ isConnected, children }: HeroSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen lg:min-h-[85vh] flex flex-col justify-between overflow-hidden bg-[#020617] text-white">
      {/* Navigation container */}
      <div className="w-full z-50">
        {children}
      </div>

      {/* Hero content - Split Screen Grid Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 lg:pt-16 pb-12 lg:pb-20 flex-grow flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 w-full">
        
        {/* Left Side: Headline & CTAs */}
        <div className="w-full lg:w-7/12 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 pt-0">
          
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>ETHICAL DATA SECURITY — Plateforme Cybersécurité</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-black tracking-tight text-white uppercase leading-tight md:leading-tight drop-shadow-xl"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              {t('hero_title')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-2xl drop-shadow-md"
          >
            {t('hero_subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 w-full sm:w-auto"
          >
            <a
              href={isConnected ? "/dashboard/practice" : "/login"}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-cyan-950/50 text-xs sm:text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transform-gpu"
            >
              <span>{t('hero_cta')}</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </a>
          </motion.div>
        </div>

        {/* Right Side: Cyber Wolf Mascot Visual (Légère animation au chargement & hover) */}
        <div className="w-full lg:w-5/12 flex items-center justify-center relative select-none mt-6 lg:mt-0 pt-2 lg:pt-0">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none transform-gpu" />

          {/* Animated Tech Rings */}
          <div className="absolute w-[260px] h-[260px] sm:w-[350px] sm:h-[350px] border border-cyan-500/20 rounded-full animate-cyber-spin pointer-events-none" />
          <div className="absolute w-[210px] h-[210px] sm:w-[290px] sm:h-[290px] border border-dashed border-cyan-400/25 rounded-full pointer-events-none" />

          {/* Mascot Hologram Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="relative z-10 w-[240px] h-[240px] sm:w-[330px] sm:h-[330px] rounded-3xl border border-cyan-500/30 bg-[#080d1a]/90 backdrop-blur-md p-4 shadow-2xl shadow-cyan-950/60 group/card transform-gpu animate-cyber-float"
          >
            {/* Corner Tech Anchors */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/70 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400/70 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400/70 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400/70 rounded-br-xl" />

            {/* Inner Container with Cyber Wolf */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#020617] flex items-center justify-center border border-slate-800/80">
              <img
                src="/images/wolf_mascot.png"
                alt="Cyber Wolf Mascot Ethical Data Security"
                className="w-[88%] h-[88%] object-contain drop-shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-transform duration-500 ease-out group-hover/card:scale-105 transform-gpu cursor-pointer"
                decoding="async"
              />
            </div>
          </motion.div>
        </div>

      </div>

      {/* Background image & Light GPU Keyframes */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/logos/landing_page_logo_ethicaldata.jpeg" 
          alt="Ethical Data Background Logo" 
          className="w-full h-full object-cover opacity-70" 
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/70 via-[#020617]/50 to-[#020617]/90" />

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes cyber-float {
            0%, 100% { transform: translate3d(0, 0px, 0); }
            50% { transform: translate3d(0, -8px, 0); }
          }
          @keyframes cyber-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-cyber-float {
            animation: cyber-float 5s ease-in-out infinite;
            will-change: transform;
            backface-visibility: hidden;
          }
          .animate-cyber-spin {
            animation: cyber-spin 35s linear infinite;
            will-change: transform;
            backface-visibility: hidden;
          }
        `}} />
      </div>
    </section>
  );
}
