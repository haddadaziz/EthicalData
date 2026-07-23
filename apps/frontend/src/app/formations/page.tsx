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
    titre: 'Microsoft Azure Fundamentals (AZ-900) - Le Guide Complet',
    description: 'Formation complète sur les concepts du Cloud Azure, les services d’infrastructure (IaaS/PaaS/SaaS), la sécurité Entra ID et le calcul des coûts.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    dureeEstimee: 120,
    certification: {
      nom: 'Microsoft Azure Fundamentals',
      codeExamen: 'AZ-900',
      fournisseur: { nom: 'Microsoft' },
    },
    _count: { modules: 8, inscriptions: 1420 },
  },
  {
    id: 'aws-saa-course-seed',
    titre: 'AWS Solutions Architect Associate (SAA-C03) - Masterclass',
    description: 'Concevez des architectures résilientes, hautement disponibles et optimisées en coûts sur Amazon Web Services.',
    imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=80',
    dureeEstimee: 180,
    certification: {
      nom: 'AWS Certified Solutions Architect Associate',
      codeExamen: 'SAA-C03',
      fournisseur: { nom: 'AWS' },
    },
    _count: { modules: 12, inscriptions: 980 },
  },
  {
    id: 'comptia-course-seed',
    titre: 'CompTIA Security+ (SY0-701) - BootCamp Cybersécurité',
    description: 'Les fondations de la cybersécurité opérationnelle : gestion des menaces, cryptographie, gestion des accès et prévention des attaques.',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    dureeEstimee: 170,
    certification: {
      nom: 'CompTIA Security+',
      codeExamen: 'SY0-701',
      fournisseur: { nom: 'CompTIA' },
    },
    _count: { modules: 11, inscriptions: 890 },
  },
  {
    id: 'gcp-course-seed',
    titre: 'Google Cloud Digital Leader & Associate Cloud Engineer',
    description: 'Maîtrisez les services Google Cloud Platform (Compute Engine, BigQuery, GKE, IAM) et préparez la certification officielle.',
    imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
    dureeEstimee: 160,
    certification: {
      nom: 'Google Cloud Associate Cloud Engineer',
      codeExamen: 'GCP-ACE',
      fournisseur: { nom: 'Google Cloud Platform' },
    },
    _count: { modules: 9, inscriptions: 650 },
  },
  {
    id: 'aws-clf-course-seed',
    titre: 'AWS Certified Cloud Practitioner (CLF-C02) - Essentiels',
    description: 'Comprenez l’écosystème Amazon Web Services (S3, EC2, IAM, CloudFront, VPC) et révisez avec les corrigés détaillés d’examen blanc.',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    dureeEstimee: 150,
    certification: {
      nom: 'AWS Certified Cloud Practitioner',
      codeExamen: 'CLF-C02',
      fournisseur: { nom: 'AWS' },
    },
    _count: { modules: 10, inscriptions: 1150 },
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
      c.certification?.fournisseur?.nom?.toUpperCase().includes(selectedProvider.toUpperCase());
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
            {['TOUS', 'MICROSOFT', 'AWS', 'COMPTIA', 'GOOGLE'].map((provider) => (
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
                className="bg-[#080d1a] border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden flex flex-col justify-between transition-all shadow-xl hover:shadow-cyan-950/20 group"
              >
                {/* Banner Image */}
                {c.imageUrl && (
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={c.imageUrl}
                      alt={c.titre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-transparent to-transparent opacity-80" />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
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
              </div>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </main>
  );
}
