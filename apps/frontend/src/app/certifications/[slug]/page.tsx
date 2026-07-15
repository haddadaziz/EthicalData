"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { ChevronRight, Clock, Award, BookOpen, Target, CheckCircle2, Play, Menu, X } from '@/components/icons';
import { Footer } from '@/components/layout/Footer';

interface Module {
  id: number;
  titre: string;
  description?: string;
  ordre: number;
  icon?: string;
  sousModules: Module[];
}

interface Certification {
  id: number;
  nom: string;
  slug: string;
  codeExamen?: string;
  description: string;
  niveau: string;
  dureeIndicative?: string;
  objectifs: string[];
  prerequis: string[];
  image?: string;
  fournisseur: { id: number; nom: string; image?: string };
  categorie?: { id: number; nom: string; slug: string };
  modules: Module[];
}

const levelColors: Record<string, string> = {
  DEBUTANT: 'bg-green-100 text-green-700 border-green-200',
  INTERMEDIAIRE: 'bg-orange-100 text-orange-700 border-orange-200',
  AVANCE: 'bg-red-100 text-red-700 border-red-200',
};

const TriangleLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={`${className} text-red-600`} viewBox="0 0 100 100" fill="currentColor">
    <polygon points="50,15 15,85 85,85" className="fill-none stroke-red-600 stroke-[6]" />
    <polygon points="50,30 28,75 72,75" className="fill-none stroke-slate-900 stroke-[4]" />
    <polygon points="50,45 40,65 60,65" className="fill-red-600" />
  </svg>
);

