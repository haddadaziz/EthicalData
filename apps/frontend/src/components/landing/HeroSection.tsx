import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from '@/components/icons';
import Link from 'next/link';

interface HeroSectionProps {
  isConnected: boolean;
  children?: React.ReactNode;
}

export function HeroSection({ isConnected, children }: HeroSectionProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background image - hero section only */}
      <div className="absolute inset-0">
        <img src="/landing_page_logo_ethicaldata.jpeg" alt=""
          className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/70" />
      </div>

      {children}

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
  );
}
