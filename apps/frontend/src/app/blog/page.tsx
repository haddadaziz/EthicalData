'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BookOpen, Clock, Search, ArrowRight, Tag } from '@/components/icons';
import { ARTICLES } from '@/lib/blog-data';

export default function BlogPublicPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TOUS');

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesSearch =
      !searchTerm.trim() ||
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'TOUS' ||
      art.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
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
            {['TOUS', 'AZURE', 'ISO', 'PALO ALTO'].map((cat) => (
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
