'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useScroll, useTransform, motion } from 'framer-motion';
import { ArrowRight, Clock } from '@/components/icons';

const BLOG_POSTS = [
  {
    slug: 'comment-reussir-examen-az-900-azure-fundamentals-2026',
    title: 'Comment réussir l’examen Microsoft Azure AZ-900 en 2026',
    category: 'Cloud Azure',
    categoryClass: 'bg-blue-600/20 text-cyan-400 border border-blue-500/30',
    readTime: '6 min',
    date: '20 Juil. 2026',
    summary: 'Découvrez notre méthodologie éprouvée et nos astuces pour valider la certification Azure Fundamentals du premier coup.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
  },
  {
    slug: 'guide-complet-certification-pecb-iso-27001-lead-implementer',
    title: 'Guide complet : Obtenir la certification PECB ISO 27001 Lead Implementer',
    category: 'ISO & Sécurité',
    categoryClass: 'bg-blue-600/20 text-cyan-400 border border-blue-500/30',
    readTime: '8 min',
    date: '18 Juil. 2026',
    summary: 'Tout ce qu’il faut savoir sur le système de management de la sécurité de l’information (SMSI) et la structure de l’examen.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
  },
  {
    slug: 'top-5-certifications-cloud-et-cybersecurite-les-plus-demandees',
    title: 'Top 5 des certifications Cloud & Cybersécurité les plus valorisées',
    category: 'Carrière IT',
    categoryClass: 'bg-blue-600/20 text-cyan-400 border border-blue-500/30',
    readTime: '5 min',
    date: '15 Juil. 2026',
    summary: 'Analyse des compétences IT les plus recherchées par les entreprises et les cabinets de recrutement cette année.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  },
];

export function BlogPreviewSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.5], [0, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.5], [0.05, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.5], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.5], [0.15, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.5], [0.2, 1.2]);

  return (
    <section ref={ref} className="relative z-10 bg-[#020617] border-t border-slate-900 py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-10 md:space-y-12 relative z-10">
        
        {/* Header Block with Floating Google Gemini SVG Laser Trace (No Card Div Background) */}
        <div className="relative py-10 px-4 max-w-4xl mx-auto text-center space-y-3">
          
          {/* Focused SVG Laser Animation Layer */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-85 pointer-events-none">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1000 260"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <motion.path
                d="M 50 30 Q 300 130 500 130 T 950 230"
                stroke="#2563eb"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ pathLength: pathLengthFirst }}
              />
              <motion.path
                d="M 50 70 Q 350 140 500 130 T 950 190"
                stroke="#06b6d4"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ pathLength: pathLengthSecond }}
              />
              <motion.path
                d="M 50 110 Q 400 150 500 130 T 950 150"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{ pathLength: pathLengthThird }}
              />
              <motion.path
                d="M 50 150 Q 450 140 500 130 T 950 110"
                stroke="#1d4ed8"
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{ pathLength: pathLengthFourth }}
              />
              <motion.path
                d="M 50 190 Q 500 130 500 130 T 950 60"
                stroke="#60a5fa"
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{ pathLength: pathLengthFifth }}
              />
            </svg>
          </div>

          <div className="relative z-10 space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                Derniers Articles & Astuces de Révision
              </span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
              Retrouvez nos conseils d'experts pour préparer vos examens officiels et propulser votre carrière IT.
            </p>
          </div>
        </div>

        {/* Sous-Titre "Articles populaires" + Bouton "Voir tous les articles" */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-4 border-t border-slate-800/60">
          <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider text-left">
            Articles populaires
          </h3>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#080d1a] hover:bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm shrink-0 cursor-pointer w-full sm:w-auto"
          >
            <span>Voir tous les articles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grille des 3 articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-[#080d1a]/90 backdrop-blur-md border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col shadow-xl hover:shadow-cyan-950/20"
            >
              {/* Image d'illustration */}
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

              {/* Contenu */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {post.readTime} de lecture
                    </span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-white transition-colors">
                  <span>Lire l’article complet</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
