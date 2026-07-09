"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import {
    ChevronLeft, ChevronRight, BookOpen, Clock,
    FileText, Video, Download, CheckCircle, Play
} from '@/components/icons';

interface Ressource {
    id: string;
    titre: string;
    type: string;
    url: string;
    public: boolean;
}

interface Module {
    id: string;
    titre: string;
    contenu?: string;
    videoUrl?: string;
    dureeEstimee?: number;
    ordre: number;
    ressources: Ressource[];
}

interface Cours {
    id: string;
    titre: string;
    description?: string;
    statut: string;
    imageUrl?: string;
    objectifs: string[];
    dureeEstimee?: number;
    certification: {
        nom: string;
        codeExamen?: string;
    };
    formateur?: {
        prenom: string;
        nom: string;
        avatar?: string;
    };
    modules: Module[];
}

function getYouTubeEmbed(url: string): string | null {
    const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getVimeoEmbed(url: string): string | null {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

function getVideoEmbedUrl(url: string): string | null {
    return getYouTubeEmbed(url) || getVimeoEmbed(url) || url;
}

export default function CourseViewPage() {
    const params = useParams();
    const router = useRouter();
    const [cours, setCours] = useState<Cours | null>(null);
    const [activeModuleIdx, setActiveModuleIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch(`/cours/${params.id}`, { method: 'GET' });
                setCours(data);
                if (data.modules.length > 0) setActiveModuleIdx(0);
            } catch (err: any) {
                setError(err.message || 'Erreur lors du chargement.');
            } finally {
                setLoading(false);
            }
        })();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !cours) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <p className="text-sm text-slate-500 font-semibold">{error || 'Cours introuvable.'}</p>
                <button onClick={() => router.push('/dashboard/courses')}
                    className="px-4 py-2 text-xs font-black text-white bg-blue-600 rounded-xl cursor-pointer hover:bg-blue-700 transition-all">
                    Retour aux cours
                </button>
            </div>
        );
    }

    const activeModule = cours.modules[activeModuleIdx];
    const embedUrl = activeModule?.videoUrl ? getVideoEmbedUrl(activeModule.videoUrl) : null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-72 shrink-0 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-5 border-b border-slate-100">
                    <button onClick={() => router.push('/dashboard/courses')}
                        className="flex items-center gap-1.5 text-xs text-slate-400 font-bold cursor-pointer hover:text-slate-600 transition-colors mb-3">
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Retour
                    </button>
                    <h1 className="text-sm font-black text-slate-800 leading-tight">{cours.titre}</h1>
                    {cours.description && (
                        <p className="text-[11px] text-slate-400 font-semibold mt-1 line-clamp-2">{cours.description}</p>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {cours.modules.map((m, idx) => (
                        <button key={m.id} onClick={() => setActiveModuleIdx(idx)}
                            className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                                idx === activeModuleIdx
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'hover:bg-slate-50 border border-transparent'
                            }`}>
                            <div className="flex items-start gap-2.5">
                                <span className={`mt-0.5 w-5 h-5 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 ${
                                    idx === activeModuleIdx
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {idx + 1}
                                </span>
                                <div className="min-w-0">
                                    <p className={`text-xs font-bold truncate ${
                                        idx === activeModuleIdx ? 'text-blue-800' : 'text-slate-700'
                                    }`}>
                                        {m.titre}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {m.dureeEstimee || '?'} min
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-black text-blue-600 shrink-0">
                            {cours.formateur
                                ? `${cours.formateur.prenom[0]}${cours.formateur.nom[0]}`
                                : '?'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-600 truncate">
                                {cours.formateur
                                    ? `${cours.formateur.prenom} ${cours.formateur.nom}`
                                    : 'Formateur'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold">{cours.certification.nom}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-6 lg:p-10 space-y-8">
                    {/* Module header */}
                    <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mb-2">
                            <span>Module {activeModuleIdx + 1} sur {cours.modules.length}</span>
                            <span>·</span>
                            <span>{activeModule?.dureeEstimee || '?'} min</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-800">{activeModule?.titre}</h2>
                    </div>

                    {/* Video */}
                    {embedUrl && (
                        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                            <iframe src={embedUrl}
                                title={activeModule?.titre}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen />
                        </div>
                    )}

                    {/* Content */}
                    {activeModule?.contenu && (
                        <div className="prose prose-sm max-w-none">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-black text-slate-700">Contenu de la leçon</span>
                                </div>
                                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {activeModule.contenu}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resources */}
                    {activeModule && activeModule.ressources.length > 0 && (
                        <div>
                            <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Ressources ({activeModule.ressources.length})
                            </h3>
                            <div className="grid gap-2">
                                {activeModule.ressources.map(r => (
                                    <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-700 transition-colors">
                                                {r.titre}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-semibold">{r.type}</p>
                                        </div>
                                        <Download className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation between modules */}
                    {cours.modules.length > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                            <button disabled={activeModuleIdx === 0}
                                onClick={() => setActiveModuleIdx(p => Math.max(0, p - 1))}
                                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:text-slate-800 transition-colors">
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Module précédent
                            </button>
                            <button disabled={activeModuleIdx === cours.modules.length - 1}
                                onClick={() => setActiveModuleIdx(p => Math.min(cours.modules.length - 1, p + 1))}
                                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:text-slate-800 transition-colors">
                                Module suivant
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
