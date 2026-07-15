import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from '@/components/icons';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { getCertificateBadgeLogo } from '../../lib/certification-utils';

interface CertificationsSectionProps {
  realCertifications: any[];
  courses: any[];
  cleanTitle: (nom: string, code: string) => string;
}

export function CertificationsSection({ realCertifications, courses, cleanTitle }: CertificationsSectionProps) {
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

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const itemsPerPage = isDesktop ? 4 : 1;
  const maxIndex = Math.max(0, catalogCourses.length - itemsPerPage);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused || catalogCourses.length <= itemsPerPage) return;
    const timer = setInterval(goNext, 4000);
    return () => clearInterval(timer);
  }, [isPaused, goNext, catalogCourses.length, itemsPerPage]);

  const cert = catalogCourses[currentIndex];
  if (catalogCourses.length === 0) return null;

  return (
    <section id="formations" className="relative z-10 w-full bg-[#020617] border-t border-slate-900 py-20 overflow-hidden">
      
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ contentVisibility: 'auto' }}>
        <img 
          src="/cyber_hero_bg.png" 
          alt="Cyber security background texture" 
          className="w-full h-full object-cover opacity-65 transform-gpu" 
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Offres phares</span>
          <h2 className="text-3xl font-black text-white mt-3 uppercase tracking-tight">Certifications</h2>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed font-semibold">
            Sélectionnez votre parcours, entraînez-vous sur nos simulateurs et décrochez votre certification internationale.
          </p>
        </AnimatedSection>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {catalogCourses.length > itemsPerPage && (
            <>
              <button onClick={goPrev} className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-12 lg:h-12 bg-[#080d1a] border border-red-500 text-red-500 hover:bg-red-950/30 hover:scale-110 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer">
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 ml-[-2px]" />
              </button>
              <button onClick={goNext} className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-12 lg:h-12 bg-[#080d1a] border border-red-500 text-red-500 hover:bg-red-950/30 hover:scale-110 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer">
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 mr-[-2px]" />
              </button>
            </>
          )}

          {isDesktop ? (
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
              >
                {catalogCourses.map((c, i) => (
                  <div key={i} className="w-1/4 shrink-0 px-3">
                    <Link href={`/certifications/${c.slug}`} className="flex flex-col group cursor-pointer">
                      <div className="relative w-full h-[340px] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-red-950/40 group-hover:shadow-2xl bg-[#0a0f1d] border border-slate-900">
                        <img src="/logos/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" decoding="async" />
                        {c.codeExamen && (
                          <div className="absolute top-4 left-4 z-30">
                            <div className="bg-slate-900/80 backdrop-blur-md text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-700/50 shadow-sm flex items-center group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                              {c.codeExamen}
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 group-hover:-translate-y-2 transition-transform duration-500 w-32 flex justify-center">
                          {c.logo ? (
                            <img src={c.logo} alt="Badge" className="w-full h-auto object-contain filter drop-shadow-xl" loading="lazy" decoding="async" />
                          ) : (
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center font-bold text-white border border-slate-800">Badge</div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col gap-2 px-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-[13px] font-bold text-slate-200 group-hover:text-white leading-snug line-clamp-2 flex-1">
                            {cleanTitle(c.nom, c.codeExamen)}
                          </h3>
                          <div className="px-3 py-1.5 shrink-0 bg-red-600 border border-red-600 rounded-lg flex items-center justify-center text-white transition-colors shadow-sm hover:bg-red-700 hover:border-red-700 group-hover:bg-red-700 group-hover:border-red-700 text-[10px] font-bold uppercase tracking-wider">
                            Voir plus
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative max-w-lg mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Link href={`/certifications/${cert.slug}`} className="flex flex-col group cursor-pointer">
                    <div className="relative w-full h-[380px] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-red-950/40 group-hover:shadow-2xl bg-[#0a0f1d] border border-slate-900">
                      <img src="/logos/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" decoding="async" />
                      {cert.codeExamen && (
                        <div className="absolute top-4 left-4 z-30">
                          <div className="bg-slate-900/80 backdrop-blur-md text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-700/50 shadow-sm flex items-center group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                            {cert.codeExamen}
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 group-hover:-translate-y-2 transition-transform duration-500 w-32 flex justify-center">
                        {cert.logo ? (
                          <img src={cert.logo} alt="Badge" className="w-full h-auto object-contain filter drop-shadow-xl" loading="lazy" decoding="async" />
                        ) : (
                          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center font-bold text-white border border-slate-800">Badge</div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 px-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-slate-200 group-hover:text-white leading-snug line-clamp-2 flex-1">
                          {cleanTitle(cert.nom, cert.codeExamen)}
                        </h3>
                        <div className="px-3 py-1.5 shrink-0 bg-red-600 border border-red-600 rounded-lg flex items-center justify-center text-white transition-colors shadow-sm hover:bg-red-700 hover:border-red-700 group-hover:bg-red-700 group-hover:border-red-700 text-[10px] font-bold uppercase tracking-wider">
                          Voir plus
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        <AnimatedSection className="flex justify-center mt-12">
          <Link 
            href="/certifications"
            className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-red-600/20 transition-all cursor-pointer flex items-center gap-3 hover:scale-105 active:scale-95 group"
          >
            <span>Voir tout le catalogue des certifications</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>

      </div>
    </section>
  );
}
