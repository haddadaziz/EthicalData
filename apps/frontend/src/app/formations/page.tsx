'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BookOpen, Clock, Users, Search, ArrowRight, Award, CheckCircle, ShieldCheck } from '@/components/icons';
import { apiFetch } from '@/lib/api';

interface Course {
  id: string;
  titre: string;
  description?: string;
  imageUrl?: string;
  dureeEstimee?: number;
  certification?: {
    nom: string;
    codeExamen?: string;
    fournisseur?: { nom: string };
  };
  formateur?: {
    prenom: string;
    nom: string;
  };
  _count?: {
    inscriptions: number;
    modules: number;
  };
}

const SEEDED_COURSES: Course[] = [
  {
    id: 'az900-course-seed',
    titre: 'Microsoft Azure Fundamentals (AZ-900)',
    description: 'Formation complète sur les concepts du Cloud Azure, les services d’infrastructure (IaaS/PaaS/SaaS), la sécurité Entra ID et le calcul des coûts.',
    dureeEstimee: 120,
    certification: {
      nom: 'Microsoft Azure Fundamentals',
      codeExamen: 'AZ-900',
      fournisseur: { nom: 'Microsoft' },
    },
    _count: { modules: 8, inscriptions: 1420 },
  },
  {
    id: 'iso27001-course-seed',
    titre: 'PECB ISO 27001 Lead Implementer',
    description: 'Apprenez à déployer et piloter un Système de Management de la Sécurité de l’Information (SMSI) conforme aux normes ISO/IEC 27001 & 27002.',
    dureeEstimee: 180,
    certification: {
      nom: 'PECB ISO 27001 Lead Implementer',
      codeExamen: 'ISO-27001',
      fournisseur: { nom: 'PECB' },
    },
    _count: { modules: 12, inscriptions: 980 },
  },
  {
    id: 'aws-clf-course-seed',
    titre: 'AWS Certified Cloud Practitioner (CLF-C02)',
    description: 'Comprenez l’écosystème Amazon Web Services (S3, EC2, IAM, CloudFront, VPC) et révisez avec les corrigés détaillés d’examen blanc.',
    dureeEstimee: 150,
    certification: {
      nom: 'AWS Certified Cloud Practitioner',
      codeExamen: 'CLF-C02',
      fournisseur: { nom: 'AWS' },
    },
    _count: { modules: 10, inscriptions: 1150 },
  },
  {
    id: 'paloalto-course-seed',
    titre: 'Palo Alto Networks Certified Network Security (PCNSA)',
    description: 'Configuration avancée et administration des pare-feu de nouvelle génération (NGFW) Palo Alto Networks pour entreprises.',
    dureeEstimee: 160,
    certification: {
      nom: 'Palo Alto Networks Certified Network Security',
      codeExamen: 'PCNSA',
      fournisseur: { nom: 'Palo Alto Networks' },
    },
    _count: { modules: 9, inscriptions: 760 },
  },
  {
    id: 'comptia-course-seed',
    titre: 'CompTIA Security+ (SY0-701)',
    description: 'Les fondations de la cybersécurité opérationnelle : gestion des menaces, cryptographie, gestion des accès et prévention des attaques.',
    dureeEstimee: 170,
    certification: {
      nom: 'CompTIA Security+',
      codeExamen: 'SY0-701',
      fournisseur: { nom: 'CompTIA' },
    },
    _count: { modules: 11, inscriptions: 890 },
  },
  {
    id: 'fortinet-course-seed',
    titre: 'Fortinet Network Security Associate (NSE 4)',
    description: 'Déploiement et sécurisation de l’infrastructure réseau avec les solutions FortiGate et FortiOS.',
    dureeEstimee: 190,
    certification: {
      nom: 'Fortinet Network Security Associate',
      codeExamen: 'NSE 4',
      fournisseur: { nom: 'Fortinet' },
    },
    _count: { modules: 14, inscriptions: 620 },
  },
];

export default function FormationsPublicPage() {
  const [courses, setCourses] = useState<Course[]>(SEEDED_COURSES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('TOUS');

  useEffect(() => {
    document.title = "Catalogue des Formations - Ethical Data Security";
    apiFetch('/cours')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      !searchTerm.trim() ||
      c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certification?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProvider =
      selectedProvider === 'TOUS' ||
      c.certification?.fournisseur?.nom?.toUpperCase() === selectedProvider.toUpperCase();
    return matchSearch && matchProvider;
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      <div className="pt-28 pb-16 relative z-10 max-w-7xl mx-auto px-4 md:px-6 text-left space-y-10">
        
        {/* HERO EN-TÊTE */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-cyan-400 text-xs font-black uppercase tracking-wider">
            <span>Catalogue de cours et formations</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Formations & Cours d’Préparation IT
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Explorez nos programmes de formation complets conçus par des experts certifiés. Maîtrisez les concepts clés et réussissez vos certifications Cloud, Cybersécurité et ISO.
          </p>
        </div>

        {/* FILTRES & RECHERCHE */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#080d1a] border border-slate-800 p-4 rounded-2xl">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un cours, un examen (AZ-900, ISO 27001...)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-white placeholder-slate-500 text-xs font-semibold outline-none"
            />
          </div>

          {/* Filtre Constructeur */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
            {['TOUS', 'MICROSOFT', 'PECB', 'AWS', 'PALO ALTO'].map((provider) => (
              <button
                key={provider}
                onClick={() => setSelectedProvider(provider)}
                className={`px-3 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                  selectedProvider === provider
                    ? 'bg-blue-600/20 text-cyan-400 border-cyan-500/50'
                    : 'bg-[#020617] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        {/* GRILLE DES COURS */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <span className="w-8 h-8 border-4 border-slate-800 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Chargement des formations...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-16 bg-[#080d1a] border border-slate-800 rounded-3xl text-center space-y-3 p-8">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Aucune formation trouvée</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Essayez de modifier votre terme de recherche ou le filtre de constructeur.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="bg-[#080d1a] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between space-y-5 transition-all shadow-xl hover:shadow-cyan-950/20 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-blue-600/20 text-cyan-400 border border-blue-500/30 rounded-full">
                      {c.certification?.fournisseur?.nom || 'Formation IT'}
                    </span>
                    {c.dureeEstimee && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {c.dureeEstimee} min
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                    {c.titre}
                  </h3>

                  {c.description && (
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      {c._count?.modules || 0} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {c._count?.inscriptions || 0} inscrits
                    </span>
                  </div>

                  <Link
                    href="/dashboard/cours"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Accéder à la formation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </main>
  );
}
