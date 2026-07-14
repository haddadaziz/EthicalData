import React from 'react';
import Link from 'next/link';
import { ArrowRight } from '@/components/icons';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { getCertificateBadgeLogo } from '../../lib/certification-utils';

interface CertificationsSectionProps {
  realCertifications: any[];
  courses: any[];
  setSelectedCourse: (course: any) => void;
  cleanTitle: (nom: string, code: string) => string;
}

export function CertificationsSection({ realCertifications, courses, setSelectedCourse, cleanTitle }: CertificationsSectionProps) {
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

  return (
    <section id="formations" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/60">
      
      <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Offres phares</span>
        <h2 className="text-3xl font-black text-slate-950 mt-3 uppercase tracking-tight">Certifications</h2>
        <p className="text-sm text-slate-600 mt-4 leading-relaxed font-semibold">
          Sélectionnez votre parcours, entraînez-vous sur nos simulateurs et décrochez votre certification internationale.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedCourses.map((cert, idx) => (
          <AnimatedSection key={idx} delay={idx * 0.08}>
            <div 
              onClick={() => setSelectedCourse(cert)}
              className="flex flex-col group cursor-pointer"
            >
              <div className="relative w-full h-[340px] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-blue-900/30 group-hover:shadow-2xl">
                
                <img src="/logos/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0" />

                {cert.codeExamen && (
                  <div className="absolute top-4 left-4 z-30">
                    <div className="bg-slate-900/80 backdrop-blur-md text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-700/50 shadow-sm flex items-center group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                      {cert.codeExamen}
                    </div>
                  </div>
                )}

                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 group-hover:-translate-y-2 transition-transform duration-500 w-32 flex justify-center">
                  {cert.logo ? (
                    <img src={cert.logo} alt="Badge" className="w-full h-auto object-contain filter drop-shadow-xl" />
                  ) : (
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center font-bold text-slate-800">Badge</div>
                  )}
                </div>

              </div>

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

      <AnimatedSection className="flex justify-center mt-12">
        <Link 
          href="/certifications"
          className="px-8 py-3.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-3 hover:scale-105 active:scale-95 group"
        >
          <span>Voir tout le catalogue des certifications</span>
          <ArrowRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      </AnimatedSection>

    </section>
  );
}
