"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../../../../../lib/api';
import {
    BookOpen, Clock, ChevronLeft, CheckCircle, Circle, FileText,
    Download, ExternalLink, Award, CheckCheck,
    Maximize2, Minimize2, ChevronRight, Trophy,
    ArrowLeft, ArrowRight, ListOrdered
} from '@/components/icons';
import { useToast } from '../../../../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Module {
    id: string;
    titre: string;
    description?: string;
    contenu?: string;
    ordre: number;
    dureeEstimee?: number;
    videoUrl?: string;
    ressources: Ressource[];
}

interface Ressource {
    id: string;
    titre: string;
    description?: string;
    type: string;
    url: string;
    taille?: number;
}

interface ProgressionModule {
    moduleId: string;
    titre: string;
    completed: boolean;
    dateCompletion: string | null;
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
            } finally {
                setLoading(false);
            }
        })();
    }, [coursId]);

    const activeModule = modules.find(m => m.id === activeModuleId);
    const activeProgression = progressions.find(p => p.moduleId === activeModuleId);
    const activeIndex = activeModule ? modules.indexOf(activeModule) : -1;
    const completedCount = progressions.filter(p => p.completed).length;
    const totalModules = modules.length;
    const isAllCompleted = completedCount >= totalModules && totalModules > 0;

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
        } finally {
            setCompleting(false);
        }
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
        } finally {
            setCompletingNext(false);
        }
    };

    const handleScroll = useCallback(() => {
        if (!contentRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100);
        setReadingProgress(progress);
    }, []);

    const navigateModule = useCallback((direction: 'prev' | 'next') => {
        if (!activeModule) return;
        const idx = modules.indexOf(activeModule);
        const next = direction === 'next' ? idx + 1 : idx - 1;
        if (next >= 0 && next < modules.length) {
            setActiveModuleId(modules[next].id);
            if (contentRef.current) contentRef.current.scrollTop = 0;
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

            <div className={`min-h-[80vh] flex flex-col lg:flex-row gap-0 bg-[#080d1a] rounded-3xl overflow-hidden border border-slate-800 shadow-sm relative ${focusMode ? 'max-w-4xl mx-auto mt-8' : ''}`}>
                {/* Sidebar */}
                <aside className={`w-full lg:w-80 shrink-0 bg-[#080d1a] border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col ${focusMode ? 'lg:w-64' : ''}`}>
                    <div className="p-5 border-b border-slate-800 space-y-3">
                        <button onClick={() => router.push(`/dashboard/cours?tab=${fromParam}`)}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-white transition-colors cursor-pointer">
                            <ChevronLeft className="w-3.5 h-3.5" /> Retour
                        </button>

                        <div>
                            <h2 className="text-sm font-black text-white leading-tight line-clamp-2">{cours.titre}</h2>
                            <p className="text-[10px] font-semibold text-slate-400 mt-1">{cours.certification?.nom || ''}</p>
                            {cours.formateur && (
                                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-semibold">
                                    <div className="w-5 h-5 rounded-full bg-blue-950/30 text-cyan-400 border border-blue-900/30 flex items-center justify-center text-[8px] font-black shrink-0">
                                        {cours.formateur.avatar ? (
                                            <img src={cours.formateur.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            cours.formateur.prenom?.[0] || 'F'
                                        )}
                                    </div>
                                    <span>Par {cours.formateur.prenom} {cours.formateur.nom}</span>
                                </div>
                            )}
                        </div>

                        {/* Progression globale */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-slate-500">Progression</span>
                                <span className={`${progressionGlobale === 100 ? 'text-emerald-500' : 'text-cyan-400'}`}>
                                    {completedCount}/{totalModules} modules
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                                <motion.div
                                    className={`h-full rounded-full transition-all duration-700 ${progressionGlobale === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressionGlobale}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Liste des modules */}
                    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                        {modules.map((m, idx) => {
                            const prog = progressions.find(p => p.moduleId === m.id);
                            const isActive = m.id === activeModuleId;
                            const isCompleted = prog?.completed;
                            return (
                                <motion.button
                                    key={m.id}
                                    onClick={() => { setActiveModuleId(m.id); if (contentRef.current) contentRef.current.scrollTop = 0; setReadingProgress(0); }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 group relative ${isActive
                                        ? 'bg-blue-950/20 border border-blue-900/50 shadow-sm'
                                        : 'hover:bg-[#020617]/50 border border-transparent'
                                    }`}>
                                    <span className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black
                                        ${isCompleted ? 'bg-emerald-950/30 text-emerald-500 border border-emerald-900/30' :
                                            isActive ? 'bg-blue-950/40 text-cyan-400 border border-blue-900/40' :
                                                'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                        {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <span className={`text-xs font-bold block truncate ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            {m.titre}
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] text-slate-500 font-semibold flex items-center gap-0.5">
                                                <Clock className="w-2.5 h-2.5" /> {m.dureeEstimee || '?'}min
                                            </span>
                                            {m.ressources?.length > 0 && (
                                                <span className="text-[9px] text-slate-500 font-semibold">
                                                    {m.ressources.length} {m.ressources.length > 1 ? 'ress.' : 'ress.'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        {isAllCompleted ? (
                            <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-3 text-center">
                                <div className="flex items-center justify-center gap-2 text-emerald-500 text-xs font-black">
                                    <Award className="w-4 h-4" /> Cours terminé !
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-[9px] text-slate-400 font-semibold">
                                <span className="flex items-center justify-center gap-1">
                                    <ListOrdered className="w-3 h-3" />
                                    Module {activeIndex + 1} sur {modules.length}
                                </span>
                                <span className="text-[8px] text-slate-300 mt-0.5 block">
                                    Flèches ← → pour naviguer · F pour focus
                                </span>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Contenu principal */}
                <main className="flex-1 flex flex-col min-w-0 max-w-full relative">
                    {activeModule ? (
                        <>
                            {/* En-tête du module */}
                            <div className="sticky top-0 z-10 bg-[#080d1a]/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-blue-950/30 text-cyan-400 border border-blue-900/30 flex items-center justify-center text-[10px] font-black">
                                            {activeIndex + 1}
                                        </span>
                                        <h1 className="text-sm font-black text-white truncate">{activeModule.titre}</h1>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold mt-0.5">
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" />
                                            Module {activeIndex + 1} sur {modules.length}
                                        </span>
                                        {activeModule.dureeEstimee && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> ~{activeModule.dureeEstimee} min
                                            </span>
                                        )}
                                        {readingProgress > 0 && readingProgress < 100 && (
                                            <span className="text-cyan-400 font-black">{Math.round(readingProgress)}%</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => navigateModule('prev')}
                                        disabled={activeIndex <= 0}
                                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Module précédent (←)">
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleComplete}
                                        disabled={completing || activeProgression?.completed}
                                        className={`shrink-0 px-4 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5 ${activeProgression?.completed
                                            ? 'bg-emerald-950/30 text-emerald-500 border border-emerald-900/50'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                                        }`}>
                                        {completing ? (
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : activeProgression?.completed ? (
                                            <><CheckCheck className="w-3.5 h-3.5" /> Complété</>
                                        ) : (
                                            <><CheckCircle className="w-3.5 h-3.5" /> Marquer terminé</>
                                        )}
                                    </button>
                                    <button onClick={() => navigateModule('next')}
                                        disabled={activeIndex >= modules.length - 1}
                                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Module suivant (→)">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Contenu déroulant */}
                            <div ref={contentRef} onScroll={handleScroll}
                                className="flex-1 overflow-y-auto p-6 space-y-8">
                                {activeModule.videoUrl && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        className="aspect-video bg-black border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                        <iframe src={activeModule.videoUrl} title={activeModule.titre}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen />
                                    </motion.div>
                                )}

                                {activeModule.contenu ? (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                        className="bg-[#020617] border border-slate-800 rounded-2xl p-6 md:p-8">
                                        <div className="prose prose-sm max-w-none
                                            prose-headings:text-white prose-headings:font-black
                                            prose-p:text-slate-400 prose-p:font-medium prose-p:leading-relaxed
                                            prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                                            prose-strong:text-white
                                            prose-code:text-cyan-300 prose-code:bg-blue-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs
                                            prose-pre:bg-[#080d1a] prose-pre:text-slate-300 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:shadow-md
                                            prose-li:text-slate-400 prose-li:font-medium
                                            prose-blockquote:border-l-red-500 prose-blockquote:bg-blue-950/20 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:text-slate-300 prose-blockquote:font-medium
                                            prose-table:border-collapse prose-table:border prose-table:border-slate-800 prose-th:bg-slate-900 prose-th:text-slate-300 prose-th:font-bold prose-th:text-xs
                                            prose-td:border prose-td:border-slate-800 prose-td:text-sm"
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(activeModule.contenu) }} />
                                    </motion.div>
                                ) : (
                                    <div className="bg-[#020617] border border-slate-800 rounded-2xl p-12 text-center">
                                        <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-slate-500">Aucun contenu pour ce module.</p>
                                    </div>
                                )}

                                {/* Ressources */}
                                {activeModule.ressources?.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                        className="space-y-3">
                                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-cyan-400" />
                                            Ressources ({activeModule.ressources.length})
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {activeModule.ressources.map((r, i) => (
                                                <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.3 }}
                                                    className="bg-[#020617] border border-slate-800 rounded-xl p-4 flex items-start gap-3 hover:border-slate-700 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-200 group">
                                                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black uppercase
                                                        ${r.type === 'PDF' ? 'bg-blue-950/40 text-cyan-400' :
                                                            r.type === 'VIDEO' ? 'bg-purple-950/40 text-purple-500' :
                                                            r.type === 'SLIDE' ? 'bg-amber-950/40 text-amber-500' :
                                                            r.type === 'DATASET' ? 'bg-green-950/40 text-green-500' :
                                                            r.type === 'LIEN_EXTERNE' ? 'bg-blue-950/40 text-blue-500' :
                                                            r.type === 'EXERCICE' ? 'bg-indigo-950/40 text-indigo-500' :
                                                            'bg-slate-800 text-slate-400'}`}>
                                                        {r.type === 'PDF' ? 'PDF' : r.type === 'VIDEO' ? 'VID' : r.type === 'SLIDE' ? 'SLD' : r.type === 'DATASET' ? 'DAT' : r.type === 'LIEN_EXTERNE' ? 'WEB' : r.type === 'EXERCICE' ? 'EXO' : 'RES'}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[13px] font-bold text-white truncate">{r.titre}</h4>
                                                        {r.description && (
                                                            <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-2">{r.description}</p>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <a href={r.url} target="_blank" rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                                                                {r.type === 'LIEN_EXTERNE' ? (
                                                                    <><ExternalLink className="w-3 h-3" /> Ouvrir</>
                                                                ) : (
                                                                    <><Download className="w-3 h-3" /> Télécharger</>
                                                                )}
                                                            </a>
                                                            {r.taille && (
                                                                <span className="text-[9px] text-slate-500 font-semibold">{formatSize(r.taille)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Navigation inférieure */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <button onClick={() => navigateModule('prev')}
                                        disabled={activeIndex <= 0}
                                        className="px-4 py-2.5 text-slate-400 hover:text-white bg-[#020617] border border-slate-800 hover:border-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
                                        <ChevronLeft className="w-4 h-4" /> Précédent
                                    </button>
                                    {activeIndex < modules.length - 1 ? (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => { navigateModule('next'); if (contentRef.current) contentRef.current.scrollTop = 0; }}
                                                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm hover:shadow-md">
                                                Suivant <ChevronRight className="w-4 h-4" />
                                            </button>
                                            <button onClick={handleCompleteAndNext}
                                                disabled={completingNext || activeProgression?.completed}
                                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.2)] disabled:opacity-50">
                                                {completingNext ? (
                                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <><CheckCircle className="w-3.5 h-3.5" /></>
                                                )}
                                                Suivant & terminer
                                            </button>
                                        </div>
                                    ) : isAllCompleted ? (
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => router.push('/dashboard/cours')}
                                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                                <BookOpen className="w-4 h-4" /> Voir mes cours
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={handleComplete}
                                            disabled={completing || activeProgression?.completed}
                                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer disabled:opacity-60 inline-flex items-center gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            {completing ? (
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><CheckCircle className="w-4 h-4" /> Terminer le module</>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Célébration fin de cours */}
                                {isAllCompleted && activeIndex === modules.length - 1 && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", duration: 0.6 }}
                                        className="bg-[#020617] border border-emerald-900/50 rounded-2xl p-8 text-white text-center space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-emerald-900/10 blur-[100px] pointer-events-none" />
                                        <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }} className="relative z-10">
                                            <Trophy className="w-16 h-16 mx-auto text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                        </motion.div>
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
                                    </motion.div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center p-12">
                                <BookOpen className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-500">Sélectionnez un module pour commencer.</p>
                            </div>
                        </div>
                    )}
                </main>
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

/* ───── Markdown Renderer with Inline Resources ───── */
function renderMarkdown(text: string): string {
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const lines = escaped.split('\n');
    const html: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (/^```/.test(line)) {
            const closing = lines.indexOf('```', i + 1);
            if (closing !== -1) {
                html.push(`<pre><code>${lines.slice(i + 1, closing).join('\n')}</code></pre>`);
                i = closing;
                continue;
            }
        }

        // Table
        const tableMatch = line.match(/^\|(.+)\|$/);
        if (tableMatch) {
            const cells = tableMatch[1].split('|').map(c => c.trim());
            if (cells.every(c => /^[-:\s]+$/.test(c))) continue;
            const nextLine = lines[i + 1];
            if (nextLine && /^\|[-:\s|]+\|$/.test(nextLine)) {
                html.push('<table><thead><tr>' + cells.map(c => `<th>${processInline(c)}</th>`).join('') + '</tr></thead><tbody>');
                i++;
                while (i + 1 < lines.length) {
                    const dl = lines[i + 1];
                    if (!/^\|(.+)\|$/.test(dl)) break;
                    i++;
                    html.push('<tr>' + dl.slice(1, -1).split('|').map(c => `<td>${processInline(c.trim())}</td>`).join('') + '</tr>');
                }
                html.push('</tbody></table>');
                continue;
            }
        }

                // Inline resource card: {{ressource:Titre:Type:URL}}
        if (/^\{\{ressource:/.test(line.trim())) {
            const match = line.trim().match(/\{\{ressource:(.+?):(.+?):(.+?)\}\}/);
            if (match) {
                const [, resTitle, resType, resUrl] = match;
                const colors: Record<string, string> = {
                    PDF: 'bg-blue-950/20 border-blue-900/50 text-cyan-400 hover:bg-blue-950/40',
                    VIDEO: 'bg-purple-950/20 border-purple-900/50 text-purple-500 hover:bg-purple-950/40',
                    SLIDE: 'bg-amber-950/20 border-amber-900/50 text-amber-500 hover:bg-amber-950/40',
                    DATASET: 'bg-green-950/20 border-green-900/50 text-green-500 hover:bg-green-950/40',
                    LIEN_EXTERNE: 'bg-blue-950/20 border-blue-900/50 text-blue-500 hover:bg-blue-950/40',
                    EXERCICE: 'bg-indigo-950/20 border-indigo-900/50 text-indigo-500 hover:bg-indigo-950/40',
                };
                const icons: Record<string, string> = { PDF: '📄', VIDEO: '▶️', SLIDE: '📊', DATASET: '🗄️', LIEN_EXTERNE: '🔗', EXERCICE: '💻' };
                const label = resType === 'LIEN_EXTERNE' ? 'Ouvrir' : resType === 'EXERCICE' ? "Faire l'exercice" : 'Télécharger';
                html.push(`<div class="my-4 inline-block">
                    <a href="${resUrl}" target="_blank" rel="noopener noreferrer"
                        class="inline-flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[resType] || 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'} transition-all duration-200 shadow-sm hover:shadow-md no-underline !text-inherit">
                        <span class="text-lg">${icons[resType] || '📎'}</span>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold">${resTitle}</span>
                            <span class="text-[9px] font-semibold opacity-70">${resType} — ${label}</span>
                        </div>
                    </a>
                </div>`);
                continue;
            }
        }

        // Blockquote
        const bqMatch = line.match(/^>\s*(.+)/);
        if (bqMatch) {
            const bqLines: string[] = [bqMatch[1]];
            while (i + 1 < lines.length && lines[i + 1].startsWith('>')) {
                bqLines.push(lines[i + 1].slice(1).trim());
                i++;
            }
            html.push(`<blockquote><p>${bqLines.map(l => processInline(l)).join('<br/>')}</p></blockquote>`);
            continue;
        }

        const hMatch = line.match(/^(#{1,3})\s+(.+)/);
        if (hMatch) { html.push(`<h${hMatch[1].length}>${processInline(hMatch[2])}</h${hMatch[1].length}>`); continue; }

        const lMatch = line.match(/^[-*]\s+(.+)/);
        if (lMatch) {
            if (!inList) { html.push('<ul>'); inList = true; }
            html.push(`<li>${processInline(lMatch[1])}</li>`);
            continue;
        }
        if (inList) { html.push('</ul>'); inList = false; }

        const nlMatch = line.match(/^(\d+)\.\s+(.+)/);
        if (nlMatch) {
            html.push(`<p class="flex items-baseline gap-2"><span class="w-5 h-5 rounded-full bg-blue-950/30 text-cyan-400 border border-blue-900/30 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">${nlMatch[1]}</span><span>${processInline(nlMatch[2])}</span></p>`);
            continue;
        }

        if (!line.trim()) continue;
        html.push(`<p>${processInline(line)}</p>`);
    }
    if (inList) html.push('</ul>');
    return html.join('\n');
}

function processInline(text: string): string {
    return text
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/✅/g, '<span class="text-emerald-500">✅</span>')
        .replace(/❌/g, '<span class="text-cyan-400">❌</span>');
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}
