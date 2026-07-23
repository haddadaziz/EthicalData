'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ARTICLES } from '../page';
import { ArrowLeft, Clock, MessageSquare, ArrowRight, BookOpen, Share2, CheckCircle } from '@/components/icons';

export default function BlogArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const article = ARTICLES.find((a) => a.slug === slug) || ARTICLES[0];

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      <div className="pt-28 pb-20 relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-left space-y-10">
        
        {/* BOUTON RETOUR */}
        <button
          onClick={() => router.push('/blog')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#080d1a] hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Retour aux articles</span>
        </button>

        {/* EN-TÊTE ARTICLE */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${article.categoryClass}`}>
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {article.readTime} de lecture
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">{article.date}</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-xs text-slate-400 font-semibold">
            Par <span className="text-white">{article.author}</span>
          </p>
        </div>

        {/* IMAGE VEDETTE */}
        <div className="relative h-64 md:h-96 w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
        </div>

        {/* CORPS DE L'ARTICLE */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 md:p-10 space-y-6 text-slate-300 text-sm leading-relaxed">
          <p className="font-semibold text-base text-white">
            {article.summary}
          </p>

          <div className="border-t border-slate-800 pt-6 space-y-4 whitespace-pre-line font-normal text-slate-300">
            {article.content}
          </div>
        </div>

        {/* PASSERELLE VERS LA COMMUNAUTÉ (CTA FORUM) */}
        <div className="bg-gradient-to-br from-[#080d1a] via-[#0b1329] to-[#020617] border border-blue-900/50 rounded-3xl p-8 space-y-6 shadow-2xl text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Une question sur cet article ou cet examen ?</h3>
              <p className="text-xs text-slate-400">Rejoignez la discussion avec nos formateurs et les autres candidats sur le forum.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/dashboard/community"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Accéder au Forum de la Communauté</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/coaching"
              className="px-6 py-3 bg-[#020617] hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Réserver un coaching personnalisé
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