export default function CertificationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [cert, setCert] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    apiFetch('/users/me/profile').then(() => {
      setIsConnected(true);
    }).catch(() => {
      setIsConnected(false);
    });
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiFetch(`/certifications/slug/${slug}`)
      .then((data) => {
        setCert(data);
        setExpandedModules({});
      })
      .catch((err) => setError(err.message || 'Certification introuvable'))
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleModule = (id: number) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">

      {/* BARRE DE NAVIGATION CAPSULE GLASSMORPHIC */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <TriangleLogo className="w-7 h-7" />
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-950 uppercase">
              Ethical Data Security
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/[0.04] border border-slate-200/80 rounded-full px-3 py-1.5 shadow-sm backdrop-blur-xl">
            <Link href="/#about" className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-650 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 hover:shadow-xs">
              Qui Sommes-Nous
            </Link>
            <Link href="/certifications" className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-blue-600 bg-white shadow-xs rounded-full transition-all duration-200">
              Certifications
            </Link>
            <Link href="/#services" className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-650 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 hover:shadow-xs">
              Nos Services
            </Link>
            <Link href="/#testimonials" className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-650 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 hover:shadow-xs">
              Avis
            </Link>
            <Link href="/#faq" className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-650 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 hover:shadow-xs">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {!mounted ? (
              <div className="flex items-center gap-3">
                <div className="w-[80px] h-[36px]" />
                <div className="w-[110px] h-[40px] rounded-xl bg-slate-200 animate-pulse" />
              </div>
            ) : isConnected ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-650 hover:to-blue-750 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer hover:scale-105 active:scale-95"
              >
                Mon Espace
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-blue-600 transition-colors cursor-pointer">
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-slate-950 cursor-pointer rounded-xl bg-slate-100/80 border border-slate-200/80"
              aria-label="Menu mobile"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl overflow-hidden"
            >
              <nav className="flex flex-col p-4 gap-1 text-xs font-black uppercase tracking-widest">
                <Link href="/#about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Qui Sommes-Nous</Link>
                <Link href="/certifications" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-blue-600 bg-blue-50 rounded-xl font-black">Certifications</Link>
                <Link href="/#services" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Nos Services</Link>
                <Link href="/#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Avis</Link>
                <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">FAQ</Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {loading ? (
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </main>
      ) : error || !cert ? (
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-slate-500 font-semibold">{error || 'Certification introuvable'}</p>
            <Link href="/certifications" className="text-blue-600 hover:text-blue-700 font-bold text-sm">
              Voir toutes les certifications
            </Link>
          </div>
        </main>
      ) : (
    <main className="min-h-screen bg-slate-50 flex-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
          <Link href="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/certifications" className="hover:text-blue-600 transition-colors">Certifications</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700">{cert.codeExamen || cert.nom}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {cert.categorie && (
                <Link
                  href={`/certifications?categorie=${cert.categorie.slug}`}
                  className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  {cert.categorie.nom}
                </Link>
              )}
              <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg flex items-center gap-1.5">
                {cert.fournisseur.image && (
                  <img src={cert.fournisseur.image} alt="" className="w-3.5 h-3.5 rounded-full object-contain" />
                )}
                {cert.fournisseur.nom}
              </span>
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg border font-bold ${levelColors[cert.niveau] || 'bg-slate-100 text-slate-700'}`}>
                {cert.niveau}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 leading-tight mb-3">
                  {cert.codeExamen && (
                    <span className="text-blue-600">{cert.codeExamen} — </span>
                  )}
                  {cert.nom}
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                  {cert.description}
                </p>
              </div>
              {cert.image && (
                <div className="shrink-0">
                  <img src={cert.image} alt={cert.nom} className="w-32 sm:w-40 object-contain" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pb-6 border-b border-slate-100">
              {cert.dureeIndicative && (
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{cert.dureeIndicative}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>{cert.modules?.length || 0} modules</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="button"
                onClick={() => isConnected ? router.push('/dashboard/practice?cert=' + cert.slug) : router.push('/login')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                S'entrainer
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/cours')}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Voir les cours
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            {cert.objectifs && cert.objectifs.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
                <h2 className="text-lg font-black text-slate-950 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Objectifs
                </h2>
                <ul className="space-y-2">
                  {cert.objectifs.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cert.prerequis && cert.prerequis.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
                <h2 className="text-lg font-black text-slate-950 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Prerequis
                </h2>
                <ul className="space-y-2">
                  {cert.prerequis.map((pr, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      {pr}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cert.modules && cert.modules.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
                <h2 className="text-lg font-black text-slate-950 mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Programme de la certification
                </h2>
                <div className="space-y-3">
                  {cert.modules.map((mod, i) => (
                    <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <span className="font-bold text-sm text-slate-900">{mod.titre}</span>
                            {mod.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                            )}
                          </div>
                        </div>
                        <motion.svg
                          animate={{ rotate: expandedModules[mod.id] ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-4 h-4 text-slate-400 shrink-0"
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </motion.svg>
                      </button>
                      {mod.sousModules && mod.sousModules.length > 0 && (
                        <motion.div
                          initial={false}
                          animate={{ height: expandedModules[mod.id] ? 'auto' : 0, opacity: expandedModules[mod.id] ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-1.5">
                            {mod.sousModules.map((sub) => (
                              <div key={sub.id} className="flex items-center gap-2.5 pl-10 py-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                <span className="text-sm text-slate-700">{sub.titre}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-black text-slate-950 mb-3">Certification</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Code</span>
                  <span className="font-bold text-slate-900">{cert.codeExamen || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Niveau</span>
                  <span className="font-bold text-slate-900 uppercase">{cert.niveau}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Editeur</span>
                  <span className="font-bold text-slate-900">{cert.fournisseur.nom}</span>
                </div>
                {cert.dureeIndicative && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duree</span>
                    <span className="font-bold text-slate-900">{cert.dureeIndicative}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Modules</span>
                  <span className="font-bold text-slate-900">{cert.modules?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white">
              <h3 className="text-sm font-black mb-2">Pret pour l'examen ?</h3>
              <p className="text-xs text-blue-200 mb-4">
                Teste tes connaissances avec nos QCM et simulations.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-2.5 bg-white text-blue-700 font-black rounded-xl text-xs hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
      )}

      <Footer />
    </div>
  );
}
