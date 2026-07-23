'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Users, ArrowRight, ShieldCheck } from '@/components/icons';

const FEATURED_COURSES = [
  {
    id: 'az-900-course',
    titre: 'Formation complète Microsoft Azure Fundamentals (AZ-900)',
    provider: 'Microsoft',
    badgeClass: 'bg-blue-600/20 text-cyan-400 border-blue-500/30',
    dureeEstimee: 120,
    modulesCount: 8,
    studentsCount: 1420,
    description: 'Apprenez les bases indispensables du Cloud Microsoft Azure, la gestion des sous-réseaux, la sécurité Entra ID et le calcul du TCO.',
    logo: '/logos/microsoft.png',
  },
  {
    id: 'iso-27001-course',
    titre: 'Mise en œuvre du SMSI selon ISO/IEC 27001 Lead Implementer',
    provider: 'PECB',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dureeEstimee: 180,
    modulesCount: 12,
    studentsCount: 980,
    description: 'Maîtrisez la gestion des risques de sécurité de l’information, les politiques de sécurité et les règles d’audit officiel PECB.',
    logo: '/logos/pecb.png',
  },
  {
    id: 'aws-clf-course',
    titre: 'Préparation AWS Certified Cloud Practitioner (CLF-C02)',
    provider: 'AWS',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    dureeEstimee: 150,
    modulesCount: 10,
    studentsCount: 1150,
    description: 'Comprenez l’architecture globale Amazon Web Services (S3, EC2, IAM, VPC) et préparez l’examen blanc officiel avec corrigés.',
    logo: '/logos/aws.png',
  },
];

export function CoursesPreviewSection() {
  return (
    <section className="py-20 relative z-10 bg-[#020617] border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 text-left">
        
        {/* Header de section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <span>Programmes & Cours de Formation</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              Aperçu des Cours & Formations Interactives
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Consultez nos modules de cours structurés, conçus pour vous faire progresser pas à pas et valider vos examens professionnels.
            </p>
          </div>

          <Link
            href="/formations"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#080d1a] hover:bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm shrink-0 cursor-pointer self-start md:self-auto"
          >
            <span>Voir tout le catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grille des 3 cours vedettes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {FEATURED_COURSES.map((course) => (
            <div
              key={course.id}
              className="bg-[#080d1a] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between space-y-5 transition-all shadow-xl hover:shadow-cyan-950/20 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border ${course.badgeClass}`}>
                    {course.provider}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {course.dureeEstimee} min
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                  {course.titre}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    {course.modulesCount} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    {course.studentsCount} apprenants
                  </span>
                </div>

                <Link
                  href="/register"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Rejoindre la formation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* BANNIÈRE CTA INVITATION REJOINDRE */}
        <div className="bg-gradient-to-r from-blue-950/80 via-[#080d1a] to-blue-950/80 border border-slate-800 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-black text-white">
              Prêt à booster vos compétences IT et valider vos examens ?
            </h3>
            <p className="text-xs md:text-sm text-slate-300">
              Inscrivez-vous gratuitement pour accéder aux cours interactifs, aux examens blancs et à la communauté.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/register"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Créer un compte gratuit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
