"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../../../../../lib/api';
import {
  BookOpen, Clock, ChevronLeft, CheckCircle, FileText,
  Download, ExternalLink, Award,
  ArrowLeft, ArrowRight, Trophy,
  Video, Link as LinkIcon
} from '@/components/icons';
import { motion } from 'framer-motion';
import { useToast } from '../../../../../context/ToastContext';

interface Module {
  id: string; titre: string; description?: string; contenu?: string; ordre: number;
  dureeEstimee?: number; videoUrl?: string; ressources: Ressource[];
}

interface Ressource {
  id: string; titre: string; description?: string; type: string; url: string; taille?: number;
}

interface ProgressionModule {
  moduleId: string; titre: string; completed: boolean; dateCompletion: string | null;
}

export default function ApprendrePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const coursId = params.id as string;
  const fromParam = searchParams.get('from') || 'mes-cours';

  const [cours, setCours] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progressions, setProgressions] = useState<ProgressionModule[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [progressionGlobale, setProgressionGlobale] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [courseSimulation, setCourseSimulation] = useState<any>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [coursData, progData] = await Promise.all([
          apiFetch(`/cours/${coursId}`),
          apiFetch(`/cours/${coursId}/modules/progression`),
        ]);
        setCours(coursData);
        setModules(coursData.modules || []);
        setProgressions(progData);

        if (coursData.modules?.length > 0) {
          const firstIncomplete = coursData.modules.find((m: Module) => {
            const prog = progData.find((p: ProgressionModule) => p.moduleId === m.id);
            return !prog?.completed;
          });
          setActiveModuleId(firstIncomplete?.id || coursData.modules[0].id);
        }

        const completedCount = progData.filter((p: ProgressionModule) => p.completed).length;
        const total = coursData.modules?.length || 1;
        setProgressionGlobale(Math.round((completedCount / total) * 100));

        try {
          const sim = await apiFetch(`/simulations/cours/${coursId}`, { method: 'GET' });
          setCourseSimulation(sim);
        } catch { /* pas de simulation */ }
      } catch (err: any) {
        showToast("Impossible de charger le cours.", "error");
        router.push('/dashboard/cours');
      } finally { setLoading(false); }
    })();
  }, [coursId]);

  const activeModule = modules.find(m => m.id === activeModuleId);
  const activeProgression = progressions.find(p => p.moduleId === activeModuleId);
  const activeIndex = activeModule ? modules.indexOf(activeModule) : -1;
  const completedCount = progressions.filter(p => p.completed).length;
  const totalModules = modules.length;
  const isAllCompleted = completedCount >= totalModules && totalModules > 0;

  const renderedContent = React.useMemo(() => {
    if (!activeModule?.contenu) return '';
    return renderMarkdown(activeModule.contenu);
  }, [activeModule?.id, activeModule?.contenu]);

  const handleComplete = async () => {
    if (!activeModuleId || activeProgression?.completed) return;
    setCompleting(true);
    try {
      const res = await apiFetch(`/cours/${coursId}/modules/${activeModuleId}/complete`, { method: 'POST' });
      setProgressions(prev =>
        prev.map(p =>
          p.moduleId === activeModuleId
            ? { ...p, completed: true, dateCompletion: new Date().toISOString() }
            : p
        )
      );
      setProgressionGlobale(res.progression);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      showToast("Module marqué comme terminé !", "success");
    } catch (err: any) {
      showToast(err.message || "Erreur lors de la complétion.", "error");
    } finally { setCompleting(false); }
  };

  const [completingNext, setCompletingNext] = useState(false);
  const handleCompleteAndNext = async () => {
    if (!activeModuleId || activeProgression?.completed || completingNext) return;
    setCompletingNext(true);
    try {
      await apiFetch(`/cours/${coursId}/modules/${activeModuleId}/complete`, { method: 'POST' });
      setProgressions(prev =>
        prev.map(p =>
          p.moduleId === activeModuleId
            ? { ...p, completed: true, dateCompletion: new Date().toISOString() }
            : p
        )
      );
      showToast("Module marqué comme terminé !", "success");
      navigateModule('next');
    } catch (err: any) {
      showToast(err.message || "Erreur lors de la complétion.", "error");
    } finally { setCompletingNext(false); }
  };

  useEffect(() => {
    const mainContainer = document.querySelector('.flex-1.flex.flex-col.h-screen.overflow-y-auto');
    if (!mainContainer) return;
    const handleLayoutScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = mainContainer;
      const total = scrollHeight - clientHeight;
      if (total > 0) setReadingProgress(Math.min((scrollTop / total) * 100, 100));
    };
    mainContainer.addEventListener('scroll', handleLayoutScroll);
    return () => mainContainer.removeEventListener('scroll', handleLayoutScroll);
  }, [coursId, activeModuleId]);

  const navigateModule = useCallback((direction: 'prev' | 'next') => {
    if (!activeModule) return;
    const idx = modules.indexOf(activeModule);
    const next = direction === 'next' ? idx + 1 : idx - 1;
    if (next >= 0 && next < modules.length) {
      setActiveModuleId(modules[next].id);
      const mainContainer = document.querySelector('.flex-1.flex.flex-col.h-screen.overflow-y-auto');
      if (mainContainer) mainContainer.scrollTop = 0;
      setReadingProgress(0);
    }
  }, [activeModule, modules]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigateModule('next');
      if (e.key === 'ArrowLeft') navigateModule('prev');
      if (e.key === 'f') setFocusMode(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateModule]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <span className="w-10 h-10 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-500">Chargement du cours...</p>
      </div>
    );
  }

  if (!cours) return null;

  return (
    <div className={`relative ${focusMode ? 'fixed inset-0 z-50 bg-[#020617]' : ''}`}>
      <ConfettiExplosion active={showConfetti} />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-800/50">
        <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 transition-all duration-300"
          style={{ width: `${readingProgress}%` }} />
      </div>

      <div className={`transition-all duration-300 ${focusMode ? 'max-w-4xl mx-auto mt-8' : ''}`}>
        {/* Hero */}
        <div className="relative bg-[#020617] border-b border-slate-800/40">
          <div className="max-w-full mx-auto px-10 pt-8 pb-20">
            <button onClick={() => router.push(`/dashboard/cours?tab=${fromParam}`)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white font-bold transition-colors cursor-pointer mb-6">
              <ChevronLeft className="w-3.5 h-3.5" /> Retour aux cours
            </button>
            <div className="flex items-start gap-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded">{cours.certification?.fournisseur?.nom || 'Général'}</span>
                  <span>{cours.certification?.nom || 'Certification'}</span>
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">{cours.titre}</h1>
                {cours.description && (
                  <p className="text-sm text-slate-400 font-medium mt-2 max-w-2xl">{cours.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {cours.dureeEstimee || '?'} min</span>
                  <span className="text-slate-700">•</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {modules.length} module{modules.length > 1 ? 's' : ''}</span>
                  {completedCount > 0 && (
                    <>
                      <span className="text-slate-700">•</span>
                      <span className="flex items-center gap-1 text-emerald-400">{completedCount}/{totalModules} terminés</span>
                    </>
                  )}
                  {cours.formateur && (
                    <>
                      <span className="text-slate-700">•</span>
                      <span className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-blue-950/30 text-cyan-400 border border-blue-900/30 flex items-center justify-center text-[8px] font-black overflow-hidden">
                          {cours.formateur.avatar ? (
                            <img src={cours.formateur.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (cours.formateur.prenom?.[0] || 'F')}
                        </div>
                        Par {cours.formateur.prenom} {cours.formateur.nom}
                      </span>
                    </>
                  )}
                </div>
                {completedCount > 0 && (
                  <div className="mt-4 max-w-md">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-700"
                        style={{ width: `${progressionGlobale}%` }} />
                    </div>
                  </div>
                )}
              </div>
              {cours.imageUrl && (
                <div className="shrink-0 w-[280px] h-[180px] rounded-2xl overflow-hidden border border-slate-800/60 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <img src={cours.imageUrl} alt={cours.titre} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline with numbered circles */}
        <div className="bg-[#020617] border-b border-slate-800/60">
          <div className="max-w-full mx-auto px-10 py-5">
            <div className="relative flex items-center justify-center gap-0 max-w-6xl mx-auto">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-slate-800 rounded-full" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-[width] duration-500"
                style={{ width: modules.length > 1 ? `calc(${(activeIndex / (modules.length - 1)) * 100}% - 0px)` : '0%' }} />

              <div className="relative flex justify-between items-center w-full">
                {modules.map((m, idx) => {
                  const prog = progressions.find(p => p.moduleId === m.id);
                  const isActive = m.id === activeModuleId;
                  const isCompleted = prog?.completed;
                  const isHovered = idx === hoveredIdx;
                  return (
                    <div key={m.id} className="flex flex-col items-center relative">
                      <button
                        onClick={() => { setActiveModuleId(m.id); if (contentRef.current) contentRef.current.scrollTop = 0; setReadingProgress(0); }}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className={`w-12 h-12 rounded-full border-[3px] font-black text-base flex items-center justify-center transition-[color,background-color,border-color,box-shadow,transform] duration-300 hover:scale-110 active:scale-95 shadow-md cursor-pointer relative z-30 ${
                          isCompleted
                            ? 'border-emerald-500 bg-emerald-600 text-white ring-8 ring-emerald-950/50'
                            : isActive
                              ? 'border-blue-600 bg-blue-600 text-white ring-8 ring-blue-950/50'
                              : 'border-slate-800 bg-[#020617] text-slate-500 hover:border-cyan-500 hover:text-cyan-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                      </button>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">
                        Module {String(idx + 1).padStart(2, '0')}
                      </span>
                      {isCompleted && (
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider mt-1">Terminé</span>
                      )}

                      {isHovered && (
                        <div
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                          className="absolute bottom-[72px] left-1/2 -translate-x-1/2 w-64 bg-[#080d1a] border border-slate-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 z-50 text-left transition-opacity duration-150"
                        >
                          <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#080d1a] border-r border-b border-slate-700 rotate-45" />
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Module {idx + 1}</span>
                            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {m.dureeEstimee || '?'} min
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-white leading-snug">{m.titre}</h4>
                          {m.description && <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-2">{m.description}</p>}
                          {m.ressources?.length > 0 && (
                            <p className="text-[10px] text-slate-500 font-semibold mt-2">{m.ressources.length} ressource{m.ressources.length > 1 ? 's' : ''}</p>
                          )}
                          {isCompleted && (
                            <p className="text-[10px] text-emerald-500 font-black mt-2">✓ Terminé</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Module content */}
        <div ref={contentRef} className="max-w-full mx-auto px-10 py-10 flex flex-col gap-8" style={{ overflowAnchor: 'none' }}>
          {activeModule ? (
            <>
              {activeModule.videoUrl && (
                <div className="w-full bg-black rounded-2xl overflow-hidden"
                  style={{ aspectRatio: '16/9', transform: 'translateZ(0)', willChange: 'transform', contain: 'paint' }}>
                  <iframe src={activeModule.videoUrl} title={activeModule.titre}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              )}

              {activeModule.contenu ? (
                <div
                  className="prose prose-sm max-w-none
                    prose-headings:text-white prose-headings:font-black
                    prose-p:text-slate-400 prose-p:font-medium prose-p:leading-relaxed
                    prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-white
                    prose-code:text-cyan-300 prose-code:bg-blue-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs
                    prose-pre:bg-[#080d1a] prose-pre:text-slate-300 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:shadow-md
                    prose-li:text-slate-400 prose-li:font-medium
                    prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-950/20 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:text-slate-300 prose-blockquote:font-medium
                    prose-table:border-collapse prose-table:border prose-table:border-slate-800 prose-th:bg-slate-900 prose-th:text-slate-300 prose-th:font-bold prose-th:text-xs
                    prose-td:border prose-td:border-slate-800 prose-td:text-sm"
                  dangerouslySetInnerHTML={{ __html: renderedContent }} />
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Aucun contenu textuel pour ce module.</p>
                </div>
              )}

              {activeModule.ressources?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Ressources téléchargeables ({activeModule.ressources.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeModule.ressources.map((r, i) => (
                      <div key={r.id}
                        className="bg-[#020617] border border-slate-800 rounded-xl p-4 flex items-start gap-3 hover:border-slate-700 transition-[border-color] duration-200">
                        {(() => {
                          const imgMap: Record<string, string> = {
                            PDF: '/logos/pdf.webp', SLIDE: '/logos/slides.png',
                            EXERCICE: '/logos/exercice.png', DATASET: '/logos/dataset.png',
                          };
                          const iconMap: Record<string, React.ReactNode> = {
                            VIDEO: <Video className="w-5 h-5" />,
                            LIEN_EXTERNE: <LinkIcon className="w-5 h-5" />,
                          };
                          const bgMap: Record<string, string> = {
                            PDF: 'bg-blue-950/40', SLIDE: 'bg-amber-950/40',
                            EXERCICE: 'bg-indigo-950/40', DATASET: 'bg-green-950/40',
                            VIDEO: 'bg-purple-950/40', LIEN_EXTERNE: 'bg-blue-950/40',
                          };
                          if (imgMap[r.type]) {
                            return <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bgMap[r.type] || 'bg-slate-800'}`}>
                              <img src={imgMap[r.type]} alt={r.type} className="w-5 h-5 object-contain" />
                            </span>;
                          }
                          const iconEl = iconMap[r.type] || <FileText className="w-5 h-5" />;
                          const bg = bgMap[r.type] || 'bg-slate-800';
                          return <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>{iconEl}</span>;
                        })()}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-bold text-white truncate">{r.titre}</h4>
                          {r.description && (
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-2">{r.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <a href={r.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                              {r.type === 'LIEN_EXTERNE' ? <><ExternalLink className="w-3 h-3" /> Ouvrir</> : <><Download className="w-3 h-3" /> Télécharger</>}
                            </a>
                            {r.taille && <span className="text-[9px] text-slate-500 font-semibold">{formatSize(r.taille)}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button onClick={() => navigateModule('prev')}
                  disabled={activeIndex <= 0}
                  className="px-4 py-2 text-slate-400 hover:text-white bg-[#020617] border border-slate-800 hover:border-slate-700 text-xs font-black rounded-xl transition-[color,background-color,border-color] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" /> Précédent
                </button>

                <div className="flex items-center gap-2">
                  {!activeProgression?.completed && (
                    <button onClick={handleComplete} disabled={completing}
                      className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5 ${
                        activeIndex === modules.length - 1
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}>
                      {completing ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><CheckCircle className="w-3.5 h-3.5" /> {activeIndex === modules.length - 1 ? 'Terminer le module' : 'Marquer terminé'}</>
                      )}
                    </button>
                  )}
                  {activeProgression?.completed && (
                    <div className="px-3 py-2 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-emerald-500 text-xs font-black flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Complété
                    </div>
                  )}
                  {activeIndex < modules.length - 1 ? (
                    activeProgression?.completed && !completingNext ? (
                      <button onClick={() => navigateModule('next')}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-[background-color] cursor-pointer inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                        Suivant <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button onClick={handleCompleteAndNext} disabled={completingNext || activeProgression?.completed}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-[background-color] cursor-pointer inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.2)] disabled:opacity-50">
                        {completingNext ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><CheckCircle className="w-3.5 h-3.5" /> Suivant & terminer</>
                        )}
                      </button>
                    )
                  ) : activeProgression?.completed && (
                    <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl px-4 py-2 text-emerald-500 text-xs font-black flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-500" /> Félicitations — Fin du cours
                    </div>
                  )}
                </div>
              </div>

              {/* Fin du cours - celebration */}
              {isAllCompleted && activeIndex === modules.length - 1 && (
                <div className="bg-[#020617] border border-emerald-900/50 rounded-2xl p-8 text-white text-center space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-emerald-900/10 blur-[100px] pointer-events-none" />
                  <div className="relative z-10">
                    <Trophy className="w-16 h-16 mx-auto text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  </div>
                  <h2 className="text-2xl font-black relative z-10">Félicitations !</h2>
                  <p className="text-base text-slate-400 font-medium max-w-lg mx-auto relative z-10">
                    Vous avez terminé tous les modules de <strong className="text-white">{cours.titre}</strong>.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
                    <button onClick={() => router.push('/dashboard/cours')}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-black rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-md">
                      <BookOpen className="w-4 h-4" /> Voir mes cours
                    </button>
                    {courseSimulation && (
                      <button onClick={() => router.push(`/dashboard/practice?course=${cours.slug}`)}
                        className="px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-black rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <Award className="w-4 h-4" /> Passer la simulation
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 py-24">
              <BookOpen className="w-12 h-12 text-slate-800 mb-3" />
              <p className="text-sm font-semibold">Aucun module disponible.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── Confetti ───── */
function ConfettiExplosion({ active }: { active: boolean }) {
  if (!active) return null;
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.5, color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 8, rotation: Math.random() * 360,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div key={p.id}
          initial={{ opacity: 1, x: '50vw', y: '50vh', scale: 0, rotate: 0 }}
          animate={{ opacity: 0, x: `${p.x}vw`, y: '120vh', scale: 1.5, rotate: p.rotation + 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ position: 'absolute', width: p.size, height: p.size, backgroundColor: p.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px' }} />
      ))}
    </div>
  );
}

/* ───── Markdown Renderer ───── */
function renderMarkdown(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = escaped.split('\n');
  const html: string[] = [];
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const closing = lines.indexOf('```', i + 1);
      if (closing !== -1) { html.push(`<pre><code>${lines.slice(i + 1, closing).join('\n')}</code></pre>`); i = closing; continue; }
    }
    const tableMatch = line.match(/^\|(.+)\|$/);
    if (tableMatch) {
      const cells = tableMatch[1].split('|').map(c => c.trim());
      if (cells.every(c => /^[-:\s]+$/.test(c))) continue;
      const nextLine = lines[i + 1];
      if (nextLine && /^\|[-:\s|]+\|$/.test(nextLine)) {
        html.push('<table><thead><tr>' + cells.map(c => `<th>${processInline(c)}</th>`).join('') + '</tr></thead><tbody>');
        i++;
        while (i + 1 < lines.length) { const dl = lines[i + 1]; if (!/^\|(.+)\|$/.test(dl)) break; i++; html.push('<tr>' + dl.slice(1, -1).split('|').map(c => `<td>${processInline(c.trim())}</td>`).join('') + '</tr>'); }
        html.push('</tbody></table>');
        continue;
      }
    }
    if (/^\{\{ressource:/.test(line.trim())) {
      const match = line.trim().match(/\{\{ressource:(.+?):(.+?):(.+?)\}\}/);
      if (match) {
        const [, resTitle, resType, resUrl] = match;
        const colors: Record<string, string> = { PDF: 'bg-blue-950/20 border-blue-900/50 text-cyan-400 hover:bg-blue-950/40', VIDEO: 'bg-purple-950/20 border-purple-900/50 text-purple-500 hover:bg-purple-950/40', SLIDE: 'bg-amber-950/20 border-amber-900/50 text-amber-500 hover:bg-amber-950/40', DATASET: 'bg-green-950/20 border-green-900/50 text-green-500 hover:bg-green-950/40', LIEN_EXTERNE: 'bg-blue-950/20 border-blue-900/50 text-blue-500 hover:bg-blue-950/40', EXERCICE: 'bg-indigo-950/20 border-indigo-900/50 text-indigo-500 hover:bg-indigo-950/40' };
        const icons: Record<string, string> = { PDF: '📄', VIDEO: '▶️', SLIDE: '📊', DATASET: '🗄️', LIEN_EXTERNE: '🔗', EXERCICE: '💻' };
        html.push(`<div class="my-4 inline-block"><a href="${resUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[resType] || 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'} transition-all duration-200 shadow-sm hover:shadow-md no-underline !text-inherit"><span class="text-lg">${icons[resType] || '📎'}</span><div class="flex flex-col"><span class="text-xs font-bold">${resTitle}</span><span class="text-[9px] font-semibold opacity-70">${resType} — ${resType === 'LIEN_EXTERNE' ? 'Ouvrir' : resType === 'EXERCICE' ? "Faire l'exercice" : 'Télécharger'}</span></div></a></div>`);
        continue;
      }
    }
    const bqMatch = line.match(/^>\s*(.+)/);
    if (bqMatch) {
      const bqLines: string[] = [bqMatch[1]];
      while (i + 1 < lines.length && lines[i + 1].startsWith('>')) { bqLines.push(lines[i + 1].slice(1).trim()); i++; }
      html.push(`<blockquote><p>${bqLines.map(l => processInline(l)).join('<br/>')}</p></blockquote>`);
      continue;
    }
    const hMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (hMatch) { html.push(`<h${hMatch[1].length}>${processInline(hMatch[2])}</h${hMatch[1].length}>`); continue; }
    const lMatch = line.match(/^[-*]\s+(.+)/);
    if (lMatch) { if (!inList) { html.push('<ul>'); inList = true; } html.push(`<li>${processInline(lMatch[1])}</li>`); continue; }
    if (inList) { html.push('</ul>'); inList = false; }
    const nlMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (nlMatch) { html.push(`<p class="flex items-baseline gap-2"><span class="w-5 h-5 rounded-full bg-blue-950/30 text-cyan-400 border border-blue-900/30 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">${nlMatch[1]}</span><span>${processInline(nlMatch[2])}</span></p>`); continue; }
    if (!line.trim()) continue;
    html.push(`<p>${processInline(line)}</p>`);
  }
  if (inList) html.push('</ul>');
  return html.join('\n');
}

function processInline(text: string): string {
  return text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/✅/g, '<span class="text-emerald-500">✅</span>').replace(/❌/g, '<span class="text-cyan-400">❌</span>');
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}
