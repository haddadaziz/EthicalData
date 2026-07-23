'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BookOpen, Clock, Search, ArrowRight, Tag } from '@/components/icons';

export const ARTICLES = [
  {
    slug: 'comment-reussir-examen-az-900-azure-fundamentals-2026',
    title: 'Comment réussir l’examen Microsoft Azure AZ-900 en 2026',
    category: 'Azure',
    categoryClass: 'bg-blue-600/20 text-cyan-400 border-blue-500/30',
    readTime: '6 min',
    date: '20 Juil. 2026',
    author: 'Thomas Dupont (Lead Cloud Architect)',
    summary: 'Découvrez notre méthodologie éprouvée et nos astuces pour valider la certification Azure Fundamentals du premier coup sans perdre de temps.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    content: `
      L'examen Microsoft Azure AZ-900 est la porte d'entrée idéale pour prouver votre compréhension des concepts fondamentaux du Cloud public. Que vous soyez débutant ou professionnel de l'IT souhaitant formaliser vos acquis, cette certification est reconnue dans le monde entier.

      ### 1. Comprendre la structure du programme AZ-900
      L'examen couvre trois grands domaines clés :
      - **Les concepts du Cloud (25-30%)** : IaaS, PaaS, SaaS, Cloud hybride et avantages financiers (CapEx vs OpEx).
      - **L'architecture et les services Azure (35-40%)** : Régions, zones de disponibilité, machines virtuelles, stockage Blob et réseaux virtuels (VNet).
      - **La gestion et la gouvernance Azure (30-35%)** : Azure Policy, Cost Management, RBAC et sécurité avec Entra ID.

      ### 2. Conseils pratiques pour le jour J
      Pratiquez régulièrement sur des questions de préparation types et lisez attentivement les corrigés explicatifs. Prenez le temps de tester les services directement sur le portail Azure pour ancrer vos connaissances théoriques.
    `,
  },
  {
    slug: 'guide-complet-certification-pecb-iso-27001-lead-implementer',
    title: 'Guide complet : Obtenir la certification PECB ISO 27001 Lead Implementer',
    category: 'ISO & Sécurité',
    categoryClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    readTime: '8 min',
    date: '18 Juil. 2026',
    author: 'Aziz Haddad (Formateur Cybersécurité)',
    summary: 'Tout ce qu’il faut savoir sur le système de management de la sécurité de l’information (SMSI), l’analyse des risques et la préparation à l’examen officiel.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    content: `
      La norme ISO/IEC 27001 est la référence internationale incontournable pour la gestion de la sécurité de l'information. La qualification Lead Implementer délivrée par la PECB certifie votre capacité à mettre en œuvre un SMSI complet au sein d'une organisation.

      ### Les étapes clés de la mise en œuvre :
      1. **Définition du périmètre du SMSI** : Identification des actifs critiques et des exigences réglementaires.
      2. **Appréciation et traitement des risques** : Choix des mesures de sécurité dans la norme ISO 27002.
      3. **Audit interne et revue de direction** : Vérification de la conformité et amélioration continue.
    `,
  },
  {
    slug: 'top-5-certifications-cloud-et-cybersecurite-les-plus-demandees',
    title: 'Top 5 des certifications Cloud & Cybersécurité les plus valorisées en 2026',
    category: 'Carrière IT',
    categoryClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    readTime: '5 min',
    date: '15 Juil. 2026',
    author: 'Équipe EthicalData',
    summary: 'Analyse des compétences IT les plus recherchées par les entreprises et les cabinets de recrutement cette année pour propulser votre carrière.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    content: `
      Le marché des technologies de l'information connaît une demande record d'experts qualifiés. Voici notre sélection des certifications clés pour faire la différence sur le marché du travail :
      
      1. **Microsoft AZ-900 / AZ-104** (Architecture Cloud Azure)
      2. **PECB ISO 27001 Lead Implementer** (Gouvernance & SMSI)
      3. **AWS Certified Solutions Architect** (Cloud AWS)
      4. **Palo Alto Networks PCNSA** (Sécurité Réseau & Pare-feu)
      5. **CompTIA Security+** (Fondations Cybersécurité)
    `,
  },
];

export default function BlogPublicPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TOUS');

  const filteredArticles = ARTICLES.filter((a) => {
    const matchSearch =
      !searchTerm.trim() ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === 'TOUS' || a.category.toUpperCase().includes(selectedCategory.toUpperCase());
    return matchSearch && matchCategory;
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      <div className="pt-28 pb-20 relative z-10 max-w-7xl mx-auto px-4 md:px-6 text-left space-y-12">
        
        {/* HERO HEADER */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-cyan-400 text-xs font-black uppercase tracking-wider">
            <span>Blog & Conseils Examens IT</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Articles, Guides & Actualités Certifications
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Conseils de préparation, méthodes de révision et actualités du monde du Cloud et de la Cybersécurité rédigés par nos formateurs experts.
          </p>
        </div>

        {/* BARRE DE RECHERCHE ET CATÉGORIES */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#080d1a] border border-slate-800 p-4 rounded-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un article, un sujet..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-white placeholder-slate-500 text-xs font-semibold outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
            {['TOUS', 'AZURE', 'ISO', 'CARRIÈRE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600/20 text-cyan-400 border-cyan-500/50'
                    : 'bg-[#020617] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GRILLE DES ARTICLES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredArticles.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-[#080d1a] border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col shadow-xl hover:shadow-cyan-950/20"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-transparent to-transparent opacity-80" />
                <span className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${post.categoryClass}`}>
                  {post.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {post.readTime}
                    </span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>

                  <h2 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-white transition-colors">
                  <span>Lire l’article</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      <Footer />
    </main>
  );
}
