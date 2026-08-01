import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from '@/components/icons';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { getCertificateBadgeLogo } from '../../lib/certification-utils';
import { CertificationCard } from '@/components/ui/CertificationCard';
import { useLanguage } from '@/context/LanguageContext';

interface CertificationsSectionProps {
  realCertifications: any[];
  courses: any[];
  cleanTitle: (nom: string, code: string) => string;
}

export function CertificationsSection({ realCertifications, courses, cleanTitle }: CertificationsSectionProps) {
  const { t } = useLanguage();

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

  if (catalogCourses.length === 0) return null;
  const cert = catalogCourses[currentIndex];

  return (
    <section id="certifications" className="relative z-10 py-24 bg-[#020617] border-t border-slate-900 overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ contentVisibility: 'auto' }}>
        <img 
          src="/bg/cyber_certif_bg.png" 
          alt="Certifications background" 
          className="w-full h-full object-cover opacity-65 transform-gpu" 
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-20 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
              {t('certifications_title')}
            </span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
            {t('certifications_desc')}
          </p>
        </AnimatedSection>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {catalogCourses.length > itemsPerPage && (
            <>
              <button onClick={goPrev} aria-label="Précédent" className="absolute -left-2 sm:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-[#080d1a] border border-cyan-500 text-cyan-400 hover:bg-blue-950/30 hover:scale-110 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer">
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 ml-[-2px]" />
              </button>
              <button onClick={goNext} aria-label="Suivant" className="absolute -right-2 sm:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-[#080d1a] border border-cyan-500 text-cyan-400 hover:bg-blue-950/30 hover:scale-110 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer">
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 mr-[-2px]" />
              </button>
            </>
          )}

          {isDesktop ? (
            <div className="overflow-hidden rounded-xl py-6 -my-6">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
              >
                {catalogCourses.map((c, i) => (
                  <div key={i} className="w-1/4 shrink-0 px-3 pt-6 pb-8">
                    <CertificationCard
                      slug={c.slug}
                      nom={c.nom}
                      codeExamen={c.codeExamen}
                      logo={c.logo}
                      cleanTitle={cleanTitle}
                    />
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
                  <div className="px-4 pb-8">
                    <CertificationCard
                      slug={cert.slug}
                      nom={cert.nom}
                      codeExamen={cert.codeExamen}
                      logo={cert.logo}
                      cleanTitle={cleanTitle}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        <AnimatedSection className="flex justify-center mt-12">
          <Link 
            href="/certifications"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-3 hover:scale-105 active:scale-95 group"
          >
            <span>Voir tout le catalogue des certifications</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>

      </div>
    </section>
  );
}
